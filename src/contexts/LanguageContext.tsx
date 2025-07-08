
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

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
  const loadingRef = useRef(false);
  const currentLanguageRef = useRef<Language>("en");

  // Initialize on mount
  useEffect(() => {
    setMounted(true);
    
    // Load saved language from localStorage
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem("preferredLanguage") as Language;
      if (savedLanguage && ["en", "th", "fr"].includes(savedLanguage)) {
        setLanguageState(savedLanguage);
        currentLanguageRef.current = savedLanguage;
      }
    }
  }, []);

  // Load translations when language changes - Fixed to prevent infinite loops
  useEffect(() => {
    if (!mounted || loadingRef.current || currentLanguageRef.current === language) {
      return;
    }

    const loadTranslations = async () => {
      if (loadingRef.current) return;
      
      loadingRef.current = true;
      setIsLoading(true);
      currentLanguageRef.current = language;
      
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
        loadingRef.current = false;
      }
    };

    loadTranslations();
  }, [language, mounted]);

  // Set language and save to localStorage - Fixed: Remove language dependency
  const setLanguage = useCallback((newLanguage: Language) => {
    if (newLanguage === currentLanguageRef.current) return;
    
    setLanguageState(newLanguage);
    
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("preferredLanguage", newLanguage);
      } catch (error) {
        console.error("Error saving language to localStorage:", error);
      }
    }
  }, []);

  // Translation function - Memoized to prevent unnecessary re-renders
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

  // Show loading state until mounted
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
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      t,
      isLoading
    }}>
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
