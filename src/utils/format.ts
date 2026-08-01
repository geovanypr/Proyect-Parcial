/**
 * Formats a number as Dominican Pesos (RD$).
 */
export function formatRD(n: number): string {
  return `RD$ ${n.toLocaleString('es-DO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/**
 * Converts a 24h "HH:mm" time string to 12h format with Spanish AM/PM.
 * Examples: "08:00" → "8:00 a.m."  |  "21:30" → "9:30 p.m."
 * If the value is already in a non-HH:mm format (legacy), returns it as-is.
 */
export function formatHora12(hora: string): string {
  if (!hora) return hora;
  const match = hora.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return hora; // already formatted or unknown — leave untouched
  let h = parseInt(match[1], 10);
  const m = match[2];
  const periodo = h < 12 ? 'a.\u00a0m.' : 'p.\u00a0m.';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${m} ${periodo}`;
}

/**
 * Generates a unique reservation code.
 */
export function generarCodigoReserva(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const year = new Date().getFullYear();
  let code = `RD-${year}-`;
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Generates a simple QR code pattern as SVG data (visual only).
 */
export function generarQRSvg(data: string, size = 120): string {
  const modules = 21; // QR version 1 size
  const cellSize = size / modules;
  // Deterministic pseudo-random based on data string
  let seed = 0;
  for (let i = 0; i < data.length; i++) {
    seed = ((seed << 5) - seed + data.charCodeAt(i)) | 0;
  }
  const rand = () => {
    seed = (seed * 16807 + 0) % 2147483647;
    return (seed & 1) === 1;
  };

  let rects = '';
  // Fixed finder patterns (top-left, top-right, bottom-left)
  const drawFinder = (ox: number, oy: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isEdge = r === 0 || r === 6 || c === 0 || c === 6;
        const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        if (isEdge || isInner) {
          rects += `<rect x="${(ox + c) * cellSize}" y="${(oy + r) * cellSize}" width="${cellSize}" height="${cellSize}" fill="#064e3b"/>`;
        }
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(modules - 7, 0);
  drawFinder(0, modules - 7);

  // Data area (pseudo-random fill)
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      const inFinder =
        (r < 8 && c < 8) ||
        (r < 8 && c >= modules - 8) ||
        (r >= modules - 8 && c < 8);
      if (!inFinder && rand()) {
        rects += `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize}" height="${cellSize}" fill="#064e3b"/>`;
      }
    }
  }

  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="white"/>${rects}</svg>`
  )}`;
}
