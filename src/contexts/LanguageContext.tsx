
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useRouter } from "next/router";
import { currencyService } from "@/services/currencyService";

export type Language = "en" | "th" | "fr";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translations: any;
  t: (key: string) => string;
  currency: string;
  setCurrency: (currency: string) => void;
  formatCurrency: (amount: number) => string;
  isLoading: boolean;
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
  const [language, setLanguageState] = useState<Language>("en");
  const [translations, setTranslations] = useState({});
  const [currency, setCurrency] = useState("THB");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchTranslations = useCallback(async (lang: Language) => {
    try {
      const response = await fetch(`/translations/${lang}.json`);
      if (!response.ok) {
        console.error(`Failed to load ${lang}.json`);
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
    const initializeLanguage = async () => {
      setIsLoading(true);
      
      const savedLanguage = localStorage.getItem("language") as Language;
      const initialLanguage = savedLanguage || "en";
      setLanguageState(initialLanguage);
      
      if (initialLanguage === 'fr') {
        setCurrency('EUR');
      } else if (initialLanguage === 'en') {
        setCurrency('USD');
      } else {
        setCurrency('THB');
      }

      await fetchTranslations(initialLanguage);
      setIsLoading(false);
    };

    initializeLanguage();
  }, [fetchTranslations]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
    fetchTranslations(lang);
    
    if (lang === 'fr') {
      setCurrency('EUR');
    } else if (lang === 'en') {
      setCurrency('USD');
    } else {
      setCurrency('THB');
    }

    router.push(router.pathname, router.asPath, { locale: lang });
  };

  const formatCurrency = (amountInThb: number) => {
    const convertedAmount = currencyService.convertFromTHB(amountInThb, currency);
    return currencyService.formatCurrency(convertedAmount, currency);
  };

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let result: any = translations;
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return key;
      }
    }
    return typeof result === 'string' ? result : key;
  }, [translations]);

  const value = {
    language,
    setLanguage,
    translations,
    t,
    currency,
    setCurrency,
    formatCurrency,
    isLoading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
