import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { detectUserCurrency } from "@/utils/geoCurrency";
import { fetchExchangeRates } from "@/utils/exchangeRates";

export type Currency = "THB" | "USD" | "EUR";

interface CurrencyContextProps {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  rates: Record<string, number>;
  convert: (amountTHB: number, to: Currency) => number;
}

const CurrencyContext = createContext<CurrencyContextProps | undefined>(undefined);


export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always initialize with 'THB' for SSR safety
  const [currency, setCurrencyState] = useState<Currency>("THB");
  const [rates, setRates] = useState<Record<string, number>>({ THB: 1, USD: 0.027, EUR: 0.025 });

  // On mount, check localStorage for currency, else auto-detect
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('selectedCurrency');
    console.log('[CurrencyContext] useEffect mount: localStorage.selectedCurrency =', stored);
    if (stored && ["THB", "USD", "EUR"].includes(stored)) {
      setCurrencyState(stored as Currency);
      console.log('[CurrencyContext] Loaded currency from localStorage:', stored);
    } else {
      (async () => {
        const detected = await detectUserCurrency();
        if (detected && ["THB", "USD", "EUR"].includes(detected)) {
          setCurrencyState(detected as Currency);
          localStorage.setItem('selectedCurrency', detected);
          console.log('[CurrencyContext] Detected and set currency:', detected);
        }
      })();
    }
  }, []);

  // When user changes currency, persist to localStorage
  const setCurrency = (cur: Currency) => {
    setCurrencyState(cur);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCurrency', cur);
      console.log('[CurrencyContext] setCurrency called:', cur);
    }
  };

  // Fetch exchange rates on first load
  // Fetch exchange rates every time the currency changes
  useEffect(() => {
    (async () => {
      try {
        const fetchedRates = await fetchExchangeRates("THB");
        console.log('[CurrencyContext] fetchedRates from API:', fetchedRates);
        // Only keep supported currencies
        const filteredRates = {
          THB: 1,
          USD: fetchedRates.USD,
          EUR: fetchedRates.EUR
        };
        setRates(filteredRates);
        console.log('[CurrencyContext] rates set in state:', filteredRates);
      } catch (e) {
        console.error('[CurrencyContext] Failed to fetch exchange rates:', e);
        // fallback to static rates
      }
    })();
  }, [currency]);

  // Conversion function using live rates
  const convert = useCallback((amountTHB: number, to: Currency) => {
    if (!rates[to]) return amountTHB;
    return +(amountTHB * rates[to]).toFixed(2);
  }, [rates]);

  useEffect(() => {
    console.log('[CurrencyContext] currency state changed:', currency);
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates, convert }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used within a CurrencyProvider");
  return context;
};
