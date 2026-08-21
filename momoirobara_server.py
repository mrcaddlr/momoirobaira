#!/usr/bin/env python3
import json
import sys
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parent
STATE = ROOT / 'momoirobara-data.json'
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8787

DEFAULT_STATE = {
    'version': 2,
    'updatedAt': datetime.now(timezone.utc).isoformat(),
    'settings': {'theme':'sakura','animations':'full','fx':'on','density':'normal','volume':0.8,'lastfm':{}},
    'playlists': [],
    'memory': {'currentSongId':None,'currentPlaylist':None,'currentPage':'home'},
    'library': []
}

if not STATE.exists():
    STATE.write_text(json.dumps(DEFAULT_STATE, ensure_ascii=False, indent=2), encoding='utf-8')

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def _send_json(self, code, obj):
        data = json.dumps(obj, ensure_ascii=False, indent=2).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        path = self.path.split('?',1)[0]
        if path == '/api/health':
            self._send_json(200, {
                'ok': True,
                'service': 'momoirobara',
                'port': PORT,
                'root': str(ROOT),
                'state': str(STATE),
                'time': datetime.now(timezone.utc).isoformat()
            })
            return
        if path == '/api/state':
            try:
                obj = json.loads(STATE.read_text('utf-8')) if STATE.exists() else DEFAULT_STATE
                self._send_json(200, obj)
            except Exception as e:
                self._send_json(500, {'ok':False, 'error':str(e)})
            return
        super().do_GET()

    def do_POST(self):
        path = self.path.split('?',1)[0]
        if path != '/api/state':
            self.send_error(404)
            return
        try:
            length = int(self.headers.get('Content-Length','0'))
            if length <= 0 or length > 25 * 1024 * 1024:
                self._send_json(413, {'ok':False,'error':'invalid state size'})
                return
            obj = json.loads(self.rfile.read(length).decode('utf-8'))
            if not isinstance(obj, dict):
                raise ValueError('state must be a JSON object')
            obj['version'] = 2
            obj['updatedAt'] = datetime.now(timezone.utc).isoformat()
            tmp = STATE.with_name(STATE.name + '.tmp')
            tmp.write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding='utf-8')
            tmp.replace(STATE)
            self._send_json(200, {'ok':True, 'updatedAt':obj['updatedAt'], 'state':str(STATE)})
        except Exception as e:
            self._send_json(400, {'ok':False,'error':str(e)})

    def log_message(self, fmt, *args):
        pass

if __name__ == '__main__':
    try:
        ThreadingHTTPServer(('127.0.0.1', PORT), Handler).serve_forever()
    except KeyboardInterrupt:
        pass
