import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

// Define available languages
export type Language = "en" | "th" | "zh" | "es" | "fr";

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
  isLoading: true,
});

// Define props for the provider
interface LanguageProviderProps {
  children: React.ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  // Initialize language from localStorage or default to English
  const [language, setLanguageState] = useState<Language>("en");
  const [translations, setTranslations] = useState<Translations>({});
  const [isLoading, setIsLoading] = useState(false); // Changed to false to prevent blocking
  const [isInitialized, setIsInitialized] = useState(false);

  // Load language from localStorage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedLanguage = localStorage.getItem("preferredLanguage") as Language;
        if (savedLanguage && ["en", "th", "zh", "es", "fr"].includes(savedLanguage)) {
          console.log(`Initializing with saved language: ${savedLanguage}`);
          setLanguageState(savedLanguage);
        } else {
          console.log("No valid saved language found, using default: en");
        }
      } catch (error) {
        console.error("Error reading language from localStorage:", error);
      }
      setIsInitialized(true);
    }
  }, []);

  // Load translations when language changes
  useEffect(() => {
    if (!isInitialized) return;

    const loadTranslations = async () => {
      try {
        console.log(`Loading translations for language: ${language}`);
        
        // All languages are dynamically imported for consistency
        const langModule = await import(`@/translations/${language}.json`);
        setTranslations(langModule.default as Translations);
      } catch (error) {
        console.error(`Failed to load translations for ${language}:`, error);
        // Fallback to English if loading fails
        try {
          const enTranslationsModule = (await import("@/translations/en.json"));
          setTranslations(enTranslationsModule.default as Translations);
        } catch (fallbackError) {
          console.error("Failed to load English fallback translations:", fallbackError);
          setTranslations({}); // Set to empty object on error
        }
      }
    };

    loadTranslations();
  }, [language, isInitialized]);

  // Set language and save to localStorage
  const setLanguage = useCallback((newLanguage: Language) => {
    if (newLanguage === language) return;
    
    console.log(`Changing language from ${language} to ${newLanguage}`);
    
    // Save to localStorage first
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem("preferredLanguage", newLanguage);
        console.log(`Saved language preference to localStorage: ${newLanguage}`);
      } catch (error) {
        console.error("Error saving language to localStorage:", error);
      }
    }
    
    // Update state after localStorage is updated
    setLanguageState(newLanguage);
  }, [language]);

  // Translation function - simplified to not block on loading
  const t = useCallback((key: string): string => {
    if (Object.keys(translations).length === 0) {
      return key; // Return key if no translations loaded yet
    }

    const keys = key.split(".");
    let current: string | TranslationValue | undefined = translations;

    for (const k of keys) {
      if (typeof current === "object" && current !== null && k in current) {
        current = current[k] as string | TranslationValue;
      } else {
        return key; // Return the full key if any segment is not found
      }
    }

    if (typeof current === "string") {
      return current;
    } else {
      return key; // Return the key itself
    }
  }, [translations]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    language,
    setLanguage,
    t,
    isLoading: false // Always false to prevent blocking
  }), [language, setLanguage, t]);

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
