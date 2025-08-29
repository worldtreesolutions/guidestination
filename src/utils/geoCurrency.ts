// Utility to detect user country and suggest currency
// Uses ipapi.co for geolocation (free, no API key needed for basic usage)

export async function detectUserCurrency(): Promise<string> {
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) throw new Error("Failed to fetch location");
    const data = await res.json();
    // Map country to currency (simple mapping, can be extended)
    if (data.currency) return data.currency;
    // fallback
    return "USD";
  } catch (e) {
    return "USD";
  }
}
