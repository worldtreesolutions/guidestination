
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check } from "lucide-react";

export type Language = "en" | "th" | "fr";

export function LanguageSelector() {
  const { language, setLanguage, isLoading } = useLanguage();
  const [mounted, setMounted] = useState(false);

  // Only show the language selector after the component has mounted
  // This prevents hydration errors with server-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  const languages = [
    { code: "en" as const, name: "English", flag: "🇺🇸" },
    { code: "th" as const, name: "ไทย", flag: "🇹🇭" },
    { code: "fr" as const, name: "Français", flag: "🇫🇷" }
  ];

  const handleLanguageChange = (newLanguage: Language) => {
    if (newLanguage === language) return;
    
    if (typeof window !== 'undefined') {
      try {
        // Save the language preference to localStorage
        localStorage.setItem("preferredLanguage", newLanguage);
        
        // Update the language context state
        setLanguage(newLanguage);
        
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
        <span className="text-base">🌐</span>
      </Button>
    );
  }

  const currentLanguage = languages.find((l) => l.code === language);
  const currentFlag = currentLanguage?.flag || "🌐";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="min-w-[60px]">
          <span className="text-base" title={currentLanguage?.name}>
            {currentFlag}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center">
              <span className="text-base mr-3" title={lang.name}>
                {lang.flag}
              </span>
              <span>{lang.name}</span>
            </div>
            {language === lang.code && <Check className="h-4 w-4 ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LanguageSelector;
