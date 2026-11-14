#!/usr/bin/env python3
"""
ZAR & ARZ 3D • Main Application Server
"""

import http.server
import socketserver
import urllib.parse
import json
import threading
import time
import sys
import os
from datetime import datetime

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import PORT, HOST, FRONTEND_DIR, SYNC_INTERVAL_SECONDS
from database.db_manager import DatabaseManager
from services.tgju_service import TGJUService

db = DatabaseManager()

def background_sync_worker():
  """Background daemon that periodically syncs rates from TGJU"""
  while True:
    try:
      rates = TGJUService.fetch_latest_rates()
      if rates:
        for asset_id, price in rates.items():
          db.update_asset_price(asset_id, price)
        print(f"[{datetime.now().strftime('%H:%M:%S')}] TGJU sync: {len(rates)} assets updated in SQLite.")
    except Exception as e:
      pass
    time.sleep(SYNC_INTERVAL_SECONDS)

class AppRequestHandler(http.server.SimpleHTTPRequestHandler):
  def __init__(self, *args, **kwargs):
    super().__init__(*args, directory=FRONTEND_DIR, **kwargs)

  def end_headers(self):
    self.send_header('Access-Control-Allow-Origin', '*')
    self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
    super().end_headers()

  def do_OPTIONS(self):
    self.send_response(200)
    self.end_headers()

  def do_GET(self):
    parsed = urllib.parse.urlparse(self.path)
    path = parsed.path

    # API 1: /api/rates
    if path == '/api/rates':
      rates = db.get_all_rates()
      payload = {
        "status": "success",
        "updatedAt": datetime.now().isoformat(),
        "database": "SQLite (market.db)",
        "source": "شبکه اطلاع‌رسانی طلا و ارز (TGJU.org)",
        "rates": rates
      }
      data_bytes = json.dumps(payload, ensure_ascii=False).encode('utf-8')
      self.send_response(200)
      self.send_header('Content-Type', 'application/json; charset=utf-8')
      self.send_header('Content-Length', str(len(data_bytes)))
      self.end_headers()
      self.wfile.write(data_bytes)
      return

    # API 2: /api/history
    elif path == '/api/history':
      query = urllib.parse.parse_qs(parsed.query)
      asset_id = query.get('asset', ['gold18k'])[0]
      limit = int(query.get('limit', [50])[0])
      history = db.get_asset_history(asset_id, limit)
      
      data_bytes = json.dumps({"asset": asset_id, "history": history}).encode('utf-8')
      self.send_response(200)
      self.send_header('Content-Type', 'application/json; charset=utf-8')
      self.send_header('Content-Length', str(len(data_bytes)))
      self.end_headers()
      self.wfile.write(data_bytes)
      return

    # Default: Serve static files from frontend/
    return super().do_GET()

  def do_POST(self):
    parsed = urllib.parse.urlparse(self.path)
    if parsed.path == '/api/sync':
      rates = TGJUService.fetch_latest_rates()
      if rates:
        for asset_id, price in rates.items():
          db.update_asset_price(asset_id, price)
      
      current_rates = db.get_all_rates()
      payload = {
        "status": "success" if rates else "cached",
        "message": "همگام‌سازی با موفقیت انجام شد." if rates else "داده‌های ذخیره شده در پایگاه‌داده ارائه شد.",
        "rates": current_rates
      }
      data_bytes = json.dumps(payload, ensure_ascii=False).encode('utf-8')
      self.send_response(200)
      self.send_header('Content-Type', 'application/json; charset=utf-8')
      self.send_header('Content-Length', str(len(data_bytes)))
      self.end_headers()
      self.wfile.write(data_bytes)
      return

    self.send_error(404, "Endpoint not found")

def main():
  print("=" * 65)
  print("🪙 ZAR & ARZ 3D • Unified Clean Architecture Server")
  print("=" * 65)

  # Start background worker
  worker = threading.Thread(target=background_sync_worker, daemon=True)
  worker.start()
  print(f"✅ Background TGJU sync worker running (every {SYNC_INTERVAL_SECONDS}s).")

  # Start HTTP Server
  socketserver.TCPServer.allow_reuse_address = True
  with socketserver.TCPServer((HOST, PORT), AppRequestHandler) as httpd:
    print(f"🚀 Frontend running at: http://localhost:{PORT}/index.html")
    print(f"📡 REST API available at: http://localhost:{PORT}/api/rates")
    print("=" * 65)
    try:
      httpd.serve_forever()
    except KeyboardInterrupt:
      print("\nShutting down server...")

if __name__ == "__main__":
  main()
