#!/usr/bin/env python3
"""
Simple HTTP server for WIM Fleetbase frontend preview.
Run: python3 serve.py
Then open: http://localhost:8080
"""

import http.server
import socketserver
import os, sys

PORT = 8081
DIR = os.path.expanduser('~/projects/wim-fleetbase/frontend')

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIR, **kwargs)

    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {args[0]} {args[1]} {args[2]}")

print(f"\n{'='*50}")
print(f"  WIM Fleetbase Frontend Server")
print(f"  Serving: {DIR}")
print(f"  URL: http://localhost:{PORT}")
print(f"  Pages:")
for f in sorted(os.listdir(DIR)):
    if f.endswith('.html'):
        print(f"    http://localhost:{PORT}/{f}")
print(f"{'='*50}\n")

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...")
        httpd.server_close()