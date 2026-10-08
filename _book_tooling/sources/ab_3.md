# Chapter 6: Files and Object Storage
%Where uploaded files really go, presigned URLs, multipart uploads and processing pipelines

## 6.1 Why not in the database, and why not on the server's disk

Storing images, PDFs and CSV exports as BLOBs in MySQL bloats backups, slows replication and wastes expensive database I/O. Storing them on the application server's disk breaks as soon as there are two instances (the file is on the other one) or the instance is replaced (containers have ephemeral disks).

**Object storage** (Amazon S3, Google Cloud Storage, Azure Blob Storage, and S3-compatible MinIO or Cloudflare R2) is the standard answer: a flat namespace of **buckets** containing **objects** addressed by a **key** (`meters/SM-42/photos/2026-03-02.jpg`), each with metadata (`Content-Type`, size, custom tags) and an **ETag** (a hash of the content). It is very durable (S3 is designed for 99.999999999%, "eleven nines"), effectively unlimited, cheap per gigabyte, served over HTTPS, and fronted by a CDN for downloads. The database stores only the **key** and metadata.

| Feature | Use |
|---|---|
| Storage classes | Hot (standard), infrequent access, archive (Glacier): lifecycle rules move old objects automatically |
| Versioning | Keep previous versions; protects against overwrites and ransomware |
| Server-side encryption | SSE-S3 or SSE-KMS keys (the security guide covers key management) |
| Multipart upload | Upload large files in parallel parts (5 MB–5 GB each), retry only failed parts |
| Event notifications | "Object created" triggers a queue message or function (thumbnails, virus scans) |
| Presigned URLs | Time-limited permission to upload or download one object without credentials |

## 6.2 Presigned URLs: let clients upload directly

Routing a 200 MB upload through your API servers wastes their bandwidth and memory, and ties up a request thread for minutes. Instead:

1. The client asks the API: "I want to upload `bill.pdf`, 2 MB, `application/pdf`."
2. The API checks the user's permission and the declared type and size, chooses the object key, and returns a **presigned URL**: the storage URL plus an **expiry time** and a **signature**, an HMAC computed with a secret that only the API and the storage service know, over the method, key, expiry and constraints.
3. The client `PUT`s the file straight to object storage with that URL.
4. The storage service recomputes the signature and rejects the request if anything was changed, if it has expired, or if the content breaks the signed constraints.
5. The storage service emits an event (or the client confirms); the API records the upload and triggers processing.

The program below implements a miniature object store and signer to show exactly what is checked. (Real S3 uses the AWS Signature Version 4 scheme, which signs the same kinds of fields; SDKs generate the URLs with `generate_presigned_url` or `S3Presigner`.)

```python run A mini object store that verifies presigned URLs: expiry, tampering and limits
import hashlib, hmac, time, urllib.parse, urllib.request, urllib.error
from backlab import http_server, QuietHandler
SECRET = b'shared-secret-known-to-api-and-storage'
OBJECTS = {}
def sign(method, key, expires, max_bytes, content_type):
    msg = f'{method}\n{key}\n{expires}\n{max_bytes}\n{content_type}'.encode()
    return hmac.new(SECRET, msg, hashlib.sha256).hexdigest()
def presign(base, method, key, ttl, max_bytes=10_000_000, content_type='application/pdf'):
    expires = int(time.time()) + ttl
    q = urllib.parse.urlencode({'expires': expires, 'max': max_bytes, 'type': content_type,
                                'sig': sign(method, key, expires, max_bytes, content_type)})
    return f'{base}/{key}?{q}'
class Storage(QuietHandler):
    def check(self, method):
        path, _, query = self.path.partition('?')
        q = dict(urllib.parse.parse_qsl(query))
        key = path.lstrip('/')
        expected = sign(method, key, q.get('expires'), q.get('max'), q.get('type'))
        if not hmac.compare_digest(expected, q.get('sig', '')):
            return key, q, (403, 'SignatureDoesNotMatch')
        if time.time() > int(q['expires']):
            return key, q, (403, 'Request has expired')
        return key, q, None
    def do_PUT(self):
        key, q, err = self.check('PUT')
        size = int(self.headers['Content-Length'])
        if not err and size > int(q['max']):
            err = (400, 'EntityTooLarge')
        if not err and self.headers['Content-Type'] != q['type']:
            err = (400, 'Content-Type not allowed by the policy')
        body = self.rfile.read(size)
        if err:
            return self.reply(*err)
        OBJECTS[key] = body
        self.reply(200, 'stored', etag=hashlib.md5(body).hexdigest())
    def do_GET(self):
        key, q, err = self.check('GET')
        if err:
            return self.reply(*err)
        self.reply(200, OBJECTS[key].decode())
    def reply(self, status, text, etag=None):
        self.send_response(status)
        if etag:
            self.send_header('ETag', f'"{etag}"')
        self.end_headers(); self.wfile.write(text.encode())
def call(url, method='GET', data=None, ctype='application/pdf'):
    req = urllib.request.Request(url, method=method, data=data,
                                 headers={'Content-Type': ctype})
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, resp.read().decode(), resp.headers.get('ETag')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode(), None
with http_server(Storage) as base:
    key = 'bills/SM-42/2026-03.pdf'
    up = presign(base, 'PUT', key, ttl=60, max_bytes=1000)
    print('upload:              ', call(up, 'PUT', b'%PDF-1.7 bill for March'))
    print('download (presigned):', call(presign(base, 'GET', key, ttl=60))[:2])
    print('tampered key:        ', call(up.replace('SM-42', 'SM-99'), 'PUT', b'x')[:2])
    print('too large:           ', call(up, 'PUT', b'x' * 2000)[:2])
    print('wrong content type:  ', call(up, 'PUT', b'<html>', ctype='text/html')[:2])
    expired = presign(base, 'GET', key, ttl=-1)
    print('expired link:        ', call(expired)[:2])
```

Everything the API decided (which key, which type, how large, until when) is bound into the signature; changing any of it, or using the link late, is rejected by the storage service without calling your API.

> TRAP: The signed content type is what the client **claims**. A file named `bill.pdf` can contain HTML or an executable. Check the real content after upload (magic bytes, a virus scan), store user files on a separate domain or with `Content-Disposition: attachment`, and never serve user uploads from your main origin, where uploaded HTML could run scripts with your cookies.

## 6.3 Processing pipeline and access patterns

A typical upload pipeline: the object-created event → a queue → workers that scan for malware, validate the format, extract text, generate thumbnails or previews, and update the database (`status: ready`). Until then, the file is marked `pending` and not shown to other users.

| Decision | Recommendation |
|---|---|
| Object keys | Never the raw user file name (collisions, path tricks, PII); use ids: `tenant/123/uploads/<uuid>.pdf`, keep the original name as metadata |
| Access | Buckets private by default; downloads through short-lived presigned GET URLs or a CDN with signed cookies |
| Big files | Multipart upload; resumable on unreliable networks |
| Images | Store the original once; create sizes asynchronously or on the fly with an image CDN |
| Deletion | Soft delete plus lifecycle rules; remember backups and versions for "right to erasure" requests |
| Costs | Storage per GB-month, requests, and especially **egress**; serve through a CDN |

## 6.4 Spring equivalents and practical lessons

| Concept | Java / Spring |
|---|---|
| S3 client | AWS SDK v2 `S3Client`, `S3Presigner`; Spring Cloud AWS `S3Template` |
| Multipart upload | `S3TransferManager` |
| Upload endpoint | A controller that returns a presigned URL, not one that accepts `MultipartFile` for large files |

- Files go to object storage; the database keeps keys and metadata.
- Clients upload and download directly with short-lived presigned URLs that bind key, method, expiry, type and size.
- Treat uploads as untrusted: verify content, scan, isolate the serving domain.
- Process uploads asynchronously through events and queues.

# Chapter 7: API Styles: REST in Depth, GraphQL and gRPC
%Choosing and designing the interface between clients and services

## 7.1 REST beyond the basics

The Spring Boot guide covers resources, HTTP methods and status codes. Production APIs also need:

| Concern | Practice |
|---|---|
| Errors | One format everywhere: RFC 9457 **Problem Details** (`application/problem+json` with `type`, `title`, `status`, `detail`, plus fields) |
| Pagination | **Cursor** (keyset) pagination for large or changing collections: `?after=<opaque cursor>&limit=50`; offsets get slow and skip or repeat rows when data changes |
| Filtering and sorting | `?status=online&sort=-kwh`; allow-list fields |
| Versioning | URL (`/v2/meters`) or header; add fields freely (clients must ignore unknown ones), never remove or change meaning without a new version |
| Caching | `ETag` + `If-None-Match` → **304 Not Modified**; `Cache-Control` |
| Concurrency | `If-Match` with the ETag on `PUT`/`PATCH` → **412 Precondition Failed** if someone else changed it (optimistic locking over HTTP) |
| Long operations | 202 Accepted + status resource (Section 4.5) |
| Idempotency | `Idempotency-Key` on POST (Section 2.4) |
| Documentation | OpenAPI (Swagger), generated from code or written first |

```python run ETags for caching (304) and for safe concurrent updates (412)
import hashlib, json, urllib.request, urllib.error
from backlab import http_server, QuietHandler
METER = {'id': 'SM-42', 'tariff': 'T2', 'version': 1}
def etag(obj):
    digest = hashlib.sha256(json.dumps(obj, sort_keys=True).encode()).hexdigest()
    return f'"{digest[:16]}"'
class Api(QuietHandler):
    def do_GET(self):
        tag = etag(METER)
        if self.headers.get('If-None-Match') == tag:
            self.send_response(304); self.send_header('ETag', tag); self.end_headers(); return
        body = json.dumps(METER).encode()
        self.send_response(200); self.send_header('ETag', tag); self.end_headers()
        self.wfile.write(body)
    def do_PUT(self):
        if self.headers.get('If-Match') != etag(METER):
            problem = {'type': '/errors/stale-update', 'status': 412,
                       'title': 'The meter was modified by someone else'}
            self.send_response(412)
            self.send_header('Content-Type', 'application/problem+json')
            self.end_headers()
            self.wfile.write(json.dumps(problem).encode())
            return
        METER.update(json.loads(self.rfile.read(int(self.headers['Content-Length']))))
        METER['version'] += 1
        self.send_response(200); self.send_header('ETag', etag(METER)); self.end_headers()
def req(base, method='GET', headers=None, body=None):
    r = urllib.request.Request(base + '/meters/SM-42', method=method, headers=headers or {},
                               data=json.dumps(body).encode() if body else None)
    try:
        with urllib.request.urlopen(r) as resp:
            return resp.status, resp.headers['ETag'], len(resp.read())
    except urllib.error.HTTPError as e:
        return e.code, e.headers['ETag'], e.read().decode()
with http_server(Api) as base:
    status, tag, size = req(base)
    print('first GET:', status, tag, f'{size} bytes')
    print('GET with If-None-Match:', req(base, headers={'If-None-Match': tag})[:2],
          '(no body sent)')
    priya = req(base, 'PUT', {'If-Match': tag}, {'tariff': 'T3'})
    print("Priya's PUT with If-Match:", priya[0])
    arjun = req(base, 'PUT', {'If-Match': tag}, {'tariff': 'T1'})    # loaded before Priya
    print("Arjun's PUT with the old ETag:", arjun[0], arjun[2])
print('final state:', METER)
```

Arjun had loaded the meter before Priya's change; his update, sent with the old ETag, was refused with 412 and a problem-details body, instead of silently overwriting her change (a **lost update**, as in the JDBC guide, but across HTTP).

## 7.2 GraphQL

**GraphQL** exposes one endpoint and a **typed schema**; the client sends a query naming exactly the fields it wants, possibly across related objects, and gets exactly that shape back. It solves **over-fetching** (REST returns fields the mobile app does not need) and **under-fetching** (a screen needs `/users/1`, then `/users/1/meters`, then each meter's readings: many round trips). Mutations change data; subscriptions push updates.

```python run A GraphQL schema executed by graphql-core, and the N+1 problem it creates
from graphql import (GraphQLSchema, GraphQLObjectType, GraphQLField, GraphQLString,
                     GraphQLFloat, GraphQLList, GraphQLNonNull, GraphQLArgument, graphql_sync)
DB = {'users': {'u1': {'id': 'u1', 'name': 'Priya', 'meters': ['SM-1', 'SM-2', 'SM-3']}},
      'meters': {f'SM-{i}': {'id': f'SM-{i}', 'city': 'Kolkata', 'kwh': 10.0 + i}
                 for i in range(1, 4)}}
QUERIES = []                                               # every "SQL" call made
def load_meter(mid):
    QUERIES.append(f'SELECT * FROM meter WHERE id = {mid!r}')
    return DB['meters'][mid]
Meter = GraphQLObjectType('Meter', {
    'id': GraphQLField(GraphQLNonNull(GraphQLString)),
    'city': GraphQLField(GraphQLString),
    'kwh': GraphQLField(GraphQLFloat)})
User = GraphQLObjectType('User', {
    'name': GraphQLField(GraphQLString),
    'meters': GraphQLField(GraphQLList(Meter),
                           resolve=lambda u, info: [load_meter(m) for m in u['meters']])})
schema = GraphQLSchema(GraphQLObjectType('Query', {
    'user': GraphQLField(User, args={'id': GraphQLArgument(GraphQLNonNull(GraphQLString))},
                         resolve=lambda _, info, id: DB['users'].get(id))}))
result = graphql_sync(schema, '{ user(id: "u1") { name meters { id kwh } } }')
print('data:', result.data)
print('queries issued:', len(QUERIES), '<- one per meter: the N+1 problem')
bad = graphql_sync(schema, '{ user(id: "u1") { name salary } }')
print('validation error:', bad.errors[0].message)
```

The client asked for `id` and `kwh` only and received exactly those, in one request. The schema rejected an unknown field before executing anything. But the naive resolver loaded meters one by one; for a list of 100 users with 10 meters each that becomes 1,000 queries. The fix is **batching**: a **DataLoader** collects all the ids requested in one execution step and loads them with a single query.

```python run Batching resolvers with a DataLoader: one query instead of N
import asyncio
from graphql import (GraphQLSchema, GraphQLObjectType, GraphQLField, GraphQLString,
                     GraphQLFloat, GraphQLList, graphql)
METERS = {f'SM-{i}': {'id': f'SM-{i}', 'kwh': 10.0 + i} for i in range(1, 7)}
USERS = [{'name': 'Priya', 'meters': ['SM-1', 'SM-2', 'SM-3']},
         {'name': 'Arjun', 'meters': ['SM-4', 'SM-5']}, {'name': 'Meera', 'meters': ['SM-6']}]
QUERIES = []
class DataLoader:                                   # the essence of the DataLoader pattern
    def __init__(self, batch_fn):
        self.batch_fn, self.pending = batch_fn, {}
    def load(self, key):
        loop = asyncio.get_running_loop()
        if not self.pending:
            loop.call_soon(lambda: asyncio.ensure_future(self.dispatch()))
        fut = self.pending.setdefault(key, loop.create_future())
        return fut
    async def dispatch(self):
        batch, self.pending = self.pending, {}
        values = await self.batch_fn(list(batch))
        for key, value in zip(batch, values):
            batch[key].set_result(value)
async def load_meters(ids):
    QUERIES.append(f'SELECT * FROM meter WHERE id IN ({", ".join(map(repr, ids))})')
    return [METERS[i] for i in ids]
Meter = GraphQLObjectType('Meter', {'id': GraphQLField(GraphQLString),
                                    'kwh': GraphQLField(GraphQLFloat)})
User = GraphQLObjectType('User', {
    'name': GraphQLField(GraphQLString),
    'meters': GraphQLField(GraphQLList(Meter), resolve=lambda u, info: asyncio.gather(
        *[info.context['meters'].load(m) for m in u['meters']]))})
schema = GraphQLSchema(GraphQLObjectType('Query', {
    'users': GraphQLField(GraphQLList(User), resolve=lambda *_: USERS)}))
async def main():
    ctx = {'meters': DataLoader(load_meters)}         # a new loader per request
    res = await graphql(schema, '{ users { name meters { id kwh } } }', context_value=ctx)
    print('users returned:', [u['name'] for u in res.data['users']])
    print('meters returned:', sum(len(u['meters']) for u in res.data['users']))
    print('queries issued:', len(QUERIES)); print(QUERIES[0])
asyncio.run(main())
```

Six meters for three users came from **one** `IN (...)` query. Other GraphQL production concerns: limit query **depth and cost** (a malicious nested query can be enormous), use persisted queries, authorise per field, and remember that HTTP caching is harder because everything is a `POST` to one URL.

## 7.3 gRPC

**gRPC** is a high-performance RPC framework: the API is defined in a **Protocol Buffers** (`.proto`) file, code generators produce typed clients and servers in many languages, and calls travel over **HTTP/2** as compact binary messages. It supports unary calls and client, server and bidirectional **streaming**, deadlines and cancellation propagated across services. It is the common choice for **internal service-to-service** calls (and for mobile clients with gRPC libraries), while browsers need gRPC-Web or a REST/GraphQL front.

```python run A gRPC service generated from a .proto file: unary, streaming and a deadline
import os, sys, tempfile, time
from concurrent import futures
import grpc
from grpc_tools import protoc
work = tempfile.mkdtemp()
open(os.path.join(work, 'meters.proto'), 'w').write('''
syntax = "proto3";
package meters;
service MeterService {
  rpc GetMeter (MeterRequest) returns (Meter);                 // unary
  rpc StreamReadings (MeterRequest) returns (stream Reading);  // server streaming
  rpc SlowReport (MeterRequest) returns (Meter);
}
message MeterRequest { string id = 1; }
message Meter { string id = 1; string city = 2; double kwh_today = 3; }
message Reading { int64 ts = 1; double kwh = 2; }
''')
args = ['protoc', f'-I{work}', f'--python_out={work}', f'--grpc_python_out={work}',
        os.path.join(work, 'meters.proto')]
assert protoc.main(args) == 0                          # generates meters_pb2*.py
sys.path.insert(0, work)
import meters_pb2 as pb, meters_pb2_grpc as rpc
class Service(rpc.MeterServiceServicer):
    def GetMeter(self, req, ctx):
        if not req.id.startswith('SM-'):
            ctx.abort(grpc.StatusCode.INVALID_ARGUMENT, 'id must look like SM-<n>')
        return pb.Meter(id=req.id, city='Kolkata', kwh_today=12.5)
    def StreamReadings(self, req, ctx):
        for i in range(4):
            yield pb.Reading(ts=1_700_000_000 + 900 * i, kwh=0.8 + 0.1 * i)
    def SlowReport(self, req, ctx):
        time.sleep(0.5); return pb.Meter(id=req.id)
server = grpc.server(futures.ThreadPoolExecutor(max_workers=4))
rpc.add_MeterServiceServicer_to_server(Service(), server)
port = server.add_insecure_port('127.0.0.1:0'); server.start()
with grpc.insecure_channel(f'127.0.0.1:{port}') as channel:
    stub = rpc.MeterServiceStub(channel)
    m = stub.GetMeter(pb.MeterRequest(id='SM-42'))
    print('unary:', m.id, m.city, m.kwh_today,
          '| encoded size:', len(m.SerializeToString()), 'bytes')
    stream = stub.StreamReadings(pb.MeterRequest(id='SM-42'))
    print('streaming:', [round(r.kwh, 1) for r in stream])
    for bad, timeout in [('meter-1', None), ('SM-1', 0.1)]:
        try:
            call = stub.SlowReport if timeout else stub.GetMeter
            call(pb.MeterRequest(id=bad), timeout=timeout)
        except grpc.RpcError as e:
            print('error:', e.code().name, '-', e.details())
server.stop(0)
import json
as_json = json.dumps({'id': 'SM-42', 'city': 'Kolkata', 'kwh_today': 12.5})
print('the same message as JSON:', len(as_json), 'bytes')
```

The binary encoding is less than half the size of the JSON for this message, the client got typed objects, invalid input produced a standard status code, and the 100 ms **deadline** cut off the slow call on the client side (the server is told the call was cancelled, so it can stop working).

## 7.4 Choosing an API style

| | REST (JSON over HTTP) | GraphQL | gRPC |
|---|---|---|---|
| Best for | Public APIs, CRUD resources, web and third-party clients | Client-driven data needs: mobile and web apps aggregating many entities | Internal service-to-service calls, low latency, streaming |
| Contract | OpenAPI (optional) | Typed schema (required) | `.proto` (required), generated code |
| Caching | HTTP caching, CDNs, ETags work naturally | Hard at HTTP level; client caches (Apollo) | Not HTTP-cacheable |
| Payload | Text JSON | JSON, exactly the fields asked for | Compact binary protobuf |
| Streaming | SSE, WebSockets alongside | Subscriptions | Built-in, bidirectional |
| Browser support | Native | Native (HTTP POST) | Needs gRPC-Web proxy |
| Pitfalls | Over/under-fetching, chatty clients | N+1, expensive queries, authorisation per field | Debugging binary traffic, load balancing long-lived HTTP/2 connections |

A common architecture uses all three: gRPC between internal services, REST for the public API, and a GraphQL or **backend-for-frontend** layer shaping data for each client app.

## 7.5 Spring equivalents and practical lessons

| Concept | Spring |
|---|---|
| ETags | `ShallowEtagHeaderFilter`, or `ResponseEntity.ok().eTag(...)`; `@Version` for optimistic locking |
| Problem details | `ProblemDetail`, `ErrorResponseException` (Spring 6) |
| OpenAPI | springdoc-openapi |
| GraphQL | Spring for GraphQL: `@QueryMapping`, `@SchemaMapping`, `@BatchMapping` (built-in batching) |
| gRPC | grpc-java with grpc-spring-boot-starter; `protobuf-maven-plugin` for code generation |

- REST: problem details, cursor pagination, additive versioning, ETags for caching and optimistic concurrency.
- GraphQL: exact shapes in one round trip; always batch resolvers (DataLoader); limit query cost.
- gRPC: typed contracts, binary payloads, streaming and deadlines; ideal inside the platform.
