import type { UnitGroup } from "../types";

export const unitGroups: UnitGroup[] = [
  {
    category: "length",
    label: "Longitud",
    units: [
      { id: "m", label: "Metro (m)" },
      { id: "km", label: "Kilómetro (km)" },
      { id: "cm", label: "Centímetro (cm)" },
      { id: "mi", label: "Milla (mi)" },
    ],
  },
  {
    category: "weight",
    label: "Peso",
    units: [
      { id: "kg", label: "Kilogramo (kg)" },
      { id: "g", label: "Gramo (g)" },
      { id: "lb", label: "Libra (lb)" },
    ],
  },
  {
    category: "temperature",
    label: "Temperatura",
    units: [
      { id: "c", label: "Celsius (°C)" },
      { id: "f", label: "Fahrenheit (°F)" },
      { id: "k", label: "Kelvin (K)" },
    ],
  },
];

export function convertLength(value: number, from: string, to: string): number {
  const toMeters: { [key: string]: number } = {
    m: 1,
    km: 1000,
    cm: 0.01,
    mi: 1609.344,
  };

  const meters = value * toMeters[from];
  return meters / toMeters[to];
}

export function convertWeight(value: number, from: string, to: string): number {
  const toKilograms: { [key: string]: number } = {
    kg: 1,
    g: 0.001,
    lb: 0.453592,
  };

  const kilograms = value * toKilograms[from];
  return kilograms / toKilograms[to];
}

export function convertTemperature(
  value: number,
  from: string,
  to: string
): number {
  let celsius: number;

  switch (from) {
    case "c":
      celsius = value;
      break;
    case "f":
      celsius = (value - 32) * (5 / 9);
      break;
    case "k":
      celsius = value - 273.15;
      break;
    default:
      celsius = value;
  }

  switch (to) {
    case "c":
      return celsius;
    case "f":
      return celsius * (9 / 5) + 32;
    case "k":
      return celsius + 273.15;
    default:
      return celsius;
  }
}

export function convertUnit(
  value: number,
  from: string,
  to: string,
  category: string
): number | null {
  if (from === to) return value;

  try {
    switch (category) {
      case "length":
        return convertLength(value, from, to);
      case "weight":
        return convertWeight(value, from, to);
      case "temperature":
        return convertTemperature(value, from, to);
      default:
        return null;
    }
  } catch {
    return null;
  }
}
