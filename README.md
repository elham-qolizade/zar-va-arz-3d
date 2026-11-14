# 🪙 ZAR & ARZ 3D

> **Luxury 3D Interactive Platform for Real-Time Gold & Currency Rates**  
> Inspired by award-winning WebGL experiences (*Lusion*, *Igloo.inc*, *Active Theory*), featuring an interactive Three.js 3D bullion vault, smart weight calculator, and an automated zero-dependency backend.

---

## ✨ Features

- **Cinematic 3D WebGL (Three.js):**
  - Physically-based (PBR) Swiss Gold Bullion with metallic sheen & relief engraving.
  - Interactive 360° mouse drag inspection.
  - Holographic measurement rings & sweeping laser scanner.
  - Floating currency satellites (`$`, `€`, `د.إ`, `₮`) & 3,500-particle cosmic vortex.
  - Smooth inertia momentum scrolling via **Lenis**.
  
- **Live Market Pulse:**
  - Real-time rates for Gold (18K, 24K, Mesghal), Coins (Emami, Bahar Azadi, Half, Quarter), USD, EUR, AED, and USDT.
  - SVG sparkline charts, 24h range bars, and instant price copying.

- **Smart 3D Vault Calculator:**
  - Precision weight conversion: **Soot** (0.001g), **Grams**, **Mesghal** (4.6083g), **Kilograms**, and **Troy Ounces**.
  - Real-time 3D gold bar resizing based on entered weight.
  - Transparent itemized invoice (Raw Gold + Labor Wage + 7% Profit + 9% VAT).
  - Persian words numeral readout to prevent digit errors.
  - Bidirectional currency converter (USD ⇄ Toman).

- **Independent Backend & Database:**
  - Lightweight Python 3 server (zero external dependencies).
  - Embedded **SQLite** database (`market.db`) for persistent price history.
  - Background daemon worker with automated rate synchronization.

---

## 🏗 Architecture

```text
zar-va-arz-3d/
├── backend/                  # Server & business logic
│   ├── app.py                # Server entrypoint & REST API handlers
│   ├── config.py             # Global configurations & asset definitions
│   ├── database/             # SQLite connection & schema migrations
│   └── services/             # Scraper & rate normalization engine
│
├── frontend/                 # Client application
│   ├── index.html            # Semantic HTML5 layout
│   ├── css/style.css         # Dark luxury design system & glassmorphism
│   └── js/
│       ├── main.js           # Client orchestrator & API sync
│       ├── scene3d.js        # Three.js PBR rendering & camera choreography
│       ├── calculator.js     # Gold & currency conversion engine
│       ├── sound.js          # Web Audio API haptics synthesizer
│       └── constants.js      # Baseline constants & numeric helpers
│
├── data/                     # Local SQLite database & cache
├── docs/                     # Technical architecture documentation
├── server.py                 # Quick launcher script
└── README.md
```

---

## 🚀 Quickstart

Run directly using Python 3 (no `npm` or `pip` dependencies required):

```bash
# Clone the repository
git clone https://github.com/elham-qolizade/zar-va-arz-3d.git
cd zar-va-arz-3d

# Start the unified server
python3 server.py
```

Open your browser at:  
👉 **`http://localhost:8080/index.html`**

---

## 📡 REST API

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/rates` | Fetch all current asset rates with sparkline histories |
| `GET` | `/api/history?asset=gold18k` | Fetch detailed historical price ticks |
| `POST` | `/api/sync` | Trigger an immediate backend rate synchronization |

---

## 📄 License

Distributed under the **MIT** License. Free for open-source and commercial use.
