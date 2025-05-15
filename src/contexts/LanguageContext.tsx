
import React, { createContext, useContext, useState, useEffect } from "react";

// Define available languages
export type Language = "en" | "th" | "zh" | "es" | "fr";

// Define the context type
interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

// Create the context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key: string) => key,
});

// Define props for the provider
interface LanguageProviderProps {
  children: React.ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  // Initialize language from localStorage or default to English
  const [language, setLanguageState] = useState<Language>("en");
  const [translations, setTranslations] = useState<Record<string, string>>({});

  // Load translations when language changes
  useEffect(() => {
    const loadTranslations = async () => {
      try {
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
        setTranslations(translationData);
      } catch (error) {
        console.error(`Failed to load translations for ${language}:`, error);
        // Fallback to English if translation file is missing
        if (language !== "en") {
          const fallbackModule = await import("@/translations/en.json");
          setTranslations(fallbackModule.default);
        }
      }
    };

    loadTranslations();
  }, [language]);

  // Set language and save to localStorage
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem("preferredLanguage", newLanguage);
  };

  // Load language from localStorage on initial render
  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferredLanguage") as Language;
    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Translation function
  const t = (key: string): string => {
    return translations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
