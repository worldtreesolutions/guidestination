
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

// Define available languages
export type Language = "en" | "th" | "fr";

// Define a type for potentially nested translations using a proper recursive interface
interface TranslationValue {
  [key: string]: string | TranslationValue;
}

export type Translations = TranslationValue;

// Define the context type
interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  isLoading: boolean;
}

// Create the context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key: string) => key,
  isLoading: false,
});

// Define props for the provider
interface LanguageProviderProps {
  children: React.ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>("en");
  const [translations, setTranslations] = useState<Translations>({});
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize on mount
  useEffect(() => {
    setMounted(true);
    
    // Load saved language from localStorage
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem("preferredLanguage") as Language;
      if (savedLanguage && ["en", "th", "fr"].includes(savedLanguage)) {
        setLanguageState(savedLanguage);
      }
    }
  }, []);

  // Load translations when language changes
  useEffect(() => {
    if (!mounted) return;

    const loadTranslations = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/translations/${language}.json`);
        if (response.ok) {
          const data = await response.json();
          setTranslations(data);
        } else {
          // Fallback to English
          const enResponse = await fetch(`/translations/en.json`);
          if (enResponse.ok) {
            const enData = await enResponse.json();
            setTranslations(enData);
          }
        }
      } catch (error) {
        console.error("Failed to load translations:", error);
        setTranslations({});
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [language, mounted]);

  // Set language and save to localStorage
  const setLanguage = useCallback((newLanguage: Language) => {
    if (newLanguage === language) return;
    
    setLanguageState(newLanguage);
    
    if (typeof window !== "undefined") {
      localStorage.setItem("preferredLanguage", newLanguage);
    }
  }, [language]);

  // Translation function
  const t = useCallback((key: string): string => {
    if (!mounted || isLoading || Object.keys(translations).length === 0) {
      return key;
    }

    const keys = key.split(".");
    let current: any = translations;

    for (const k of keys) {
      if (current && typeof current === "object" && k in current) {
        current = current[k];
      } else {
        return key;
      }
    }

    return typeof current === "string" ? current : key;
  }, [translations, isLoading, mounted]);

  const contextValue = useMemo(() => ({
    language,
    setLanguage,
    t,
    isLoading
  }), [language, setLanguage, t, isLoading]);

  if (!mounted) {
    return (
      <LanguageContext.Provider value={{
        language: "en",
        setLanguage: () => {},
        t: (key: string) => key,
        isLoading: true
      }}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use the language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
