# 📐 معماری و ساختار فنی سامانه «زر و ارز» (Architecture Overview)

این پروژه با تکیه بر اصول **معماری ماژولار (Modular Architecture)**، **کد تمیز (Clean Code)**، و **جداسازی وظایف (Separation of Concerns)** طراحی شده است.

---

## 🗂 ساختار پوشه‌ها و اجزای پروژه (Project Layout)

```
zar-va-arz/
├── backend/                  # هسته سرور بک‌اند و سرویس‌های همگام‌سازی
│   ├── app.py                # نقطه ورود سرور، هندلرهای REST API و روت‌های وب
│   ├── config.py             # پیکربندی سرور، آدرس‌ها، دیتابیس و دارایی‌ها
│   ├── database/             # لایه پایگاه‌داده (Database Layer)
│   │   ├── __init__.py
│   │   └── db_manager.py     # مدیریت SQLite، اسکیما، تراکنش‌ها و تاریخچه قیمت
│   └── services/             # لایه منطق بیزینس و ارتباطات خارجی (Service Layer)
│       ├── __init__.py
│       └── tgju_service.py   # وب اسکرپر، تبدیل واحدها و نرمال‌سازی داده‌های TGJU
│
├── frontend/                 # لایه ارائه‌ی کاربری (Client-side Presentation Layer)
│   ├── index.html            # کد سمانتیک HTML5 با پشتیبانی کامل از RTL و دسترسی‌پذیری
│   ├── css/
│   │   └── style.css         # سیستم دیزاین لوکس تیره، افکت شیشه‌ای و انیمیشن‌ها
│   └── js/
│       ├── main.js           # ارکستراتور کلاینت، بایند رویدادها و ارتباط با API
│       ├── scene3d.js        # موتور رندر سه‌بعدی Three.js، نورپردازی PBR و اسکرول دوربین
│       ├── calculator.js     # موتور محاسبات تبدیل اوزان، اجرت، سود و مالیات
│       ├── sound.js          # سنتز اصوات لوکس با Web Audio API
│       └── constants.js      # تعاریف اولیه دارایی‌ها و توابع کمکی تبدیل اعداد
│
├── data/                     # دایرکتوری ذخیره‌سازی داده‌های محلی
│   ├── market.db             # پایگاه داده سبک و پرسرعت SQLite
│   └── rates.json            # کش استاتیک نرخ‌های مبنا
│
├── docs/                     # مستندات تکمیلی پروژه
│   └── ARCHITECTURE.md       # سند حاضر
│
├── server.py                 # اسکریپت رانر اصلی در ریشه پروژه
├── run.sh                    # اسکریپت اجرای سریع با یک کلیک
├── .gitignore                # نادیده‌گیری فایل‌های سیستمی و دیتابیس لوکال
└── README.md                 # راهنمای جامع پروژه و نحوه اجرا
```

---

## 🔄 جریان داده‌ها (Data Flow)

```
[ منبع آنلاین: TGJU.org ]
         │ (بررسی دوره‌ای هر ۶۰ ثانیه توسط Background Worker)
         ▼
[ TGJUService (backend/services/tgju_service.py) ]
         │ (تبدیل ریال به تومان، نرمال‌سازی و اعتبارسنجی)
         ▼
[ DatabaseManager (backend/database/db_manager.py) ]
         │ (ثبت رکورد در SQLite: جدول current_rates و price_history)
         ▼
[ پایگاه داده محلی (data/market.db) ]
         │
 ┌───────┴────────────────────────┐
 │ REST API (GET /api/rates)      │ REST API (GET /api/history)
 ▼                                ▼
[ فرانت‌اند: main.js ] ─────────► [ نمودار اسپارک‌لاین و کارت‌های نرخ روز ]
         │
         ▼
[ موتور محاسباتی: calculator.js ] ──► [ فاکتور شفاف طلا + تبدیل ارز ]
         │
         ▼
[ موتور گرافیکی: scene3d.js ] ───► [ تغییر ابعاد شمش طلای سه‌بعدی در وب‌جی‌ال ]
```

---

## 📡 مشخصات APIهای سرور (REST Endpoints)

### ۱. دریافت آخرین نرخ‌ها و اسپارک‌لاین‌ها
* **مسیر:** `GET /api/rates`
* **پاسخ:**
```json
{
  "status": "success",
  "updatedAt": "2026-11-14T22:05:00.000Z",
  "database": "SQLite (market.db)",
  "source": "شبکه اطلاع‌رسانی طلا و ارز (TGJU.org)",
  "rates": {
    "gold18k": {
      "id": "gold18k",
      "name": "طلای ۱۸ عیار (۷۵۰)",
      "price": 24794500,
      "change24h": 1.45,
      "history": [...]
    }
  }
}
```

### ۲. دریافت تاریخچه تفصیلی یک دارایی
* **مسیر:** `GET /api/history?asset=gold18k&limit=50`
* **پاسخ:**
```json
{
  "asset": "gold18k",
  "history": [
    {"price": 24794500, "time": "2026-11-14T22:00:00"}
  ]
}
```

### ۳. فرمان همگام‌سازی فوری
* **مسیر:** `POST /api/sync`
* **پاسخ:** بروزرسانی فوری دیتابیس از روی سرور TGJU و بازگرداندن داده‌های جدید.
