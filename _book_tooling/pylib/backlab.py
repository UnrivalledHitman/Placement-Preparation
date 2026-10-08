"""Helpers for the advanced back-end book: a private Redis server per example, free ports,
and a tiny threaded HTTP server. Imported by python run blocks (pylib is on PYTHONPATH)."""
import contextlib, socket, subprocess, tempfile, threading, time
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler


def free_port():
    with socket.socket() as s:
        s.bind(('127.0.0.1', 0))
        return s.getsockname()[1]


@contextlib.contextmanager
def redis_server(*extra):
    """Start redis-server on a free port with no persistence; yield a client (str replies)."""
    import redis
    port = free_port()
    workdir = tempfile.mkdtemp(prefix='redis-')
    proc = subprocess.Popen(['redis-server', '--port', str(port), '--bind', '127.0.0.1',
                             '--save', '', '--appendonly', 'no', '--dir', workdir, *extra],
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    client = redis.Redis(port=port, decode_responses=True)
    for _ in range(200):
        try:
            client.ping(); break
        except Exception:
            time.sleep(0.02)
    try:
        yield client
    finally:
        client.close()
        proc.terminate(); proc.wait()


@contextlib.contextmanager
def http_server(handler_cls):
    """Serve handler_cls on a free port in a background thread; yield the base URL."""
    port = free_port()
    srv = ThreadingHTTPServer(('127.0.0.1', port), handler_cls)
    srv.daemon_threads = True
    t = threading.Thread(target=srv.serve_forever, daemon=True)
    t.start()
    try:
        yield f'http://127.0.0.1:{port}'
    finally:
        srv.shutdown(); srv.server_close()


class QuietHandler(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass
