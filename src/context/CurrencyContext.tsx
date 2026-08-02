import { useState, createContext, useCallback, type ReactNode } from 'react';

export type Moneda = 'RD' | 'USD' | 'EUR';

interface CurrencyContextType {
  moneda: Moneda;
  setMoneda: (m: Moneda) => void;
  formatPrice: (amountRD: number) => string;
  convertFromRD: (amountRD: number) => number;
}

const RATES: Record<Moneda, { symbol: string; rate: number; locale: string; decimals: number }> = {
  RD:  { symbol: 'RD$', rate: 1,     locale: 'es-DO', decimals: 0 },
  USD: { symbol: 'US$', rate: 0.017, locale: 'en-US', decimals: 2 },
  EUR: { symbol: 'EUR', rate: 0.016, locale: 'de-DE', decimals: 2 },
};

const CurrencyContext = createContext<CurrencyContextType>({
  moneda: 'RD',
  setMoneda: () => {},
  formatPrice: () => '',
  convertFromRD: () => 0,
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [moneda, setMoneda] = useState<Moneda>(() => {
    try {
      return (localStorage.getItem('rd_currency') as Moneda) || 'RD';
    } catch {
      return 'RD';
    }
  });

  const handleSetMoneda = useCallback((m: Moneda) => {
    setMoneda(m);
    try { localStorage.setItem('rd_currency', m); } catch { /* */ }
  }, []);

  const convertFromRD = useCallback((amountRD: number) => {
    const r = RATES[moneda];
    return amountRD * r.rate;
  }, [moneda]);

  const formatPrice = useCallback((amountRD: number) => {
    const r = RATES[moneda];
    const converted = amountRD * r.rate;
    return `${r.symbol} ${converted.toLocaleString(r.locale, {
      minimumFractionDigits: r.decimals,
      maximumFractionDigits: r.decimals,
    })}`;
  }, [moneda]);

  return (
    <CurrencyContext.Provider value={{ moneda, setMoneda: handleSetMoneda, formatPrice, convertFromRD }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export { CurrencyContext };
