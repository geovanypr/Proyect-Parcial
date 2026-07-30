export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface ExchangeRates {
  [fromCurrency: string]: {
    [toCurrency: string]: number;
  };
}

export type UnitCategory = "length" | "weight" | "temperature";

export interface Unit {
  id: string;
  label: string;
}

export interface UnitGroup {
  category: UnitCategory;
  label: string;
  units: Unit[];
}

export interface ConversionResult {
  value: number | null;
  formatted: string;
}
