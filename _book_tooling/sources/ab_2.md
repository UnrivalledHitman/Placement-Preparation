# Chapter 4: Background Jobs and Scheduling
%Moving slow work out of the request, retrying it safely, and running it on a schedule

## 4.1 What belongs in the background

A web request should answer in well under a second. Anything slower, or anything that may fail and need retrying, moves to a **background job** processed by **workers**: sending emails and SMS, generating PDF invoices, resizing uploaded images, calling slow third-party APIs, ML inference on a batch, exporting a large CSV, recomputing a forecast. The request **enqueues** a job and returns immediately, often with **202 Accepted** and a URL where the client can check the job's status.

| Component | Role |
|---|---|
| Queue | Holds jobs: Redis lists or streams, RabbitMQ, SQS, a database table |
| Workers | Processes that take jobs and execute them, scaled independently of the web tier |
| Scheduler | Enqueues jobs at times or intervals (cron expressions, delays) |
| Result/status store | Job state and progress, so clients and dashboards can follow it |

Frameworks: **Celery** (Python), **Sidekiq** (Ruby), **BullMQ** (Node), Spring `@Async` and `@Scheduled`, **Quartz** and **JobRunr** (Java), **Kubernetes Jobs and CronJobs**, **Temporal** for long, multi-step workflows.

## 4.2 A reliable queue: never lose a job when a worker dies

The naive Redis queue (`LPUSH` to enqueue, `BRPOP` to take) loses a job if the worker crashes after taking it. The **reliable queue** pattern atomically **moves** the job to a per-worker `processing` list (`LMOVE`/`BLMOVE`); the worker removes it from there only when finished. A **reaper** periodically moves jobs that have been in `processing` too long back to the queue.

```python run A reliable queue with a crashing worker and a reaper
import json, time
from backlab import redis_server
with redis_server() as r:
    for i in range(1, 5):
        r.lpush('jobs', json.dumps({'id': i, 'task': 'invoice', 'meter': f'SM-{i}'}))
    done = []
    def work(worker, crash_on=None):
        while (raw := r.lmove('jobs', f'processing:{worker}', 'RIGHT', 'LEFT')) is not None:
            job = json.loads(raw)
            r.hset('started', raw, time.time())
            if job['id'] == crash_on:
                print(f'{worker} crashed while processing job {job["id"]}')
                return                          # the job stays in processing:<worker>
            done.append(job['id'])
            r.lrem(f'processing:{worker}', 1, raw)        # acknowledge
            r.hdel('started', raw)
    work('w1', crash_on=2)
    print('queue:', r.llen('jobs'), '| stuck in processing:w1:', r.llen('processing:w1'))
    time.sleep(0.3)
    def reap(timeout=0.2):
        moved = 0
        for key in r.scan_iter('processing:*'):
            for raw in r.lrange(key, 0, -1):
                if time.time() - float(r.hget('started', raw)) > timeout:
                    r.lrem(key, 1, raw); r.rpush('jobs', raw); moved += 1
        return moved
    print('reaper returned', reap(), 'job(s) to the queue')
    work('w2')
    print('completed jobs:', sorted(done))
```

Job 2 was not lost: it waited in `processing:w1` until the reaper requeued it, and worker `w2` completed it. As with messages, this is at-least-once: if `w1` had actually finished job 2 before dying, it would run twice, so **jobs must be idempotent** (Section 2.4).

## 4.3 Retries with exponential back-off and a delayed queue

Transient failures (a timeout from the email provider) deserve a retry, but not immediately and not forever. A **delayed queue** is a Redis sorted set scored by the time a job becomes due; a small scheduler loop moves due jobs to the ready queue. Each failure re-schedules the job after `base × 2^attempt` seconds (plus jitter), up to a maximum number of attempts, after which it goes to a dead-letter list.

```python run Retry with back-off: a job that fails twice, then succeeds
import json
from backlab import redis_server
with redis_server() as r:
    clock = {'now': 0.0}                                   # simulated time, in seconds
    calls = {}
    def send_sms(job):                                      # fails on the first two attempts
        calls[job['id']] = calls.get(job['id'], 0) + 1
        if calls[job['id']] <= 2:
            raise TimeoutError('SMS gateway timeout')
    def enqueue(job, delay=0.0):
        r.zadd('delayed', {json.dumps(job): clock['now'] + delay})
    def tick():
        for raw in r.zrangebyscore('delayed', 0, clock['now']):    # due jobs become ready
            r.zrem('delayed', raw); r.rpush('ready', raw)
        while (raw := r.lpop('ready')) is not None:
            job = json.loads(raw)
            try:
                send_sms(job)
                print(f't={clock["now"]:5.1f}s job {job["id"]} '
                      f'attempt {job["attempt"]}: sent')
            except TimeoutError as e:
                if job['attempt'] >= 5:
                    r.rpush('dead', raw); continue
                delay = 2 * 2 ** job['attempt']                    # 2, 4, 8, 16 s
                print(f't={clock["now"]:5.1f}s job {job["id"]} attempt {job["attempt"]}: '
                      f'{e}; retry in {delay} s')
                enqueue({**job, 'attempt': job['attempt'] + 1}, delay)
    enqueue({'id': 'otp-1', 'attempt': 0})
    while r.zcard('delayed') or r.llen('ready'):
        tick(); clock['now'] += 0.5
```

## 4.4 Scheduled jobs across many instances

A `@Scheduled(cron = "0 0 2 * * *")` method in a service running on three instances fires **three times**. For jobs that must run once per schedule (billing, report emails), the instances must agree on who runs it: a lock per **schedule slot**, a leader election, or a dedicated scheduler (Kubernetes CronJob with `concurrencyPolicy: Forbid`, Quartz with a JDBC job store in cluster mode, ShedLock).

```python run Three instances fire the nightly job; a per-slot lock makes exactly one run it
from backlab import redis_server
with redis_server() as r:
    runs = []
    def nightly_billing(instance, slot):
        key = f'job:billing:{slot}'                       # one key per scheduled occurrence
        if r.set(key, instance, nx=True, ex=6 * 3600):
            runs.append((slot, instance))
            return f'{instance}: running billing for {slot}'
        return f'{instance}: skipped, {r.get(key)} already ran {slot}'
    for slot in ['2026-03-01T02:00', '2026-03-02T02:00']:
        for instance in ['api-1', 'api-2', 'api-3']:       # all three fire at the same time
            print(nightly_billing(instance, slot))
print('billing runs:', runs)
```

Keying the lock by the occurrence (not just the job name) means a run that finishes early cannot allow a second instance to start the same night's run afterwards; the TTL is long enough to cover clock differences between instances.

## 4.5 Long jobs: status, progress and cancellation

For a job the user is waiting for (an export, a report), store its state and progress, and let the client poll or receive a push (Chapter 5).

```python run 202 Accepted, a status resource, and progress updates
import json, threading, time, urllib.request
from backlab import redis_server, http_server, QuietHandler
with redis_server() as r:
    def export_job(job_id):
        for pct in (25, 50, 75, 100):
            time.sleep(0.1)                                  # one chunk of work
            r.hset(f'job:{job_id}', mapping={'progress': pct,
                   'state': 'done' if pct == 100 else 'running'})
        r.hset(f'job:{job_id}', 'result', f'/downloads/{job_id}.csv')
    class Api(QuietHandler):
        def do_POST(self):
            job_id = f'exp-{r.incr("job:seq")}'
            r.hset(f'job:{job_id}', mapping={'state': 'queued', 'progress': 0})
            threading.Thread(target=export_job, args=(job_id,)).start()   # a worker, really
            self.send_response(202); self.send_header('Location', f'/jobs/{job_id}')
            self.end_headers()
        def do_GET(self):
            body = json.dumps(r.hgetall('job:' + self.path.rsplit('/', 1)[1])).encode()
            self.send_response(200); self.end_headers(); self.wfile.write(body)
    with http_server(Api) as base:
        req = urllib.request.Request(base + '/exports', method='POST')
        resp = urllib.request.urlopen(req)
        location = resp.headers['Location']
        print('POST /exports ->', resp.status, 'Location:', location)
        seen = []
        while True:
            state = json.loads(urllib.request.urlopen(base + location).read())
            if not seen or seen[-1] != int(state['progress']):
                seen.append(int(state['progress']))
            if state['state'] == 'done' and 'result' in state:
                break
            time.sleep(0.05)
        print('progress observed:', seen, '| result:', state['result'])
```

For very long, multi-step processes (onboarding a customer across five systems, a loan approval), a **workflow engine** such as Temporal persists each step's state, so a crash resumes from the last completed step rather than starting again.

## 4.6 Spring equivalents and practical lessons

| Concept | Spring / Java |
|---|---|
| Run a method asynchronously | `@EnableAsync`, `@Async` with a bounded `ThreadPoolTaskExecutor` |
| Periodic and cron jobs | `@EnableScheduling`, `@Scheduled(cron = ...)`; ShedLock for "once per cluster" |
| Persistent, distributed jobs | Quartz (JDBC job store, clustered), JobRunr, Spring Batch for large batch processing |
| Queue-backed workers | `@RabbitListener` / `@KafkaListener` consumers |

- Return 202 and do slow or failure-prone work in workers; make every job idempotent.
- Use a reliable queue (atomic move to processing, acknowledge on completion, requeue on timeout).
- Retry transient errors with exponential back-off and jitter; cap attempts; dead-letter the rest.
- In a cluster, cron fires on every instance: lock per occurrence or use a cluster-aware scheduler.
- Expose job status and progress; use a workflow engine for long multi-step processes.

# Chapter 5: Real-time Communication
%Polling, long polling, Server-Sent Events and WebSockets, and scaling them

## 5.1 The options

HTTP is request–response: the server cannot speak first. Four ways to get updates to the browser:

| Technique | How | Latency | Cost | Use for |
|---|---|---|---|---|
| Short polling | Client asks every N seconds | Up to N s | Many empty requests | Rarely changing data; simplest |
| Long polling | Request stays open until there is news (or a timeout), then the client asks again | Low | One held connection per client; reconnect per message | Legacy fallback |
| **Server-Sent Events (SSE)** | One long HTTP response streaming `text/event-stream` messages; the browser's `EventSource` reconnects automatically and resumes with `Last-Event-ID` | Low | One connection per client; **server → client only** | Live dashboards, notifications, progress, LLM token streaming |
| **WebSockets** | HTTP upgrade to a full-duplex, message-oriented TCP connection | Lowest | Stateful connections; needs care with proxies and scaling | Chat, multiplayer, collaborative editing, trading |

Choose the simplest that works: SSE covers most "server pushes updates" needs and works over plain HTTP (including HTTP/2 multiplexing); WebSockets when the client also sends a stream of messages.

## 5.2 Server-Sent Events

The format is plain text: lines `id: ...`, `event: ...`, `data: ...`, separated by a blank line. The server keeps the response open and writes events as they happen.

```python run An SSE endpoint streaming meter readings, and resuming with Last-Event-ID
import json, time, urllib.request
from backlab import http_server, QuietHandler
READINGS = [{'meter': 'SM-42', 'kwh': round(3.1 + 0.2 * i, 1)} for i in range(6)]
class Stream(QuietHandler):
    def do_GET(self):
        start = int(self.headers.get('Last-Event-ID', -1)) + 1   # resume after the last seen
        self.send_response(200)
        self.send_header('Content-Type', 'text/event-stream')
        self.send_header('Cache-Control', 'no-cache')
        self.end_headers()
        self.wfile.write(b'retry: 2000\n\n')                        # client reconnect delay
        for i in range(start, len(READINGS)):
            msg = f'id: {i}\nevent: reading\ndata: {json.dumps(READINGS[i])}\n\n'
            self.wfile.write(msg.encode()); self.wfile.flush()
            time.sleep(0.05)
def consume(base, last_id=None, stop_after=None):
    headers = {'Accept': 'text/event-stream'}
    if last_id is not None:
        headers['Last-Event-ID'] = str(last_id)
    events, current = [], {}
    req = urllib.request.Request(base + '/stream', headers=headers)
    with urllib.request.urlopen(req) as resp:
        print('Content-Type:', resp.headers['Content-Type'])
        for raw in resp:
            line = raw.decode().rstrip('\n')
            if not line:                                            # blank line ends an event
                if 'data' in current:
                    events.append(current)
                    if stop_after and len(events) == stop_after:
                        break
                current = {}
                continue
            field, _, value = line.partition(': ')
            current[field] = value
    return events
with http_server(Stream) as base:
    first = consume(base, stop_after=3)                             # connection drops after 3
    print('received', [(e['id'], json.loads(e['data'])['kwh']) for e in first])
    rest = consume(base, last_id=first[-1]['id'])                   # automatic reconnect
    print('after reconnecting with Last-Event-ID', first[-1]['id'], ':',
          [(e['id'], json.loads(e['data'])['kwh']) for e in rest])
```

No reading was lost or repeated across the dropped connection, because the client sent the last id it had processed and the server resumed after it. In the browser this is automatic: `new EventSource('/stream')` reconnects and sends `Last-Event-ID` itself.

## 5.3 WebSockets

A WebSocket starts as an HTTP request with `Upgrade: websocket`; the server answers **101 Switching Protocols**, and from then on both sides send framed messages (text or binary) at any time, with ping/pong frames to detect dead connections.

```python run A WebSocket server: subscriptions, broadcasts and a client that sends commands
import asyncio, json
import websockets
async def main():
    subscribers = {}                                        # websocket -> set of meter ids
    async def handler(ws):
        subscribers[ws] = set()
        try:
            async for raw in ws:                            # messages FROM the client
                msg = json.loads(raw)
                if msg['type'] == 'subscribe':
                    subscribers[ws].add(msg['meter'])
                    await ws.send(json.dumps({'type': 'ack', 'meter': msg['meter']}))
        finally:
            del subscribers[ws]
    async def publish(meter, kwh):                 # called when a reading arrives
        for ws, meters in list(subscribers.items()):
            if meter in meters:
                await ws.send(json.dumps({'type': 'reading', 'meter': meter, 'kwh': kwh}))
    async with websockets.serve(handler, '127.0.0.1', 0) as server:
        port = server.sockets[0].getsockname()[1]
        async def client(name, meters, expect):
            async with websockets.connect(f'ws://127.0.0.1:{port}') as ws:
                for m in meters:
                    await ws.send(json.dumps({'type': 'subscribe', 'meter': m}))
                got = [json.loads(await ws.recv()) for _ in range(len(meters) + expect)]
                pong = await ws.ping(); await pong
                print(f'{name}: ' + ', '.join(f"{g['type']}:{g['meter']}" +
                      (f"={g['kwh']}" if 'kwh' in g else '') for g in got), '| ping ok')
        async def readings():
            await asyncio.sleep(0.2)                         # let clients subscribe first
            for meter, kwh in [('SM-1', 3.2), ('SM-2', 1.1), ('SM-1', 3.4)]:
                await publish(meter, kwh)
        await asyncio.gather(client('dashboard', ['SM-1', 'SM-2'], 3),
                             client('mobile', ['SM-2'], 1), readings())
asyncio.run(main())
```

Each client received acknowledgements for its own subscriptions and only the readings it asked for. A production protocol adds authentication on connect (a token in the first message or a cookie; browsers cannot set custom headers on WebSocket connections), message types with versions, back-pressure for slow clients, and reconnection with resubscription on the client.

## 5.4 Scaling real-time connections

Each server instance holds its own connections. When a reading arrives at instance B, a client connected to instance A must still get it. The usual solution is a **pub/sub backplane**: every instance subscribes to a shared channel (Redis Pub/Sub, Kafka, NATS) and forwards messages to its local connections.

```python run Two WebSocket instances sharing events through Redis Pub/Sub
import asyncio, json
import websockets, redis.asyncio as aioredis
from backlab import redis_server
async def main(port):
    async def instance(name, ready):
        local = set()
        async def handler(ws):
            local.add(ws)
            try:
                await ws.wait_closed()
            finally:
                local.discard(ws)
        sub = aioredis.Redis(port=port, decode_responses=True).pubsub()
        await sub.subscribe('readings')
        async def forward():                                  # Redis -> local connections
            async for msg in sub.listen():
                if msg['type'] == 'message':
                    for ws in list(local):
                        await ws.send(f'{name} forwards {msg["data"]}')
        server = await websockets.serve(handler, '127.0.0.1', 0)
        ready[name] = server.sockets[0].getsockname()[1]
        task = asyncio.create_task(forward())
        return server, task, sub
    ready = {}
    a = await instance('instance-A', ready)
    b = await instance('instance-B', ready)
    pub = aioredis.Redis(port=port, decode_responses=True)
    async with websockets.connect(f'ws://127.0.0.1:{ready["instance-A"]}') as on_a, \
               websockets.connect(f'ws://127.0.0.1:{ready["instance-B"]}') as on_b:
        await asyncio.sleep(0.1)
        event = json.dumps({'meter': 'SM-7', 'kwh': 2.5})
        await pub.publish('readings', event)          # published by any instance or service
        print('client on A:', await on_a.recv())
        print('client on B:', await on_b.recv())
    for server, task, sub in (a, b):
        task.cancel(); server.close(); await sub.aclose()
    await pub.aclose()
with redis_server() as r:
    asyncio.run(main(r.connection_pool.connection_kwargs['port']))
```

Other scaling concerns: load balancers must support long-lived connections and the upgrade (sticky sessions are needed only if state lives in the instance); file-descriptor and memory limits per instance (each connection costs a socket and buffers); a **heartbeat** to detect half-open connections; and graceful shutdown that tells clients to reconnect elsewhere. Managed services (AWS API Gateway WebSockets, Pusher, Ably, Azure SignalR) handle connection fan-out for you.

## 5.5 Spring equivalents and practical lessons

| Concept | Spring |
|---|---|
| SSE | `SseEmitter` (MVC) or `Flux<ServerSentEvent<T>>` (WebFlux) |
| WebSockets | `spring-websocket` with STOMP over WebSocket, `@MessageMapping`, `SimpMessagingTemplate` |
| Multi-instance fan-out | STOMP broker relay to RabbitMQ, or Redis Pub/Sub listeners |

- Prefer SSE for server-to-client streams (auto reconnect, `Last-Event-ID`, plain HTTP); WebSockets for two-way messaging.
- Authenticate connections, validate every incoming message, and filter what each client may receive.
- Scale with a pub/sub backplane; add heartbeats, limits and graceful reconnects.
