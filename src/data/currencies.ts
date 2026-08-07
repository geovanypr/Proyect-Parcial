import type { Currency, ExchangeRates } from "../types";

export const currencies: Currency[] = [
  { code: "USD", name: "Dólar estadounidense", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "DOP", name: "Peso dominicano", symbol: "RD$" },
  { code: "GBP", name: "Libra esterlina", symbol: "£" },
  { code: "JPY", name: "Yen japonés", symbol: "¥" },
];

export const exchangeRates: ExchangeRates = {
  USD: { USD: 1, EUR: 0.92, DOP: 59.5, GBP: 0.79, JPY: 155.0 },
  EUR: { USD: 1.087, EUR: 1, DOP: 64.7, GBP: 0.859, JPY: 168.5 },
  DOP: { USD: 0.0168, EUR: 0.01546, DOP: 1, GBP: 0.01328, JPY: 2.605 },
  GBP: { USD: 1.266, EUR: 1.164, DOP: 75.3, GBP: 1, JPY: 196.2 },
  JPY: { USD: 0.00645, EUR: 0.00594, DOP: 0.384, GBP: 0.0051, JPY: 1 },
};

export function convertCurrency(
  amount: number,
  from: string,
  to: string
): number | null {
  if (!exchangeRates[from] || exchangeRates[from][to] === undefined) {
    return null;
  }
  return amount * exchangeRates[from][to];
}
