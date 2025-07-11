import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useRouter } from "next/router";
import { currencyService } from "@/services/currencyService";

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  translations: any;
  currency: string;
  setCurrency: (currency: string) => void;
  formatCurrency: (amount: number) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState("en");
  const [translations, setTranslations] = useState({});
  const [currency, setCurrency] = useState("THB");
  const router = useRouter();

  const fetchTranslations = useCallback(async (lang: string) => {
    try {
      const response = await fetch(`/translations/${lang}.json`);
      if (!response.ok) {
        console.error(`Failed to load ${lang}.json`);
        // Fallback to English if the language file is not found
        if (lang !== "en") {
          await fetchTranslations("en");
        }
        return;
      }
      const data = await response.json();
      setTranslations(data);
    } catch (error) {
      console.error("Error fetching translations:", error);
      if (lang !== "en") {
        await fetchTranslations("en");
      }
    }
  }, []);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");
    const initialLanguage = savedLanguage || "en";
    setLanguageState(initialLanguage);
    
    // Set currency based on language
    if (initialLanguage === 'fr') {
      setCurrency('EUR');
    } else if (initialLanguage === 'en') {
      setCurrency('USD');
    } else {
      setCurrency('THB');
    }

    fetchTranslations(initialLanguage);
  }, [fetchTranslations]);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
    fetchTranslations(lang);
    
    // Update currency when language changes
    if (lang === 'fr') {
      setCurrency('EUR');
    } else if (lang === 'en') {
      setCurrency('USD');
    } else {
      setCurrency('THB');
    }

    // Optional: force a reload to ensure all components re-render with the new language
    router.push(router.pathname, router.asPath, { locale: lang });
  };

  const formatCurrency = (amountInThb: number) => {
    const convertedAmount = currencyService.convert(amountInThb, "THB", currency);
    const symbol = currencyService.getCurrencySymbol(currency);
    return `${symbol}${convertedAmount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const value = {
    language,
    setLanguage,
    translations,
    currency,
    setCurrency,
    formatCurrency,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
