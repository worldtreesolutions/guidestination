import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { currencyService } from "@/services/currencyService";
import { Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CurrencySelector() {
  const {
    getUserCurrency,
    formatCurrency,
    getSupportedCurrencies,
    getCurrencyName,
    setCurrency,
  } = useLanguage();
  const [selectedCurrency, setSelectedCurrency] = useState(getUserCurrency());

  const handleCurrencyChange = (currencyCode: string) => {
    setCurrency(currencyCode);
    window.location.reload(); // Reload to apply currency changes
  };

  const supportedCurrencies = getSupportedCurrencies();

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-muted-foreground" />
      <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
        <SelectTrigger className="w-24 h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {supportedCurrencies.map((currency) => (
            <SelectItem key={currency.code} value={currency.code}>
              <div className="flex items-center gap-2">
                <span>{currency.symbol}</span>
                <span>{currency.code}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
