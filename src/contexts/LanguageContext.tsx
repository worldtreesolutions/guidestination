import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

// Define available languages
export type Language = "en" | "th" | "zh" | "es" | "fr";

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
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

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
      setIsLoading(true);
      try {
        console.log(`Loading translations for language: ${language}`);
        // Dynamic import of translations
        let translationData;
        switch (language) {
          case "en":
            translationData = (await import("@/translations/en.json")).default;
            break;
          case "th":
            translationData = (await import("@/translations/th.json")).default;
            break;
          case "zh":
            translationData = (await import("@/translations/zh.json")).default;
            break;
          case "es":
            translationData = (await import("@/translations/es.json")).default;
            break;
          case "fr":
            translationData = (await import("@/translations/fr.json")).default;
            break;
          default:
            translationData = (await import("@/translations/en.json")).default;
        }
        console.log(`Loaded ${Object.keys(translationData).length} translation keys for ${language}`);
        setTranslations(translationData);
        // Force a re-render to ensure all components update
        setForceUpdate(prev => prev + 1);
      } catch (error) {
        console.error(`Failed to load translations for ${language}:`, error);
        // Fallback to English if translation file is missing
        if (language !== "en") {
          try {
            const fallbackModule = await import("@/translations/en.json");
            setTranslations(fallbackModule.default);
            console.log("Loaded fallback English translations");
          } catch (fallbackError) {
            console.error("Failed to load fallback translations:", fallbackError);
            setTranslations({});
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [language, isInitialized]);

  // Set language and save to localStorage
  const setLanguage = useCallback((newLanguage: Language) => {
    if (newLanguage === language) return;
    
    console.log(`Changing language from ${language} to ${newLanguage}`);
    setLanguageState(newLanguage);
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem("preferredLanguage", newLanguage);
        console.log(`Saved language preference to localStorage: ${newLanguage}`);
      } catch (error) {
        console.error("Error saving language to localStorage:", error);
      }
    }
    
    // Force a re-render of all components using the language context
    setForceUpdate(prev => prev + 1);
  }, [language]);

  // Translation function
  const t = useCallback((key: string): string => {
    if (isLoading || !translations) {
      return key;
    }
    
    const translation = translations[key];
    if (!translation) {
      // Only log missing translations in development
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Translation missing for key: ${key} in language: ${language}`);
      }
      return key;
    }
    
    return translation;
  }, [isLoading, translations, language]);

  // Log current state for debugging
  useEffect(() => {
    console.log(`LanguageContext updated: language=${language}, isLoading=${isLoading}, translationsCount=${Object.keys(translations).length}, forceUpdate=${forceUpdate}`);
  }, [language, isLoading, translations, forceUpdate]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    language,
    setLanguage,
    t,
    isLoading
  }), [language, setLanguage, t, isLoading, forceUpdate]);

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
