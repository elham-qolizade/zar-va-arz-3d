import sqlite3
import os
from datetime import datetime
from config import DB_PATH, TARGET_ASSETS

class DatabaseManager:
  """Handles all SQLite database connections, initialization, and queries"""

  def __init__(self, db_path=DB_PATH):
    self.db_path = db_path
    os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
    self.init_db()

  def get_connection(self):
    conn = sqlite3.connect(self.db_path)
    conn.row_factory = sqlite3.Row
    return conn

  def init_db(self):
    """Initializes tables and seeds initial data if database is new"""
    conn = self.get_connection()
    cursor = conn.cursor()

    cursor.execute("""
      CREATE TABLE IF NOT EXISTS current_rates (
        asset_id TEXT PRIMARY KEY,
        name TEXT,
        en_name TEXT,
        category TEXT,
        unit TEXT,
        symbol TEXT,
        price REAL,
        change_24h REAL,
        high_24h REAL,
        low_24h REAL,
        updated_at TIMESTAMP
      )
    """)

    cursor.execute("""
      CREATE TABLE IF NOT EXISTS price_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asset_id TEXT,
        price REAL,
        created_at TIMESTAMP
      )
    """)

    # Seed baseline assets if empty
    cursor.execute("SELECT COUNT(*) FROM current_rates")
    if cursor.fetchone()[0] == 0:
      now = datetime.now().isoformat()
      for slug, meta in TARGET_ASSETS.items():
        price = meta["default"]
        cursor.execute("""
          INSERT INTO current_rates 
          (asset_id, name, en_name, category, unit, symbol, price, change_24h, high_24h, low_24h, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
          meta["id"], meta["name"], meta["enName"], meta["category"],
          meta["unit"], meta.get("symbol", ""), price, 1.25,
          round(price * 1.015), round(price * 0.985), now
        ))
        # Insert initial sparkline points
        for i in range(7):
          hist_price = round(price * (1 + (i - 3) * 0.003))
          cursor.execute(
            "INSERT INTO price_history (asset_id, price, created_at) VALUES (?, ?, ?)",
            (meta["id"], hist_price, now)
          )

    conn.commit()
    conn.close()

  def get_all_rates(self):
    """Fetches all assets with their recent sparkline history"""
    conn = self.get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM current_rates")
    rows = cursor.fetchall()

    rates = {}
    for row in rows:
      asset_id = row["asset_id"]
      cursor.execute(
        "SELECT price FROM price_history WHERE asset_id = ? ORDER BY id DESC LIMIT 7",
        (asset_id,)
      )
      hist_rows = cursor.fetchall()
      history = [h["price"] for h in reversed(hist_rows)] if hist_rows else [row["price"]]

      rates[asset_id] = {
        "id": asset_id,
        "name": row["name"],
        "enName": row["en_name"],
        "category": row["category"],
        "unit": row["unit"],
        "symbol": row["symbol"] or "",
        "price": row["price"],
        "change24h": row["change_24h"],
        "high24h": row["high_24h"],
        "low24h": row["low_24h"],
        "lastUpdated": row["updated_at"],
        "history": history
      }

    conn.close()
    return rates

  def update_asset_price(self, asset_id, new_price, change_pct=None):
    """Updates an asset price and logs a historical point"""
    conn = self.get_connection()
    cursor = conn.cursor()
    now = datetime.now().isoformat()

    cursor.execute("SELECT high_24h, low_24h FROM current_rates WHERE asset_id = ?", (asset_id,))
    row = cursor.fetchone()
    high = max(row["high_24h"] if row else new_price, new_price)
    low = min(row["low_24h"] if row else new_price, new_price)

    cursor.execute("""
      UPDATE current_rates 
      SET price = ?, high_24h = ?, low_24h = ?, updated_at = ?
      WHERE asset_id = ?
    """, (new_price, high, low, now, asset_id))

    cursor.execute(
      "INSERT INTO price_history (asset_id, price, created_at) VALUES (?, ?, ?)",
      (asset_id, new_price, now)
    )

    conn.commit()
    conn.close()

  def get_asset_history(self, asset_id, limit=50):
    """Returns price history points for charts"""
    conn = self.get_connection()
    cursor = conn.cursor()
    cursor.execute(
      "SELECT price, created_at FROM price_history WHERE asset_id = ? ORDER BY id DESC LIMIT ?",
      (asset_id, limit)
    )
    rows = cursor.fetchall()
    conn.close()
    return [{"price": r["price"], "time": r["created_at"]} for r in reversed(rows)]
