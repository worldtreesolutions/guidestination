// Simple currency conversion utility
// In production, fetch rates from a real API and cache them

export type Currency = "THB" | "USD" | "EUR";


// Deprecated: use context convert instead
export function convertCurrency(amountTHB: number, to: Currency): number {
  return amountTHB;
}

export function formatCurrency(amount: number, currency: Currency): string {
  switch (currency) {
    case "USD":
      return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    case "EUR":
      return `€${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    case "THB":
      return `฿${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    default:
      return `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  }
}
