import { useState, useEffect } from "react";
import { useRouter } from "next/router"; // Corrected typo: removed 's'
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Globe } from "lucide-react";

export function LanguageSelector() {
  const { language, setLanguage, t, isLoading } = useLanguage();
  const [mounted, setMounted] = useState(false);

  // Only show the language selector after the component has mounted
  // This prevents hydration errors with server-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  const languages: { value: Language; label: string; fallbackLabel: string }[] = [
    { value: "en", label: t("language.english"), fallbackLabel: "English" },
    { value: "fr", label: t("language.french"), fallbackLabel: "Français" },
    { value: "es", label: t("language.spanish"), fallbackLabel: "Español" },
    { value: "zh", label: t("language.chinese"), fallbackLabel: "中文" },
    { value: "th", label: t("language.thai"), fallbackLabel: "ไทย" },
  ];

  const handleLanguageChange = (newLanguage: Language) => {
    console.log(`Language selector: changing from ${language} to ${newLanguage}`);
    
    if (typeof window !== 'undefined') {
      try {
        // Save the language preference to localStorage
        localStorage.setItem("preferredLanguage", newLanguage);
        console.log(`Saved language preference to localStorage: ${newLanguage}`);
        
        // Force a hard page reload to ensure all components update with the new language
        console.log("Forcing page reload to apply language change");
        window.location.reload();
      } catch (error) {
        console.error("Error during language change:", error);
        
        // If there's an error with localStorage, still try to update the language state
        setLanguage(newLanguage);
      }
    } else {
      // Fallback for non-browser environments
      setLanguage(newLanguage);
    }
  };

  if (!mounted || isLoading) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Globe className="h-4 w-4 mr-2" />
        <span>Loading...</span>
      </Button>
    );
  }

  const currentLanguage = languages.find((l) => l.value === language);
  const displayLabel = currentLanguage?.label || currentLanguage?.fallbackLabel || "English";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Globe className="h-4 w-4 mr-2" />
          <span>{displayLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.value}
            onClick={() => handleLanguageChange(lang.value)}
            className="flex items-center justify-between"
          >
            <span>{lang.label || lang.fallbackLabel}</span>
            {language === lang.value && <Check className="h-4 w-4 ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
