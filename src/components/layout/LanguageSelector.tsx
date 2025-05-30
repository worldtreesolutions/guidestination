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
    
    // Apply the language change
    setLanguage(newLanguage);
    
    // Force a page refresh to ensure all components update with the new language
    // This is a more robust approach to ensure language changes are applied everywhere
    if (typeof window !== 'undefined') {
      // Use a small timeout to ensure the language is saved to localStorage first
      setTimeout(() => {
        window.location.reload();
      }, 50);
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
