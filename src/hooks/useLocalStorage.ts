import { useState, useCallback } from 'react';
import type { Excursion, Pasajero } from '../types';
import { PLACEHOLDER_EXCURSIONES, PLACEHOLDER_PASAJEROS } from '../data/mockData';

const EXCURSIONES_KEY = 'rd_excursiones';
const PASAJEROS_KEY = 'rd_pasajeros';

/** Minimum field check — guards against old schema silently crashing the app */
function isValidExcursion(e: unknown): e is Excursion {
  if (!e || typeof e !== 'object') return false;
  const obj = e as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.nombre === 'string' &&
    typeof obj.precio === 'number' &&
    typeof obj.capacidadTotal === 'number' &&
    typeof obj.capacidadUsada === 'number' &&
    Array.isArray(obj.horarios)
  );
}

function isValidPasajero(p: unknown): p is Pasajero {
  if (!p || typeof p !== 'object') return false;
  const obj = p as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.excursionId === 'string' &&
    typeof obj.nombre === 'string' &&
    typeof obj.montoTotal === 'number' &&
    typeof obj.codigoReserva === 'string'
  );
}

function loadFromStorage<T>(
  key: string,
  fallback: T,
  validator?: (item: unknown) => boolean
): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;
    // If validator provided, filter out any corrupt items
    const valid = validator ? parsed.filter(validator) : parsed;
    return valid as T;
  } catch {
    // corrupted JSON — reset
  }
  return fallback;
}

function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('localStorage error:', err);
  }
}

export function useExcursiones() {
  const [excursiones, setExcursiones] = useState<Excursion[]>(() =>
    loadFromStorage<Excursion[]>(EXCURSIONES_KEY, PLACEHOLDER_EXCURSIONES, isValidExcursion)
  );

  const persist = useCallback((updater: (prev: Excursion[]) => Excursion[]) => {
    setExcursiones((prev) => {
      const next = updater(prev);
      saveToStorage(EXCURSIONES_KEY, next);
      return next;
    });
  }, []);

  const addExcursion = useCallback(
    (exc: Excursion) => persist((prev) => [...prev, exc]),
    [persist]
  );

  const updateExcursion = useCallback(
    (updated: Excursion) =>
      persist((prev) => prev.map((e) => (e.id === updated.id ? updated : e))),
    [persist]
  );

  const deleteExcursion = useCallback(
    (id: string) => persist((prev) => prev.filter((e) => e.id !== id)),
    [persist]
  );

  return { excursiones, addExcursion, updateExcursion, deleteExcursion };
}

export function usePasajeros() {
  const [pasajeros, setPasajeros] = useState<Pasajero[]>(() =>
    loadFromStorage<Pasajero[]>(PASAJEROS_KEY, PLACEHOLDER_PASAJEROS, isValidPasajero)
  );

  const persist = useCallback((updater: (prev: Pasajero[]) => Pasajero[]) => {
    setPasajeros((prev) => {
      const next = updater(prev);
      saveToStorage(PASAJEROS_KEY, next);
      return next;
    });
  }, []);

  const addPasajero = useCallback(
    (p: Pasajero) => persist((prev) => [...prev, p]),
    [persist]
  );

  const updatePasajero = useCallback(
    (updated: Pasajero) =>
      persist((prev) => prev.map((p) => (p.id === updated.id ? updated : p))),
    [persist]
  );

  const deletePasajero = useCallback(
    (id: string) => persist((prev) => prev.filter((p) => p.id !== id)),
    [persist]
  );

  return { pasajeros, addPasajero, updatePasajero, deletePasajero };
}
