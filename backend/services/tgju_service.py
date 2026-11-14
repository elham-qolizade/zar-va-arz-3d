import urllib.request
import re
from datetime import datetime
from config import TGJU_URL, TARGET_ASSETS

class TGJUService:
  """Handles data scraping, parsing, and normalization from TGJU.org"""

  @staticmethod
  def clean_number(str_val):
    if not str_val:
      return 0.0
    persian_digits = '۰۱۲۳۴۵۶۷۸۹'
    arabic_digits = '٠١٢٣٤٥٦٧٨٩'
    for i, d in enumerate(persian_digits):
      str_val = str_val.replace(d, str(i))
    for i, d in enumerate(arabic_digits):
      str_val = str_val.replace(d, str(i))
    clean = re.sub(r'[^0-9.]', '', str_val)
    try:
      return float(clean)
    except ValueError:
      return 0.0

  @classmethod
  def fetch_latest_rates(cls):
    """Fetches HTML from TGJU and returns normalized Toman rates dict"""
    headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'fa,en;q=0.9',
    }

    try:
      req = urllib.request.Request(TGJU_URL, headers=headers)
      with urllib.request.urlopen(req, timeout=10) as response:
        html = response.read().decode('utf-8', errors='ignore')

        results = {}
        for slug, meta in TARGET_ASSETS.items():
          pattern = rf'data-market-row=["\']{re.escape(slug)}["\'][^>]*>(.*?)</tr>'
          match = re.search(pattern, html, re.DOTALL | re.IGNORECASE)
          price = 0.0

          if match:
            row_content = match.group(1)
            numbers = re.findall(r'<td[^>]*class=["\'][^"\']*nf[^"\']*["\'][^>]*>([^<]+)</td>', row_content)
            if numbers:
              price = cls.clean_number(numbers[0])

          if price > 0:
            price_toman = round(price / 10) if meta["is_rial"] else price
            results[meta["id"]] = price_toman

        return results
    except Exception as e:
      return None
