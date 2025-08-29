import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useRouter } from "next/router";
import { currencyService } from "@/services/currencyService";
import { translations, getTranslationValue, interpolate, type SupportedLanguage } from "@/lib/translations";

export type Language = SupportedLanguage;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
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
  const [currentTranslations, setCurrentTranslations] = useState<any>(translations.en);
  const [currency, setCurrency] = useState("THB");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Enhanced translation function with interpolation support
  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    const value = getTranslationValue(currentTranslations, key, key);
    
    if (params) {
      return interpolate(value, params);
    }
    
    return value;
  }, [currentTranslations]);

  // Set language and update currency
  const setLanguage = useCallback((newLanguage: Language) => {
    setLanguageState(newLanguage);
    setCurrentTranslations(translations[newLanguage] as any);
    
    // Auto-update currency based on language
    if (newLanguage === 'fr') {
      setCurrency('EUR');
    } else if (newLanguage === 'en') {
      setCurrency('USD');
    } else {
      setCurrency('THB');
    }
    
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("language", newLanguage);
    }

    // Update router locale if needed
    if (typeof window !== "undefined") {
      router.push(router.pathname, router.asPath, { locale: newLanguage });
    }
  }, [router]);

  // Format currency using the currency service
  const formatCurrency = useCallback((amountInThb: number) => {
    const convertedAmount = currencyService.convertFromTHB(amountInThb, currency);
    return currencyService.formatCurrency(convertedAmount, currency);
  }, [currency]);

  // Initialize language from localStorage
  useEffect(() => {
    const initializeLanguage = () => {
      setIsLoading(true);
      
      let initialLanguage: Language = "en";
      
      // Only access localStorage on client side
      if (typeof window !== "undefined") {
        const savedLanguage = localStorage.getItem("language") as Language;
        if (savedLanguage && translations[savedLanguage]) {
          initialLanguage = savedLanguage;
        }
      }
      
      // Initialize without calling setLanguage to avoid infinite loop
      setLanguageState(initialLanguage);
      setCurrentTranslations(translations[initialLanguage] as any);
      
      // Auto-update currency based on language
      if (initialLanguage === 'fr') {
        setCurrency('EUR');
      } else if (initialLanguage === 'en') {
        setCurrency('USD');
      } else {
        setCurrency('THB');
      }
      
      setIsLoading(false);
    };

    initializeLanguage();
  }, []); // Empty dependency array to run only once

  const value = {
    language,
    setLanguage,
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
