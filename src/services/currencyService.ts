
// A mock currency conversion service. In a real application, this would use an API.
const exchangeRates: { [key: string]: number } = {
  THB_USD: 0.027,
  THB_EUR: 0.025,
  USD_THB: 1 / 0.027,
  EUR_THB: 1 / 0.025,
};

export const currencyService = {
  convert: (amount: number, from: string, to: string): number => {
    if (from === to) {
      return amount;
    }
    const rate = exchangeRates[`${from}_${to}`];
    if (rate) {
      return amount * rate;
    }
    // Fallback if direct rate is not available (e.g., EUR to USD)
    const thbAmount = amount * (exchangeRates[`${from}_THB`] || 1);
    const targetAmount = thbAmount * (exchangeRates[`THB_${to}`] || 1);
    return targetAmount;
  },

  getCurrencySymbol: (currency: string): string => {
    switch (currency) {
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "THB":
      default:
        return "฿";
    }
  },
};
