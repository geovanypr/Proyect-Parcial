export type CategoriaExcursion =
  | 'aventura'
  | 'playa'
  | 'naturaleza'
  | 'cultural'
  | 'gastronomia'
  | 'crucero';

export const CATEGORIAS: { key: CategoriaExcursion; label: string }[] = [
  { key: 'aventura', label: 'Aventura' },
  { key: 'playa', label: 'Playa' },
  { key: 'naturaleza', label: 'Naturaleza' },
  { key: 'cultural', label: 'Cultural' },
  { key: 'gastronomia', label: 'Gastronomía' },
  { key: 'crucero', label: 'Crucero' },
];

export interface Excursion {
  id: string;
  nombre: string;
  destino: string;
  region: string;
  descripcion: string;
  descripcionCorta: string;
  precio: number;
  precioNino: number;
  duracion: string;
  capacidadTotal: number;
  capacidadUsada: number;
  categoria: CategoriaExcursion;
  imagen: string;
  imagenGaleria: string[];
  destacada: boolean;
  suspendida?: boolean;
  finalizada?: boolean;
  incluye: string[];
  noIncluye: string[];
  horarios: string[];
  fechaCreacion: string;
}

export interface Pasajero {
  id: string;
  excursionId: string;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  email: string;
  cantidadPasajeros: number;
  cantidadNinos: number;
  montoTotal: number;
  estadoPago: 'completado' | 'pendiente' | 'cancelado';
  metodoPago: 'tarjeta' | 'efectivo' | 'transferencia';
  fechaReserva: string;
  horaReserva: string;
  codigoReserva: string;
  notas: string;
}

export interface Estadisticas {
  ingresosTotales: number;
  pasajerosTotales: number;
  excursionesActivas: number;
  ingresosPorDestino: { destino: string; ingresos: number }[];
  reservasPorMes: { mes: string; reservas: number; ingresos: number }[];
  reservasPorCategoria: { categoria: string; reservas: number }[];
}

export type ViewMode = 'admin' | 'cliente';
export type AdminView = 'dashboard' | 'excursiones' | 'pasajeros';
export type ClienteView =
  | 'catalogo'
  | 'detalle'
  | 'checkout'
  | 'procesando'
  | 'ticket';

export interface ReservaData {
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  email: string;
  cantidadPasajeros: number;
  cantidadNinos: number;
  metodoPago: 'tarjeta' | 'efectivo' | 'transferencia';
  notas: string;
  fechaVisita?: string;
}
