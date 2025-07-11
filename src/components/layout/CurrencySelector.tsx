import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";

// Define currency service interface locally to avoid import issues
interface Currency {
  code: string;
  symbol: string;
  name: string;
}

const supportedCurrencies: Currency[] = [
  { code: "THB", symbol: "฿", name: "Thai Baht" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
];

const getUserCurrency = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('preferred_currency') || 'THB';
  }
  return 'THB';
};

export default function CurrencySelector() {
  const [selectedCurrency, setSelectedCurrency] = useState(getUserCurrency());

  const handleCurrencyChange = (currencyCode: string) => {
    localStorage.setItem('preferred_currency', currencyCode);
    window.location.reload();
  };

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
