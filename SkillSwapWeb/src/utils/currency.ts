/**
 * Currency formatting utilities that respect user's locale
 */

export interface CurrencyOptions {
  locale?: string;
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Format a number as currency based on user's locale
 * @param amount - The numeric amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, options: CurrencyOptions = {}): string {
  const {
    locale = navigator.language || 'en-US',
    currency = getCurrencyForLocale(locale),
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options;

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(amount);
  } catch (error) {
    // Fallback to USD if locale/currency is not supported
    console.warn(`Currency formatting failed for locale ${locale}, currency ${currency}:`, error);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(amount);
  }
}

/**
 * Get the default currency for a given locale
 * @param locale - The locale string (e.g., 'en-US', 'en-GB', 'de-DE')
 * @returns Currency code (e.g., 'USD', 'GBP', 'EUR')
 */
export function getCurrencyForLocale(locale: string): string {
  // Common locale to currency mappings
  const localeCurrencyMap: Record<string, string> = {
    // English locales
    'en-US': 'USD',
    'en-CA': 'CAD',
    'en-GB': 'GBP',
    'en-AU': 'AUD',
    'en-NZ': 'NZD',
    'en-IE': 'EUR',
    
    // European locales
    'de-DE': 'EUR',
    'fr-FR': 'EUR',
    'es-ES': 'EUR',
    'it-IT': 'EUR',
    'nl-NL': 'EUR',
    'pt-PT': 'EUR',
    'fi-FI': 'EUR',
    'at-AT': 'EUR',
    'be-BE': 'EUR',
    
    // Other major currencies
    'ja-JP': 'JPY',
    'ko-KR': 'KRW',
    'zh-CN': 'CNY',
    'zh-TW': 'TWD',
    'zh-HK': 'HKD',
    'ru-RU': 'RUB',
    'pl-PL': 'PLN',
    'tr-TR': 'TRY',
    'in-IN': 'INR',
    'th-TH': 'THB',
    'id-ID': 'IDR',
    'my-MY': 'MYR',
    'sg-SG': 'SGD',
    'ph-PH': 'PHP',
    'br-BR': 'BRL',
    'mx-MX': 'MXN',
    'ar-AR': 'ARS',
    'cl-CL': 'CLP',
    'za-ZA': 'ZAR',
    'eg-EG': 'EGP',
    'sa-SA': 'SAR',
    'ae-AE': 'AED',
    'ch-CH': 'CHF',
    'no-NO': 'NOK',
    'se-SE': 'SEK',
    'dk-DK': 'DKK',
    'is-IS': 'ISK',
  };

  // Check exact match first
  if (localeCurrencyMap[locale]) {
    return localeCurrencyMap[locale];
  }

  // Check language code only (e.g., 'en' from 'en-US')
  const languageCode = locale.split('-')[0];
  const languageMatches = Object.entries(localeCurrencyMap).filter(
    ([key]) => key.startsWith(languageCode + '-')
  );

  if (languageMatches.length > 0) {
    // Return the first match for the language
    return languageMatches[0][1];
  }

  // Default fallback
  return 'USD';
}

/**
 * Get currency symbol for a given currency code
 * @param currencyCode - The ISO currency code (e.g., 'USD', 'EUR')
 * @param locale - The locale to use for formatting
 * @returns Currency symbol (e.g., '$', '€', '£')
 */
export function getCurrencySymbol(currencyCode: string, locale?: string): string {
  try {
    const formatted = new Intl.NumberFormat(locale || navigator.language, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(0);
    
    // Extract just the symbol by removing the number
    return formatted.replace(/[\d\s,.-]/g, '');
  } catch (error) {
    // Fallback symbols for common currencies
    const fallbackSymbols: Record<string, string> = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CNY': '¥',
      'KRW': '₩',
      'INR': '₹',
      'CAD': '$',
      'AUD': '$',
      'CHF': 'CHF',
      'SEK': 'kr',
      'NOK': 'kr',
      'DKK': 'kr',
    };
    
    return fallbackSymbols[currencyCode] || currencyCode;
  }
}

/**
 * Format currency for input fields (without currency symbol, just number)
 * @param amount - The numeric amount
 * @param locale - The locale for number formatting
 * @returns Formatted number string
 */
export function formatCurrencyInput(amount: number, locale?: string): string {
  try {
    return new Intl.NumberFormat(locale || navigator.language, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    return amount.toFixed(2);
  }
}

/**
 * Parse a currency input string back to a number
 * @param value - The input string (may contain commas, periods, etc.)
 * @returns Parsed number
 */
export function parseCurrencyInput(value: string): number {
  // Remove all non-digit and non-decimal characters, but keep the last decimal point
  const cleaned = value.replace(/[^\d.,]/g, '');
  
  // Handle different decimal separators (comma vs period)
  const lastComma = cleaned.lastIndexOf(',');
  const lastPeriod = cleaned.lastIndexOf('.');
  
  let normalized: string;
  
  if (lastComma > lastPeriod) {
    // Comma is decimal separator (European style: 1.234,56)
    normalized = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    // Period is decimal separator (US style: 1,234.56)
    normalized = cleaned.replace(/,/g, '');
  }
  
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}