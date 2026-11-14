import os

# Base paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")
DB_PATH = os.path.join(DATA_DIR, "market.db")

# Server configuration
PORT = 8080
HOST = "0.0.0.0"
SYNC_INTERVAL_SECONDS = 60
TGJU_URL = "https://www.tgju.org"

# Target financial assets on TGJU
TARGET_ASSETS = {
  "gold_geram18": {
    "id": "gold18k",
    "name": "طلای ۱۸ عیار (۷۵۰)",
    "enName": "Gold 18K",
    "category": "gold",
    "unit": "تومان / گرم",
    "is_rial": True,
    "default": 24794500
  },
  "gold_geram24": {
    "id": "gold24k",
    "name": "طلای ۲۴ عیار (۹۹۹)",
    "enName": "Gold 24K",
    "category": "gold",
    "unit": "تومان / گرم",
    "is_rial": True,
    "default": 33059000
  },
  "mesghal": {
    "id": "mesghal",
    "name": "مظنه / مثقال طلا",
    "enName": "Mesghal Gold",
    "category": "gold",
    "unit": "تومان / مثقال (۴.۶۰۸ گرم)",
    "is_rial": True,
    "default": 107403000
  },
  "sekkeh": {
    "id": "coinEmami",
    "name": "سکه تمام بهار (امامی)",
    "enName": "Emami Gold Coin",
    "category": "coin",
    "unit": "تومان",
    "is_rial": True,
    "default": 252515000
  },
  "bahar": {
    "id": "coinBahar",
    "name": "سکه تمام طرح قدیم (بهار آزادی)",
    "enName": "Bahar Azadi Coin",
    "category": "coin",
    "unit": "تومان",
    "is_rial": True,
    "default": 245080000
  },
  "nim": {
    "id": "coinHalf",
    "name": "نیم سکه بهار آزادی",
    "enName": "Half Coin",
    "category": "coin",
    "unit": "تومان",
    "is_rial": True,
    "default": 132860000
  },
  "rob": {
    "id": "coinQuarter",
    "name": "ربع سکه بهار آزادی",
    "enName": "Quarter Coin",
    "category": "coin",
    "unit": "تومان",
    "is_rial": True,
    "default": 72470000
  },
  "gerami": {
    "id": "coinGram",
    "name": "سکه یک گرمی",
    "enName": "1-Gram Coin",
    "category": "coin",
    "unit": "تومان",
    "is_rial": True,
    "default": 37000000
  },
  "price_dollar_rl": {
    "id": "usd",
    "name": "دلار آمریکا (بازار آزاد)",
    "enName": "US Dollar (USD)",
    "category": "currency",
    "unit": "تومان",
    "symbol": "$",
    "is_rial": True,
    "default": 269900
  },
  "price_eur": {
    "id": "eur",
    "name": "یورو اروپا",
    "enName": "Euro (EUR)",
    "category": "currency",
    "unit": "تومان",
    "symbol": "€",
    "is_rial": True,
    "default": 297880
  },
  "price_aed": {
    "id": "aed",
    "name": "درهم امارات",
    "enName": "UAE Dirham (AED)",
    "category": "currency",
    "unit": "تومان",
    "symbol": "د.إ",
    "is_rial": True,
    "default": 73763
  },
  "crypto-tether": {
    "id": "usdt",
    "name": "تتر (دلار دیجیتال)",
    "enName": "Tether (USDT)",
    "category": "currency",
    "unit": "تومان",
    "symbol": "₮",
    "is_rial": True,
    "default": 270863
  },
  "ons": {
    "id": "globalOunce",
    "name": "انس جهانی طلا",
    "enName": "Gold Spot Ounce",
    "category": "global",
    "unit": "دلار / اونس",
    "symbol": "oz",
    "is_rial": False,
    "default": 3883.9
  }
}
