"""Preview project URLs at /CLC-case/, catching accidental root-relative paths."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit, unquote
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--root', type=Path, required=True)
parser.add_argument('--port', type=int, default=8891)
args = parser.parse_args()

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(args.root.resolve()), **k)
    def do_GET(self):
        self.route(False)
    def do_HEAD(self):
        self.route(True)
    def route(self, head):
        path = urlsplit(self.path).path
        if any(segment.startswith('.') and segment != '.nojekyll' for segment in unquote(path).split('/') if segment):
            self.send_error(404)
            return
        if path == '/':
            self.send_response(302)
            self.send_header('Location', '/CLC-case/')
            self.end_headers()
            return
        if not path.startswith('/CLC-case/'):
            self.send_error(404)
            return
        self.path = self.path.replace('/CLC-case/', '/', 1)
        if head:
            super().do_HEAD()
        else:
            super().do_GET()
    def list_directory(self, path):
        self.send_error(404)

class Server(ThreadingHTTPServer):
    allow_reuse_address = False

print(f'http://127.0.0.1:{args.port}/CLC-case/', flush=True)
Server(('127.0.0.1', args.port), Handler).serve_forever()
