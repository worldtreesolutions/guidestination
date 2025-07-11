
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { currencyService } from "@/services/currencyService";
import { Globe } from "lucide-react";

export default function CurrencySelector() {
  const [currentCurrency, setCurrentCurrency] = useState("USD");
  const [currencies, setCurrencies] = useState<Array<{code: string, name: string, symbol: string}>>([]);

  useEffect(() => {
    // Get current user currency (synchronous)
    const userCurrency = currencyService.getUserCurrency();
    setCurrentCurrency(userCurrency);
    
    // Get all supported currencies
    setCurrencies(currencyService.getSupportedCurrencies());
  }, []);

  const handleCurrencyChange = async (newCurrency: string) => {
    setCurrentCurrency(newCurrency);
    await currencyService.saveUserCurrency(newCurrency);
    
    // Refresh the page to update all prices
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-muted-foreground" />
      <Select value={currentCurrency} onValueChange={handleCurrencyChange}>
        <SelectTrigger className="w-24 h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {currencies.map((currency) => (
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
