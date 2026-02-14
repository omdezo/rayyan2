export type CurrencyCode = 'OMR' | 'SAR' | 'QAR' | 'AED' | 'BHD' | 'KWD';

export interface Currency {
  code: CurrencyCode;
  name: string;
  nameAr: string;
  symbol: string;
  symbolAr: string;
  flag: string; // Flag emoji
  country: string;
  countryAr: string;
  // Conversion rate to OMR (base currency)
  toOMR: number;
}

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  OMR: {
    code: 'OMR',
    name: 'Omani Rial',
    nameAr: 'ريال عماني',
    symbol: 'OMR',
    symbolAr: 'ر.ع',
    flag: '🇴🇲',
    country: 'Oman',
    countryAr: 'عمان',
    toOMR: 1,
  },
  SAR: {
    code: 'SAR',
    name: 'Saudi Riyal',
    nameAr: 'ريال سعودي',
    symbol: 'SAR',
    symbolAr: 'ر.س',
    flag: '🇸🇦',
    country: 'Saudi Arabia',
    countryAr: 'السعودية',
    toOMR: 0.1027, // 1 SAR = 0.1027 OMR
  },
  QAR: {
    code: 'QAR',
    name: 'Qatari Riyal',
    nameAr: 'ريال قطري',
    symbol: 'QAR',
    symbolAr: 'ر.ق',
    flag: '🇶🇦',
    country: 'Qatar',
    countryAr: 'قطر',
    toOMR: 0.106, // 1 QAR = 0.106 OMR
  },
  AED: {
    code: 'AED',
    name: 'UAE Dirham',
    nameAr: 'درهم اماراتي',
    symbol: 'AED',
    symbolAr: 'د.إ',
    flag: '🇦🇪',
    country: 'UAE',
    countryAr: 'الإمارات',
    toOMR: 0.105, // 1 AED = 0.105 OMR
  },
  BHD: {
    code: 'BHD',
    name: 'Bahraini Dinar',
    nameAr: 'دينار بحريني',
    symbol: 'BHD',
    symbolAr: 'د.ب',
    flag: '🇧🇭',
    country: 'Bahrain',
    countryAr: 'البحرين',
    toOMR: 1.024, // 1 BHD = 1.024 OMR
  },
  KWD: {
    code: 'KWD',
    name: 'Kuwaiti Dinar',
    nameAr: 'دينار كويتي',
    symbol: 'KWD',
    symbolAr: 'د.ك',
    flag: '🇰🇼',
    country: 'Kuwait',
    countryAr: 'الكويت',
    toOMR: 1.257, // 1 KWD = 1.257 OMR
  },
};

/**
 * Convert price from OMR to target currency
 */
export function convertFromOMR(priceInOMR: number, targetCurrency: CurrencyCode): number {
  const currency = CURRENCIES[targetCurrency];
  return priceInOMR / currency.toOMR;
}

/**
 * Convert price from any currency to OMR
 */
export function convertToOMR(price: number, fromCurrency: CurrencyCode): number {
  const currency = CURRENCIES[fromCurrency];
  return price * currency.toOMR;
}

/**
 * Format price with currency symbol
 */
export function formatPrice(
  priceInOMR: number,
  currency: CurrencyCode,
  locale: 'ar' | 'en' = 'ar',
  decimals?: number
): string {
  const targetCurrency = CURRENCIES[currency];
  const convertedPrice = convertFromOMR(priceInOMR, currency);

  // Determine decimal places based on currency
  // BHD, KWD, OMR use 3 decimals, others use 2
  const decimalPlaces = decimals !== undefined
    ? decimals
    : (['BHD', 'KWD', 'OMR'].includes(currency) ? 3 : 2);

  const formattedNumber = convertedPrice.toFixed(decimalPlaces);
  const symbol = locale === 'ar' ? targetCurrency.symbolAr : targetCurrency.symbol;

  return `${formattedNumber} ${symbol}`;
}

/**
 * Get currency display name
 */
export function getCurrencyName(currency: CurrencyCode, locale: 'ar' | 'en' = 'ar'): string {
  return locale === 'ar' ? CURRENCIES[currency].nameAr : CURRENCIES[currency].name;
}
