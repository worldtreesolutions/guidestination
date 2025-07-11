// A mock currency conversion service. In a real application, this would use an API.
import { supabase } from "@/integrations/supabase/client";

// Enhanced currency conversion rates (THB as base currency)
const CURRENCY_RATES = {
  THB: 1,      // Thai Baht (base currency)
  USD: 0.028,  // US Dollar
  EUR: 0.026,  // Euro
  GBP: 0.022,  // British Pound
  JPY: 4.2,    // Japanese Yen
  CNY: 0.20,   // Chinese Yuan
  KRW: 38.5,   // Korean Won
  SGD: 0.038,  // Singapore Dollar
  AUD: 0.043,  // Australian Dollar
  CAD: 0.038,  // Canadian Dollar
  CHF: 0.025,  // Swiss Franc
  SEK: 0.31,   // Swedish Krona
  NOK: 0.31,   // Norwegian Krone
  DKK: 0.19,   // Danish Krone
  PLN: 0.11,   // Polish Zloty
  CZK: 0.65,   // Czech Koruna
  HUF: 10.8,   // Hungarian Forint
  RUB: 2.8,    // Russian Ruble
  BRL: 0.17,   // Brazilian Real
  MXN: 0.57,   // Mexican Peso
  INR: 2.4,    // Indian Rupee
  IDR: 450,    // Indonesian Rupiah
  MYR: 0.13,   // Malaysian Ringgit
  PHP: 1.6,    // Philippine Peso
  VND: 710,    // Vietnamese Dong
  TWD: 0.91,   // Taiwan Dollar
  HKD: 0.22,   // Hong Kong Dollar
  NZD: 0.047,  // New Zealand Dollar
  ZAR: 0.52,   // South African Rand
};

// Currency symbols mapping
const CURRENCY_SYMBOLS = {
  THB: "฿",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CNY: "¥",
  KRW: "₩",
  SGD: "S$",
  AUD: "A$",
  CAD: "C$",
  CHF: "CHF",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
  PLN: "zł",
  CZK: "Kč",
  HUF: "Ft",
  RUB: "₽",
  BRL: "R$",
  MXN: "$",
  INR: "₹",
  IDR: "Rp",
  MYR: "RM",
  PHP: "₱",
  VND: "₫",
  TWD: "NT$",
  HKD: "HK$",
  NZD: "NZ$",
  ZAR: "R",
};

// Country to currency mapping
const COUNTRY_CURRENCY_MAP = {
  US: "USD", CA: "CAD", GB: "GBP", AU: "AUD", NZ: "NZD",
  DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR", NL: "EUR", BE: "EUR",
  AT: "EUR", PT: "EUR", IE: "EUR", FI: "EUR", GR: "EUR", LU: "EUR",
  MT: "EUR", CY: "EUR", SK: "EUR", SI: "EUR", EE: "EUR", LV: "EUR", LT: "EUR",
  JP: "JPY", CN: "CNY", KR: "KRW", SG: "SGD", TH: "THB",
  CH: "CHF", SE: "SEK", NO: "NOK", DK: "DKK", PL: "PLN",
  CZ: "CZK", HU: "HUF", RU: "RUB", BR: "BRL", MX: "MXN",
  IN: "INR", ID: "IDR", MY: "MYR", PH: "PHP", VN: "VND",
  TW: "TWD", HK: "HKD", ZA: "ZAR",
};

export const currencyService = {
  // Get user's currency based on their location/preferences
  async getUserCurrency(): Promise<string> {
    try {
      // First check if user has saved currency preference
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.preferred_currency) {
        return user.user_metadata.preferred_currency;
      }

      // Try to detect from browser/IP geolocation with timeout
      if (typeof window !== "undefined") {
        try {
          // Add timeout to prevent hanging
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
          
          const response = await fetch("https://ipapi.co/json/", {
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            const countryCode = data.country_code;
            if (countryCode && COUNTRY_CURRENCY_MAP[countryCode]) {
              return COUNTRY_CURRENCY_MAP[countryCode];
            }
          }
        } catch (error) {
          console.warn("IP geolocation failed, using browser locale fallback:", error);
        }
        
        // Fallback to browser locale
        try {
          const locale = navigator.language || "en-US";
          const countryCode = locale.split("-")[1];
          if (countryCode && COUNTRY_CURRENCY_MAP[countryCode]) {
            return COUNTRY_CURRENCY_MAP[countryCode];
          }
        } catch (error) {
          console.warn("Browser locale detection failed:", error);
        }
      }

      return "USD"; // Default fallback
    } catch (error) {
      console.error("Error getting user currency:", error);
      return "USD";
    }
  },

  // Convert price from THB to target currency
  convertFromTHB(amountInTHB: number, targetCurrency: string): number {
    const rate = CURRENCY_RATES[targetCurrency as keyof typeof CURRENCY_RATES];
    if (!rate) {
      console.warn(`Currency ${targetCurrency} not supported, using USD`);
      return amountInTHB * CURRENCY_RATES.USD;
    }
    return Math.round((amountInTHB * rate) * 100) / 100; // Round to 2 decimal places
  },

  // Format currency with proper symbol and formatting
  formatCurrency(amount: number, currency: string): string {
    const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || currency;
    
    // Format based on currency conventions
    if (currency === "JPY" || currency === "KRW" || currency === "VND" || currency === "IDR") {
      // No decimal places for these currencies
      return `${symbol}${Math.round(amount).toLocaleString()}`;
    }
    
    return `${symbol}${amount.toFixed(2)}`;
  },

  // Get all supported currencies
  getSupportedCurrencies(): Array<{code: string, name: string, symbol: string}> {
    return Object.keys(CURRENCY_RATES).map(code => ({
      code,
      name: this.getCurrencyName(code),
      symbol: CURRENCY_SYMBOLS[code as keyof typeof CURRENCY_SYMBOLS] || code
    }));
  },

  // Get currency name
  getCurrencyName(code: string): string {
    const names: Record<string, string> = {
      THB: "Thai Baht", USD: "US Dollar", EUR: "Euro", GBP: "British Pound",
      JPY: "Japanese Yen", CNY: "Chinese Yuan", KRW: "Korean Won",
      SGD: "Singapore Dollar", AUD: "Australian Dollar", CAD: "Canadian Dollar",
      CHF: "Swiss Franc", SEK: "Swedish Krona", NOK: "Norwegian Krone",
      DKK: "Danish Krone", PLN: "Polish Zloty", CZK: "Czech Koruna",
      HUF: "Hungarian Forint", RUB: "Russian Ruble", BRL: "Brazilian Real",
      MXN: "Mexican Peso", INR: "Indian Rupee", IDR: "Indonesian Rupiah",
      MYR: "Malaysian Ringgit", PHP: "Philippine Peso", VND: "Vietnamese Dong",
      TWD: "Taiwan Dollar", HKD: "Hong Kong Dollar", NZD: "New Zealand Dollar",
      ZAR: "South African Rand"
    };
    return names[code] || code;
  },

  // Save user's preferred currency
  async saveUserCurrency(currency: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.auth.updateUser({
          data: { preferred_currency: currency }
        });
      }
    } catch (error) {
      console.error("Error saving user currency:", error);
    }
  }
};
