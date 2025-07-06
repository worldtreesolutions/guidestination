import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check } from "lucide-react";

export function LanguageSelector() {
  const { language, setLanguage, t, isLoading } = useLanguage();
  const [mounted, setMounted] = useState(false);

  // Only show the language selector after the component has mounted
  // This prevents hydration errors with server-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  const languages: { 
    value: Language; 
    label: string; 
    fallbackLabel: string; 
    flag: string;
    country: string;
  }[] = [
    { 
      value: "en", 
      label: t("language.english"), 
      fallbackLabel: "English",
      flag: "🇺🇸",
      country: "United States"
    },
    { 
      value: "fr", 
      label: t("language.french"), 
      fallbackLabel: "Français",
      flag: "🇫🇷",
      country: "France"
    },
    { 
      value: "es", 
      label: t("language.spanish"), 
      fallbackLabel: "Español",
      flag: "🇪🇸",
      country: "Spain"
    },
    { 
      value: "zh", 
      label: t("language.chinese"), 
      fallbackLabel: "中文",
      flag: "🇨🇳",
      country: "China"
    },
    { 
      value: "th", 
      label: t("language.thai"), 
      fallbackLabel: "ไทย",
      flag: "🇹🇭",
      country: "Thailand"
    },
  ];

  const handleLanguageChange = (newLanguage: Language) => {
    if (newLanguage === language) return;
    setLanguage(newLanguage);
  };

  if (!mounted || isLoading) {
    return (
      <Button variant="outline" size="sm" disabled>
        <span className="text-base">🌐</span>
        <span className="ml-2">Loading...</span>
      </Button>
    );
  }

  const currentLanguage = languages.find((l) => l.value === language);
  const currentFlag = currentLanguage?.flag || "🌐";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="min-w-[60px]">
          <span className="text-base" title={currentLanguage?.country}>
            {currentFlag}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.value}
            onClick={() => handleLanguageChange(lang.value)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center">
              <span className="text-base mr-3" title={lang.country}>
                {lang.flag}
              </span>
              <span>{lang.label || lang.fallbackLabel}</span>
            </div>
            {language === lang.value && <Check className="h-4 w-4 ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
