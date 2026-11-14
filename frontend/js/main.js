/**
 * Application Main Controller
 * Connects 3D WebGL, Market Data, Calculator & Audio
 */

import { INITIAL_RATES, WEIGHT_UNITS, formatToman, toPersianDigits, formatNumberWithDecimals, numberToWordsPersian } from './constants.js';
import { CalculatorEngine } from './calculator.js';
import { Scene3D } from './scene3d.js';
import { sound } from './sound.js';

class ZarVaArzApp {
  constructor() {
    this.rates = JSON.parse(JSON.stringify(INITIAL_RATES));
    this.calculator = new CalculatorEngine();
    this.scene3d = null;
    this.activeFilter = 'all';
    this.activeCalcMode = 'gold';
    this.audioEnabled = false;

    this.init();
  }

  init() {
    // 1. Initialize 3D Engine
    try {
      this.scene3d = new Scene3D('webgl-container');
    } catch (e) {
      console.warn('WebGL initialization skipped or failed:', e);
    }

    // 2. Setup Scroll Tracking for 3D Camera, Lenis & Parallax
    this.setupScrollSync();

    // 3. Render Hero KPIs & Market Grid
    this.renderHeroKPIs();
    this.renderMarketGrid();

    // 4. Setup 3D Interactive UX (Custom Circular Cursor & Card Tilts)
    this.setupCustomCursor();
    this.setup3DCardTilt();

    // 5. Setup Calculator Listeners
    this.setupCalculator();

    // 6. Setup Market Filter Tabs
    this.setupFilters();

    // 7. Setup Audio & HUD Controls
    this.setupHUD();

    // 8. Setup Live Clock & Simulated Market Pulse
    this.startClock();
    this.startMarketFluctuation();

    // 9. Load Real Data from SQLite Backend & TGJU
    this.loadRatesFromAPI();

    // 10. Initial Calculator Run
    this.calculator.calculateGold();
    this.calculator.calculateCurrency();
  }

  // Fetch live rates from SQLite Backend API with graceful static fallback
  async loadRatesFromAPI() {
    try {
      const res = await fetch('/api/rates?t=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        if (data && data.rates) {
          this.rates = { ...this.rates, ...data.rates };
          this.calculator.setRates(this.rates);
          this.renderHeroKPIs();
          this.renderMarketGrid();
          this.setup3DCardTilt();
          return;
        }
      }
    } catch (e) {
      console.log('API offline, falling back to static rates.json:', e);
    }

    // Static fallback
    try {
      const res = await fetch('./rates.json?t=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        if (data && data.rates) {
          this.rates = { ...this.rates, ...data.rates };
          this.calculator.setRates(this.rates);
          this.renderHeroKPIs();
          this.renderMarketGrid();
          this.setup3DCardTilt();
        }
      }
    } catch (e) {}
  }

  // Smooth scroll sync with 3D camera & Lenis Smooth Scroll Engine
  setupScrollSync() {
    if (typeof window.Lenis !== 'undefined') {
      this.lenis = new window.Lenis({
        duration: 1.3,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1.05
      });

      const raf = (time) => {
        this.lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);

      this.lenis.on('scroll', (e) => {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (e.scroll / docHeight) : 0;
        if (this.scene3d) {
          this.scene3d.setScrollProgress(progress);
        }
      });
    } else {
      window.addEventListener('scroll', () => {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (window.scrollY / docHeight) : 0;
        if (this.scene3d) {
          this.scene3d.setScrollProgress(progress);
        }
      }, { passive: true });
    }
  }

  // Custom Luxury Circular Cursor (Replaces default OS mouse)
  setupCustomCursor() {
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    }, { passive: true });

    const updateRing = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
      requestAnimationFrame(updateRing);
    };
    updateRing();

    const interactables = 'button, a, input, select, .market-card, .kpi-card, .preset-chip, .filter-tab, .scroll-indicator';
    document.querySelectorAll(interactables).forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('active'));
      el.addEventListener('mouseleave', () => ring.classList.remove('active'));
    });
  }

  // 3D Physical Card Tilt (Perspective Parallax)
  setup3DCardTilt() {
    const cards = document.querySelectorAll('.market-card, .kpi-card, .calc-container, .insight-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const tiltX = ((y - centerY) / centerY) * -7;
        const tiltY = ((x - centerX) / centerX) * 7;

        card.style.setProperty('--tilt-x', `${tiltX.toFixed(2)}deg`);
        card.style.setProperty('--tilt-y', `${tiltY.toFixed(2)}deg`);
      });

      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
      });
    });
  }

  // Render Hero Quick KPI Strip
  renderHeroKPIs() {
    const kpiContainer = document.getElementById('hero-kpi-container');
    if (!kpiContainer) return;

    const featured = ['gold18k', 'usd', 'coinEmami', 'globalOunce'];
    kpiContainer.innerHTML = featured.map(key => {
      const item = this.rates[key];
      const isUp = item.change24h >= 0;
      const changeClass = isUp ? 'badge-up' : 'badge-down';
      const arrow = isUp ? '▲' : '▼';
      const displayPrice = key === 'globalOunce' ? `$${item.price.toFixed(1)}` : formatToman(item.price);

      return `
        <div class="kpi-card" data-key="${item.id}">
          <div class="kpi-header">
            <span class="kpi-title">${item.name}</span>
            <span class="kpi-badge ${changeClass}">
              ${toPersianDigits(Math.abs(item.change24h).toFixed(2))}% ${arrow}
            </span>
          </div>
          <div class="kpi-price">
            ${displayPrice}
            <span class="kpi-unit">${item.unit}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // Generate Mini SVG Sparkline Chart
  generateSparklineSVG(history, isPositive) {
    if (!history || history.length < 2) return '';
    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = (max - min) || 1;
    const width = 280;
    const height = 40;

    const points = history.map((val, idx) => {
      const x = (idx / (history.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const color = isPositive ? '#00f090' : '#ff385c';
    const gradientId = `grad-${Math.random().toString(36).substr(2, 9)}`;

    return `
      <svg viewBox="0 0 ${width} ${height}">
        <defs>
          <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="${color}" stop-opacity="0.25" />
            <stop offset="100%" stop-color="${color}" stop-opacity="0.0" />
          </linearGradient>
        </defs>
        <polygon fill="url(#${gradientId})" points="0,${height} ${points.join(' ')} ${width},${height}" />
        <polyline fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${points.join(' ')}" />
      </svg>
    `;
  }

  // Render Live Market Grid
  renderMarketGrid() {
    const grid = document.getElementById('market-grid');
    if (!grid) return;

    const items = Object.values(this.rates).filter(item => {
      if (this.activeFilter === 'all') return true;
      if (this.activeFilter === 'gold') return item.category === 'gold';
      if (this.activeFilter === 'coins') return item.category === 'coin';
      if (this.activeFilter === 'currency') return item.category === 'currency' || item.category === 'global';
      return true;
    });

    grid.innerHTML = items.map(item => {
      const isUp = item.change24h >= 0;
      const changeClass = isUp ? 'badge-up' : 'badge-down';
      const arrow = isUp ? '▲' : '▼';
      const sparkline = this.generateSparklineSVG(item.history, isUp);
      const isGlobal = item.category === 'global';
      const priceText = isGlobal ? `$${item.price.toFixed(1)}` : formatToman(item.price);

      return `
        <div class="market-card" data-id="${item.id}">
          <div>
            <div class="card-top">
              <div class="card-identity">
                <span class="card-name">${item.name}</span>
                <span class="card-en">${item.enName}</span>
              </div>
              <span class="kpi-badge ${changeClass}">
                ${toPersianDigits(Math.abs(item.change24h).toFixed(2))}% ${arrow}
              </span>
            </div>

            <div class="card-price-row">
              <div class="card-price">
                ${priceText}
                <span class="card-unit">${item.unit}</span>
              </div>
            </div>

            <div class="card-sparkline">
              ${sparkline}
            </div>

            <div class="card-range-bar">
              <div class="range-labels">
                <span>پایین‌ترین: ${isGlobal ? '$' + item.low24h : formatToman(item.low24h)}</span>
                <span>بالاترین: ${isGlobal ? '$' + item.high24h : formatToman(item.high24h)}</span>
              </div>
              <div class="range-track">
                <div class="range-fill"></div>
              </div>
            </div>
          </div>

          <div class="card-actions">
            <button class="btn-card-calc" data-card-id="${item.id}">
              <span>محاسبه در ماشین‌حساب</span>
              <span>←</span>
            </button>
            <button class="btn-copy-price" title="کپی نرخ" data-copy-val="${item.price}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Bind card action buttons
    grid.querySelectorAll('.btn-card-calc').forEach(btn => {
      btn.addEventListener('click', (e) => {
        sound.playClick();
        const id = btn.dataset.cardId;
        this.selectAssetForCalculator(id);
      });
    });

    grid.querySelectorAll('.btn-copy-price').forEach(btn => {
      btn.addEventListener('click', (e) => {
        sound.playClick();
        const val = btn.dataset.copyVal;
        navigator.clipboard.writeText(val);
        this.showToast(`نرخ ${formatToman(val)} تومان کپی شد.`);
      });
    });

    this.setup3DCardTilt();
  }

  // Quick select an asset from market grid directly into calculator
  selectAssetForCalculator(id) {
    const item = this.rates[id];
    if (!item) return;

    const calcSection = document.getElementById('calculator-section');
    if (calcSection) {
      calcSection.scrollIntoView({ behavior: 'smooth' });
    }

    if (item.category === 'gold') {
      this.switchCalcMode('gold');
      if (id === 'gold18k') {
        this.calculator.goldState.purity = '18k';
        this.calculator.goldState.unit = 'gram';
        this.calculator.goldState.weight = 1;
      } else if (id === 'gold24k') {
        this.calculator.goldState.purity = '24k';
        this.calculator.goldState.unit = 'gram';
        this.calculator.goldState.weight = 1;
      } else if (id === 'mesghal') {
        this.calculator.goldState.purity = '18k';
        this.calculator.goldState.unit = 'mesghal';
        this.calculator.goldState.weight = 1;
      }
      this.syncGoldFormInputs();
      this.calculator.calculateGold();
    } else if (item.category === 'currency') {
      this.switchCalcMode('currency');
      this.calculator.currencyState.currency = id;
      this.calculator.currencyState.direction = 'fxToToman';
      this.calculator.currencyState.amount = 100;
      this.syncCurrencyFormInputs();
      this.calculator.calculateCurrency();
    }
  }

  // Setup Calculator Form & Interactive 3D updates
  setupCalculator() {
    // Mode Switch (Gold vs Currency)
    const modeTabs = document.querySelectorAll('.mode-tab-btn');
    modeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        sound.playClick();
        const mode = tab.dataset.mode;
        this.switchCalcMode(mode);
      });
    });

    // Gold Weight Input
    const weightInput = document.getElementById('calc-gold-weight');
    const unitSelector = document.getElementById('calc-gold-unit');
    const weightSlider = document.getElementById('calc-weight-slider');

    if (weightInput) {
      weightInput.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value) || 0;
        this.calculator.goldState.weight = val;
        this.calculator.calculateGold();
        sound.playClick();
      });
    }

    if (unitSelector) {
      unitSelector.addEventListener('change', (e) => {
        this.calculator.goldState.unit = e.target.value;
        this.calculator.calculateGold();
        sound.playClick();
      });
    }

    if (weightSlider) {
      weightSlider.addEventListener('input', (e) => {
        const sliderVal = parseFloat(e.target.value);
        let actualWeight = sliderVal;
        if (this.calculator.goldState.unit === 'soot') {
          actualWeight = Math.round(sliderVal * 50); // 10 to 5000 soot
        } else if (this.calculator.goldState.unit === 'gram') {
          actualWeight = Math.round(sliderVal * 10) / 10;
        } else if (this.calculator.goldState.unit === 'kg') {
          // Dynamic scale: 0.1 kg up to 100 kg
          actualWeight = sliderVal <= 10 ? (sliderVal / 10).toFixed(2) : Math.round(sliderVal);
        } else if (this.calculator.goldState.unit === 'ton') {
          // 0.1 ton up to 10 tons
          actualWeight = (sliderVal / 10).toFixed(2);
        } else if (this.calculator.goldState.unit === 'mesghal') {
          actualWeight = (sliderVal / 5).toFixed(1);
        } else if (this.calculator.goldState.unit === 'ounce') {
          actualWeight = (sliderVal / 10).toFixed(1);
        }

        if (weightInput) weightInput.value = actualWeight;
        this.calculator.goldState.weight = parseFloat(actualWeight) || 0;
        this.calculator.calculateGold();
      });
    }

    // Quick Presets
    document.querySelectorAll('.preset-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        sound.playChime(660, 0.15);
        document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const weight = parseFloat(chip.dataset.weight);
        const unit = chip.dataset.unit;

        this.calculator.goldState.weight = weight;
        this.calculator.goldState.unit = unit;

        if (weightInput) weightInput.value = weight;
        if (unitSelector) unitSelector.value = unit;

        this.calculator.calculateGold();
      });
    });

    // Purity Pills
    document.querySelectorAll('.purity-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        document.querySelectorAll('.purity-pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.calculator.goldState.purity = btn.dataset.purity;
        this.calculator.calculateGold();
      });
    });

    // Jeweler Accordion
    const accHeader = document.querySelector('.accordion-header');
    if (accHeader) {
      accHeader.addEventListener('click', () => {
        sound.playClick();
        const box = accHeader.closest('.accordion-box');
        box.classList.toggle('open');
      });
    }

    // Wage, Profit, Tax inputs
    const wageInput = document.getElementById('calc-wage-val');
    const profitInput = document.getElementById('calc-profit-val');
    const taxCheck = document.getElementById('calc-tax-check');

    if (wageInput) {
      wageInput.addEventListener('input', (e) => {
        this.calculator.goldState.wageValue = parseFloat(e.target.value) || 0;
        this.calculator.calculateGold();
      });
    }

    if (profitInput) {
      profitInput.addEventListener('input', (e) => {
        this.calculator.goldState.profitPercent = parseFloat(e.target.value) || 0;
        this.calculator.calculateGold();
      });
    }

    if (taxCheck) {
      taxCheck.addEventListener('change', (e) => {
        this.calculator.goldState.includeTax = e.target.checked;
        this.calculator.calculateGold();
      });
    }

    // Connect Gold Calculation Output Callback
    this.calculator.onGoldCalculateCallback = (res) => {
      if (this.activeCalcMode === 'gold') {
        this.updateGoldResultsUI(res);
      }
      // Synchronize 3D Gold Bar Scale
      if (this.scene3d) {
        this.scene3d.updateObjectWeight(res.weightInGrams);
      }
    };

    // --- Currency Converter Listeners ---
    const currInput = document.getElementById('calc-curr-amount');
    const currSelect = document.getElementById('calc-curr-select');
    const dirToggle = document.getElementById('calc-curr-direction-btn');
    const customRateInput = document.getElementById('calc-curr-custom-rate');

    if (customRateInput) {
      const initialCurr = this.calculator.currencyState.currency;
      customRateInput.value = this.rates[initialCurr]?.price || 69650;

      customRateInput.addEventListener('input', (e) => {
        const customVal = parseFloat(e.target.value);
        if (customVal > 0) {
          this.calculator.currencyState.customRate = customVal;
          const activeCurr = this.calculator.currencyState.currency;
          if (this.rates[activeCurr]) {
            this.rates[activeCurr].price = customVal;
            this.renderHeroKPIs();
            this.renderMarketGrid();
          }
        } else {
          this.calculator.currencyState.customRate = null;
        }
        this.calculator.calculateCurrency();
      });
    }

    if (currInput) {
      currInput.addEventListener('input', (e) => {
        this.calculator.currencyState.amount = parseFloat(e.target.value) || 0;
        this.calculator.calculateCurrency();
      });
    }

    if (currSelect) {
      currSelect.addEventListener('change', (e) => {
        this.calculator.currencyState.currency = e.target.value;
        this.calculator.currencyState.customRate = null;
        if (customRateInput) {
          customRateInput.value = this.rates[e.target.value]?.price || '';
        }
        this.calculator.calculateCurrency();
        sound.playClick();
      });
    }

    if (dirToggle) {
      dirToggle.addEventListener('click', () => {
        sound.playClick();
        const curDir = this.calculator.currencyState.direction;
        this.calculator.currencyState.direction = curDir === 'fxToToman' ? 'tomanToFx' : 'fxToToman';
        dirToggle.classList.toggle('flipped');
        this.calculator.calculateCurrency();
      });
    }

    // Currency Presets
    document.querySelectorAll('.curr-preset-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        sound.playChime(700, 0.12);
        const amt = parseFloat(chip.dataset.amount);
        this.calculator.currencyState.amount = amt;
        if (currInput) currInput.value = amt;
        this.calculator.calculateCurrency();
      });
    });

    // Connect Currency Output Callback
    this.calculator.onCurrencyCalculateCallback = (res) => {
      if (this.activeCalcMode === 'currency') {
        this.updateCurrencyResultsUI(res);
      }
    };

    // Copy Invoice Button
    const copyInvoiceBtn = document.getElementById('btn-copy-invoice');
    if (copyInvoiceBtn) {
      copyInvoiceBtn.addEventListener('click', () => {
        sound.playChime(880, 0.2);
        const activeMode = document.querySelector('.mode-tab-btn.active')?.dataset.mode || 'gold';

        if (activeMode === 'gold') {
          const res = this.calculator.calculateGold();
          let weightSpec = `${toPersianDigits(res.weightEntered)} ${res.unit}`;
          if (res.weightInGrams >= 1000000) {
            weightSpec += ` (معادل ${toPersianDigits((res.weightInGrams / 1000000).toFixed(2))} تُن / ${formatToman(res.weightInGrams / 1000)} کیلو)`;
          } else if (res.weightInGrams >= 1000) {
            weightSpec += ` (معادل ${toPersianDigits((res.weightInGrams / 1000).toFixed(2))} کیلو / ${formatToman(res.weightInGrams)} گرم)`;
          } else {
            weightSpec += ` (معادل ${toPersianDigits(res.weightInGrams.toFixed(3))} گرم)`;
          }

          const invoiceText = `🧾 فاکتور محاسبه طلا - زر و ارز\n` +
            `• وزن: ${weightSpec}\n` +
            `• ارزش طلای خام: ${formatToman(res.rawGoldPrice)} تومان\n` +
            `• اجرت ساخت: ${formatToman(res.wageAmount)} تومان\n` +
            `• سود طلافروش: ${formatToman(res.profitAmount)} تومان\n` +
            `• مالیات بر ارزش افزوده (۹٪): ${formatToman(res.taxAmount)} تومان\n` +
            `──────────────────\n` +
            `💰 مبلغ نهایی: ${formatToman(res.totalPrice)} تومان\n` +
            `به حروف: ${res.totalWords}\n` +
            `نرخ دلار مرجع: ${formatToman(this.rates.usd.price)} تومان | معادل دلاری: $${res.usdEquivalent.toFixed(2)}`;
          
          navigator.clipboard.writeText(invoiceText);
          this.showToast('📋 فاکتور با جزئیات کامل در کلیپ‌بورد کپی شد.');
        } else {
          const res = this.calculator.calculateCurrency();
          const currText = `💵 تبدیل ارز - زر و ارز\n` +
            `• تبدیل ${toPersianDigits(res.inputAmount)} ${res.fromSymbol} به ${res.toSymbol}\n` +
            `• نرخ تبدیل: ${formatToman(res.rateUsed)} تومان\n` +
            `• نتیجه نهایی: ${formatToman(res.resultAmount)} ${res.toSymbol}\n` +
            `• به حروف: ${res.words}`;
          
          navigator.clipboard.writeText(currText);
          this.showToast('📋 نتیجه تبدیل ارز در کلیپ‌بورد کپی شد.');
        }
      });
    }
  }

  // Switch between Gold and Currency mode
  switchCalcMode(mode) {
    this.activeCalcMode = mode;
    document.querySelectorAll('.mode-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    const goldView = document.getElementById('calc-gold-view');
    const currView = document.getElementById('calc-currency-view');
    const goldBreakdown = document.getElementById('gold-breakdown-container');
    const currBreakdown = document.getElementById('currency-breakdown-container');
    const copyLabel = document.getElementById('btn-copy-label');
    const totalLabel = document.getElementById('calc-total-label');

    if (goldView && currView) {
      if (mode === 'gold') {
        goldView.style.display = 'block';
        currView.style.display = 'none';
        if (goldBreakdown) goldBreakdown.style.display = 'flex';
        if (currBreakdown) currBreakdown.style.display = 'none';
        if (copyLabel) copyLabel.innerText = 'کپی فاکتور رسمی و شفاف طلا';
        if (totalLabel) totalLabel.innerText = 'مبلغ نهایی تمام‌شده:';
        this.calculator.calculateGold();
      } else {
        goldView.style.display = 'none';
        currView.style.display = 'block';
        if (goldBreakdown) goldBreakdown.style.display = 'none';
        if (currBreakdown) currBreakdown.style.display = 'flex';
        if (copyLabel) copyLabel.innerText = 'کپی نتیجه تبدیل ارز';
        if (totalLabel) totalLabel.innerText = 'معادل تبدیل شده:';
        this.calculator.calculateCurrency();
      }
    }
  }

  // Update Gold Results HUD
  updateGoldResultsUI(res) {
    const totalEl = document.getElementById('calc-result-total');
    const unitEl = document.getElementById('calc-result-unit');
    const wordsEl = document.getElementById('calc-result-words');
    const rawEl = document.getElementById('gold-breakdown-raw');
    const wageEl = document.getElementById('gold-breakdown-wage');
    const profitEl = document.getElementById('gold-breakdown-profit');
    const taxEl = document.getElementById('gold-breakdown-tax');
    const gramWeightEl = document.getElementById('gold-breakdown-gram-weight');
    const usdEquivEl = document.getElementById('gold-breakdown-usd');

    if (totalEl) totalEl.innerText = formatToman(res.totalPrice);
    if (unitEl) unitEl.innerText = 'تومان';
    if (wordsEl) wordsEl.innerText = res.totalWords;
    if (rawEl) rawEl.innerText = `${formatToman(res.rawGoldPrice)} تومان`;
    if (wageEl) wageEl.innerText = `${formatToman(res.wageAmount)} تومان`;
    if (profitEl) profitEl.innerText = `${formatToman(res.profitAmount)} تومان`;
    if (taxEl) taxEl.innerText = `${formatToman(res.taxAmount)} تومان`;
    if (gramWeightEl) {
      if (res.weightInGrams >= 1000000) {
        const tonVal = (res.weightInGrams / 1000000).toFixed(2);
        gramWeightEl.innerText = `${toPersianDigits(tonVal)} تُن (${formatToman(res.weightInGrams / 1000)} کیلو)`;
      } else if (res.weightInGrams >= 1000) {
        const kgVal = (res.weightInGrams / 1000).toFixed(2);
        gramWeightEl.innerText = `${toPersianDigits(kgVal)} کیلوگرم (${formatToman(res.weightInGrams)} گرم)`;
      } else {
        gramWeightEl.innerText = `${toPersianDigits(res.weightInGrams.toFixed(3))} گرم`;
      }
    }
    if (usdEquivEl) usdEquivEl.innerText = `$${res.usdEquivalent.toFixed(2)}`;
  }

  // Update Currency Results HUD
  updateCurrencyResultsUI(res) {
    const totalEl = document.getElementById('calc-result-total');
    const unitEl = document.getElementById('calc-result-unit');
    const wordsEl = document.getElementById('calc-result-words');
    const rateEl = document.getElementById('curr-breakdown-rate');
    const inputEl = document.getElementById('curr-breakdown-input');
    const rialEl = document.getElementById('curr-breakdown-rial');
    const nameEl = document.getElementById('curr-breakdown-name');

    if (totalEl) {
      if (res.direction === 'fxToToman') {
        totalEl.innerText = formatToman(res.resultAmount);
        if (unitEl) unitEl.innerText = 'تومان';
      } else {
        totalEl.innerText = formatNumberWithDecimals(res.resultAmount, 2);
        if (unitEl) unitEl.innerText = res.toSymbol;
      }
    }
    if (wordsEl) wordsEl.innerText = res.words;
    if (rateEl) rateEl.innerText = `${formatToman(res.rateUsed)} تومان`;
    if (inputEl) inputEl.innerText = `${toPersianDigits(res.inputAmount)} ${res.fromSymbol}`;
    if (rialEl) rialEl.innerText = `${formatToman(res.resultAmount * 10)} ریال`;
    if (nameEl) nameEl.innerText = res.currencyName;
  }

  // Market Filter Tabs
  setupFilters() {
    const tabs = document.querySelectorAll('.filter-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        sound.playClick();
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeFilter = tab.dataset.filter;
        this.renderMarketGrid();
      });
    });
  }

  // HUD & Audio Controls
  setupHUD() {
    const soundToggle = document.getElementById('btn-sound-toggle');
    if (soundToggle) {
      soundToggle.addEventListener('click', () => {
        this.audioEnabled = sound.toggle();
        soundToggle.classList.toggle('active', this.audioEnabled);
        soundToggle.querySelector('.sound-label').innerText = this.audioEnabled ? 'صدا: روشن' : 'صدا: خاموش';
        this.showToast(this.audioEnabled ? '🔊 جلوه‌های صوتی فعال شدند.' : '🔇 صدا غیرفعال شد.');
      });
    }

    const refreshBtn = document.getElementById('btn-refresh-rates');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        sound.playChime(950, 0.2);
        refreshBtn.classList.add('spinning');
        
        try {
          // Trigger backend TGJU sync
          await fetch('/api/sync', { method: 'POST' });
        } catch (e) {}

        await this.loadRatesFromAPI();
        this.simulateMicroFluctuation();
        setTimeout(() => refreshBtn.classList.remove('spinning'), 800);
        this.showToast('نرخ‌ها با موفقیت همگام‌سازی شدند.');
      });
    }
  }

  // Dual Clock: Iranian Solar Hijri + Global Gregorian & UTC
  startClock() {
    const shamsiDateEl = document.getElementById('hud-date-shamsi');
    const tehranTimeEl = document.getElementById('hud-time-tehran');
    const globalDateEl = document.getElementById('hud-date-global');
    const utcTimeEl = document.getElementById('hud-time-utc');

    const update = () => {
      const now = new Date();

      // 1. Iranian Solar Hijri Date & Tehran Time
      try {
        const shamsiDateFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
          weekday: 'short',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        const tehranTimeFormatter = new Intl.DateTimeFormat('fa-IR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: 'Asia/Tehran'
        });

        if (shamsiDateEl) shamsiDateEl.innerText = shamsiDateFormatter.format(now);
        if (tehranTimeEl) tehranTimeEl.innerText = tehranTimeFormatter.format(now);
      } catch (e) {
        if (tehranTimeEl) tehranTimeEl.innerText = now.toLocaleTimeString('fa-IR');
      }

      // 2. Global Gregorian Date & UTC Time
      try {
        const globalDateFormatter = new Intl.DateTimeFormat('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
        const utcTimeFormatter = new Intl.DateTimeFormat('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: 'UTC'
        });

        if (globalDateEl) globalDateEl.innerText = globalDateFormatter.format(now);
        if (utcTimeEl) utcTimeEl.innerText = `${utcTimeFormatter.format(now)} UTC`;
      } catch (e) {
        if (utcTimeEl) utcTimeEl.innerText = now.toUTCString();
      }
    };

    update();
    setInterval(update, 1000);
  }

  // Market Volatility Engine (Pulsating live feel)
  startMarketFluctuation() {
    setInterval(() => {
      this.simulateMicroFluctuation();
    }, 12000);
  }

  simulateMicroFluctuation() {
    // Subtle realistic variations (-0.1% to +0.1%)
    Object.keys(this.rates).forEach(key => {
      const item = this.rates[key];
      const deltaPercent = (Math.random() - 0.48) * 0.2; // slight upward drift
      const changeAmount = Math.round(item.price * (deltaPercent / 100));
      item.price += changeAmount;
      item.change24h += deltaPercent * 0.15;
      item.history.push(item.price);
      if (item.history.length > 8) item.history.shift();
      if (item.price > item.high24h) item.high24h = item.price;
      if (item.price < item.low24h) item.low24h = item.price;
    });

    this.calculator.setRates(this.rates);
    this.renderHeroKPIs();
    this.renderMarketGrid();
  }

  showToast(message) {
    let toast = document.querySelector('.toast-msg');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast-msg';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span>✨</span><span>${message}</span>`;
    toast.classList.add('show');
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }
}

// Bootstrap
window.addEventListener('DOMContentLoaded', () => {
  window.__APP = new ZarVaArzApp();
});
