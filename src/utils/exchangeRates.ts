// Utility to fetch and cache real-time exchange rates
// Uses exchangerate.host (free, no API key required)

export type ExchangeRates = Record<string, number>;

// Uses Frankfurter API (https://www.frankfurter.app/) - no API key required
export async function fetchExchangeRates(base: string = "THB"): Promise<ExchangeRates> {
  const res = await fetch(`https://api.frankfurter.app/latest?from=${base}`);
  if (!res.ok) throw new Error("Failed to fetch exchange rates");
  const data = await res.json();
  return data.rates;
}
