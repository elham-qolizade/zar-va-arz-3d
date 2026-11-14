/**
 * ZAR & ARZ 3D • Constants & Persian Utilities
 */

export const INITIAL_RATES = {
  gold18k: {
    id: 'gold18k',
    name: 'طلای ۱۸ عیار (۷۵۰)',
    enName: 'Gold 18K (Gram)',
    price: 24794500,
    change24h: 1.45,
    unit: 'تومان / گرم',
    high24h: 25150000,
    low24h: 24500000,
    category: 'gold',
    history: [24300000, 24450000, 24600000, 24550000, 24700000, 24750000, 24794500]
  },
  gold24k: {
    id: 'gold24k',
    name: 'طلای ۲۴ عیار (۹۹۹)',
    enName: 'Gold 24K (Gram)',
    price: 33059000,
    change24h: 1.45,
    unit: 'تومان / گرم',
    high24h: 33500000,
    low24h: 32800000,
    category: 'gold',
    history: [32400000, 32600000, 32800000, 32750000, 32950000, 33000000, 33059000]
  },
  mesghal: {
    id: 'mesghal',
    name: 'مظنه / مثقال طلا',
    enName: 'Mesghal Gold',
    price: 107403000,
    change24h: 1.52,
    unit: 'تومان / مثقال (۴.۶۰۸ گرم)',
    high24h: 108900000,
    low24h: 106500000,
    category: 'gold',
    history: [105500000, 106000000, 106800000, 106500000, 107100000, 107250000, 107403000]
  },
  coinEmami: {
    id: 'coinEmami',
    name: 'سکه تمام بهار (امامی)',
    enName: 'Emami Gold Coin',
    price: 252515000,
    change24h: 1.85,
    unit: 'تومان',
    high24h: 256000000,
    low24h: 249000000,
    bubble: 38500000,
    bubblePercent: 15.2,
    weight: 8.133,
    category: 'coin',
    history: [247000000, 248500000, 250500000, 249500000, 251500000, 252000000, 252515000]
  },
  coinBahar: {
    id: 'coinBahar',
    name: 'سکه تمام طرح قدیم (بهار آزادی)',
    enName: 'Bahar Azadi Coin',
    price: 245080000,
    change24h: 1.35,
    unit: 'تومان',
    high24h: 248000000,
    low24h: 242000000,
    bubble: 31000000,
    bubblePercent: 12.6,
    weight: 8.133,
    category: 'coin',
    history: [240000000, 241500000, 243500000, 243000000, 244500000, 244800000, 245080000]
  },
  coinHalf: {
    id: 'coinHalf',
    name: 'نیم سکه بهار آزادی',
    enName: 'Half Coin',
    price: 132860000,
    change24h: 1.25,
    unit: 'تومان',
    high24h: 135000000,
    low24h: 130500000,
    bubble: 26000000,
    bubblePercent: 19.5,
    weight: 4.066,
    category: 'coin',
    history: [129500000, 130500000, 131800000, 131200000, 132200000, 132600000, 132860000]
  },
  coinQuarter: {
    id: 'coinQuarter',
    name: 'ربع سکه بهار آزادی',
    enName: 'Quarter Coin',
    price: 72470000,
    change24h: 2.15,
    unit: 'تومان',
    high24h: 74000000,
    low24h: 71000000,
    bubble: 19500000,
    bubblePercent: 26.9,
    weight: 2.033,
    category: 'coin',
    history: [70500000, 71200000, 71800000, 71500000, 72100000, 72300000, 72470000]
  },
  coinGram: {
    id: 'coinGram',
    name: 'سکه یک گرمی',
    enName: '1-Gram Coin',
    price: 37000000,
    change24h: 0.55,
    unit: 'تومان',
    high24h: 37800000,
    low24h: 36500000,
    bubble: 10500000,
    bubblePercent: 28.3,
    weight: 1.01,
    category: 'coin',
    history: [36100000, 36300000, 36600000, 36500000, 36800000, 36900000, 37000000]
  },
  usd: {
    id: 'usd',
    name: 'دلار آمریکا (بازار آزاد)',
    enName: 'US Dollar (USD)',
    price: 269900,
    change24h: 0.85,
    unit: 'تومان',
    high24h: 272500,
    low24h: 267000,
    symbol: '$',
    category: 'currency',
    history: [266500, 267200, 268500, 268000, 269200, 269600, 269900]
  },
  eur: {
    id: 'eur',
    name: 'یورو اروپا',
    enName: 'Euro (EUR)',
    price: 297880,
    change24h: 0.65,
    unit: 'تومان',
    high24h: 301000,
    low24h: 295000,
    symbol: '€',
    category: 'currency',
    history: [294500, 295500, 296800, 296200, 297200, 297600, 297880]
  },
  aed: {
    id: 'aed',
    name: 'درهم امارات',
    enName: 'UAE Dirham (AED)',
    price: 73763,
    change24h: 0.72,
    unit: 'تومان',
    high24h: 74500,
    low24h: 73100,
    symbol: 'د.إ',
    category: 'currency',
    history: [72900, 73150, 73500, 73350, 73600, 73700, 73763]
  },
  usdt: {
    id: 'usdt',
    name: 'تتر (دلار دیجیتال)',
    enName: 'Tether (USDT)',
    price: 270863,
    change24h: 0.95,
    unit: 'تومان',
    high24h: 273000,
    low24h: 268500,
    symbol: '₮',
    category: 'currency',
    history: [267500, 268500, 269800, 269200, 270200, 270600, 270863]
  },
  globalOunce: {
    id: 'globalOunce',
    name: 'انس جهانی طلا',
    enName: 'Gold Spot Ounce',
    price: 3883.9,
    change24h: 0.42,
    unit: 'دلار / اونس',
    high24h: 3910.0,
    low24h: 3865.0,
    symbol: 'oz',
    category: 'global',
    history: [3850, 3862, 3875, 3868, 3878, 3882, 3883.9]
  }
};

export const WEIGHT_UNITS = {
  soot: { id: 'soot', name: 'سوت', ratioToGram: 0.001, desc: 'هر ۱۰۰۰ سوت = ۱ گرم' },
  gram: { id: 'gram', name: 'گرم', ratioToGram: 1, desc: 'واحد پایه استاندارد' },
  mesghal: { id: 'mesghal', name: 'مثقال', ratioToGram: 4.6083, desc: 'معادل ۴.۶۰۸۳ گرم' },
  kg: { id: 'kg', name: 'کیلوگرم', ratioToGram: 1000, desc: 'شمش استاندارد بانکی' },
  ton: { id: 'ton', name: 'تُن (۱۰۰۰ کیلوگرم)', ratioToGram: 1000000, desc: 'تناژ سنگین و شمش‌های عمده' },
  ounce: { id: 'ounce', name: 'اونس تروا', ratioToGram: 31.1034768, desc: 'معیار بازارهای بین‌المللی' }
};

export function toPersianDigits(n) {
  if (n === null || n === undefined) return '';
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return n.toString().replace(/[0-9]/g, (d) => farsiDigits[d]);
}

export function formatToman(amount) {
  if (isNaN(amount) || amount === null || amount === undefined) return '۰';
  // Use BigInt for massive numbers without scientific notation
  const rounded = Math.floor(Math.abs(amount));
  let str = '';
  try {
    str = BigInt(rounded).toString();
  } catch (e) {
    str = rounded.toString();
  }
  const parts = str.replace(/\B(?=(\d{3})+(?!\d))/g, '،');
  return toPersianDigits(parts);
}

export function formatNumberWithDecimals(val, decimals = 2) {
  if (isNaN(val)) return '۰';
  const parts = Number(val).toFixed(decimals).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '،');
  return toPersianDigits(parts);
}

export function numberToWordsPersian(num) {
  if (isNaN(num) || num === null || num === undefined) return 'صفر تومان';
  const absVal = Math.floor(Math.abs(num));
  if (absVal === 0) return 'صفر تومان';

  const yekan = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'];
  const dahgan = ['', 'ده', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];
  const dahha = ['ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده'];
  const sadgan = ['', 'یکصد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد'];
  const hezar = [
    '',
    ' هزار',
    ' میلیون',
    ' میلیارد',
    ' تریلیون',
    ' کوآدریلیون',
    ' کوئینتیلیون',
    ' سکستیلیون',
    ' سپتیلیون',
    ' اکتیلیون'
  ];

  let result = [];
  let partIdx = 0;

  let bigNum = BigInt(absVal);

  while (bigNum > 0n) {
    let p = Number(bigNum % 1000n);
    if (p > 0) {
      let partWords = [];
      let s = Math.floor(p / 100);
      let d = Math.floor((p % 100) / 10);
      let y = p % 10;

      if (s > 0) partWords.push(sadgan[s]);

      if (d === 1) {
        partWords.push(dahha[y]);
      } else {
        if (d > 0) partWords.push(dahgan[d]);
        if (y > 0) partWords.push(yekan[y]);
      }

      const unitWord = partIdx < hezar.length ? hezar[partIdx] : ` × ۱۰^${partIdx * 3}`;
      let subStr = partWords.join(' و ') + unitWord;
      result.unshift(subStr);
    }
    bigNum = bigNum / 1000n;
    partIdx++;
  }

  return result.join(' و ') + ' تومان';
}
