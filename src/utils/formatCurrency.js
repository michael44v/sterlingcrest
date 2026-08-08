let exchangeRates = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.78,
  CAD: 1.36,
  AUD: 1.51,
  JPY: 156.0,
  INR: 83.3,
  CNY: 7.24,
  CHF: 0.90,
  SGD: 1.35
};

// Try to load cached rates from localStorage
try {
  const cached = localStorage.getItem('exchange_rates');
  if (cached) {
    exchangeRates = { ...exchangeRates, ...JSON.parse(cached) };
  }
} catch (e) {}

export const fetchRates = async () => {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await res.json();
    if (data && data.rates) {
      exchangeRates = { ...exchangeRates, ...data.rates };
      try {
        localStorage.setItem('exchange_rates', JSON.stringify(exchangeRates));
      } catch (e) {}
    }
  } catch (e) {
    console.warn('Could not fetch exchange rates, using fallback rates', e);
  }
  return exchangeRates;
};

// Call fetchRates immediately to refresh rates asynchronously
fetchRates().catch(() => {});

export const getLocale = (currency) => {
  const map = {
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB',
    CAD: 'en-CA',
    AUD: 'en-AU',
    JPY: 'ja-JP',
    INR: 'en-IN',
    CNY: 'zh-CN',
    CHF: 'de-CH',
    SGD: 'en-SG',
  };
  return map[currency] || 'en-US';
};

export const getSymbol = (currency) => {
  const symbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'CA$',
    AUD: 'A$',
    JPY: '¥',
    INR: '₹',
    CNY: '¥',
    CHF: 'CHF',
    SGD: 'S$',
  };
  return symbols[currency] || '$';
};

export const formatUSD = (amount, overrideCurrency) => {
  const currencyCode = overrideCurrency || localStorage.getItem('user_currency') || 'USD';
  const rate = exchangeRates[currencyCode] || 1.0;
  const converted = Number(amount) * rate;

  return new Intl.NumberFormat(getLocale(currencyCode), {
    style: 'currency',
    currency: currencyCode,
  }).format(converted);
};

export const formatUSD_S = (amount, overrideCurrency) => {
  const currencyCode = overrideCurrency || localStorage.getItem('user_currency') || 'USD';
  const rate = exchangeRates[currencyCode] || 1.0;
  const value = Number(amount) * rate;

  // Handle Millions
  if (value >= 1000000) {
    return `${getSymbol(currencyCode)}${(value / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  
  // Handle Thousands
  if (value >= 1000) {
    return `${getSymbol(currencyCode)}${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  
  // Handle standard small amounts
  return new Intl.NumberFormat(getLocale(currencyCode), {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(value);
};
