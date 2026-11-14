import { INITIAL_RATES, WEIGHT_UNITS, formatToman, toPersianDigits, numberToWordsPersian } from './constants.js';
import { sound } from './sound.js';

export class CalculatorEngine {
  constructor() {
    this.rates = { ...INITIAL_RATES };

    // Gold state
    this.goldState = {
      weight: 1,
      unit: 'gram',
      purity: '18k',
      customPurity: 750,
      wageType: 'percent',
      wageValue: 0,
      profitPercent: 7,
      includeTax: true,
      taxPercent: 9
    };

    // Currency state
    this.currencyState = {
      currency: 'usd',
      direction: 'fxToToman',
      amount: 100,
      customRate: null
    };

    this.onGoldCalculateCallback = null;
    this.onCurrencyCalculateCallback = null;
  }

  setRates(updatedRates) {
    this.rates = { ...this.rates, ...updatedRates };
    this.recalculateAll();
  }

  // Calculate Gold values
  calculateGold() {
    const unitConfig = WEIGHT_UNITS[this.goldState.unit] || WEIGHT_UNITS.gram;
    const weightInGrams = this.goldState.weight * unitConfig.ratioToGram;

    let baseGramPrice = this.rates.gold18k?.price || 24794500;
    if (this.goldState.purity === '24k') {
      baseGramPrice = this.rates.gold24k?.price || 33059000;
    } else if (this.goldState.purity === 'melted') {
      baseGramPrice = (this.rates.mesghal?.price || 107403000) / 4.6083;
    }

    if (this.goldState.purity === 'custom') {
      baseGramPrice = (this.rates.gold18k.price / 750) * this.goldState.customPurity;
    }

    // Raw gold total
    const rawGoldPrice = weightInGrams * baseGramPrice;

    // Wage (اجرت)
    let wageAmount = 0;
    if (this.goldState.wageType === 'percent') {
      wageAmount = rawGoldPrice * (this.goldState.wageValue / 100);
    } else {
      wageAmount = weightInGrams * this.goldState.wageValue;
    }

    // Profit (سود طلافروش)
    const profitAmount = (rawGoldPrice + wageAmount) * (this.goldState.profitPercent / 100);

    // Tax (مالیات بر ارزش افزوده روی اجرت + سود)
    let taxAmount = 0;
    if (this.goldState.includeTax && (wageAmount + profitAmount > 0)) {
      taxAmount = (wageAmount + profitAmount) * (this.goldState.taxPercent / 100);
    }

    const totalPrice = rawGoldPrice + wageAmount + profitAmount + taxAmount;
    const pricePerGramFinal = weightInGrams > 0 ? (totalPrice / weightInGrams) : 0;
    const usdEquivalent = this.rates.usd?.price > 0 ? (totalPrice / this.rates.usd.price) : 0;

    const result = {
      weightEntered: this.goldState.weight,
      unit: unitConfig.name,
      weightInGrams,
      baseGramPrice,
      rawGoldPrice,
      wageAmount,
      profitAmount,
      taxAmount,
      totalPrice,
      pricePerGramFinal,
      usdEquivalent,
      totalWords: numberToWordsPersian(totalPrice)
    };

    if (this.onGoldCalculateCallback) {
      this.onGoldCalculateCallback(result);
    }

    return result;
  }

  // Calculate Currency values
  calculateCurrency() {
    const currKey = this.currencyState.currency;
    const rateData = this.rates[currKey] || this.rates.usd;
    const rate = this.currencyState.customRate || rateData.price;
    const amount = Number(this.currencyState.amount) || 0;

    let resultAmount = 0;
    let fromSymbol = rateData.symbol || '';
    let toSymbol = 'تومان';
    let words = '';

    if (this.currencyState.direction === 'fxToToman') {
      resultAmount = amount * rate;
      words = numberToWordsPersian(resultAmount);
    } else {
      resultAmount = rate > 0 ? (amount / rate) : 0;
      toSymbol = rateData.symbol || currKey.toUpperCase();
      fromSymbol = 'تومان';
      words = `${toPersianDigits(resultAmount.toFixed(2))} ${rateData.name}`;
    }

    const result = {
      currencyName: rateData.name,
      currencyKey: currKey,
      direction: this.currencyState.direction,
      inputAmount: amount,
      rateUsed: rate,
      resultAmount,
      fromSymbol,
      toSymbol,
      words
    };

    if (this.onCurrencyCalculateCallback) {
      this.onCurrencyCalculateCallback(result);
    }

    return result;
  }

  recalculateAll() {
    this.calculateGold();
    this.calculateCurrency();
  }
}
