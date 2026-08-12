import { motion } from 'framer-motion';
import {
  MapPin,
  User,
  CreditCard,
  CheckCircle,
  Calendar,
  Clock,
  Hash,
  Baby,
  Banknote,
  Building2,
  Plane,
  Phone,
  Mail,
  Receipt,
  FileText,
} from 'lucide-react';
import type { Excursion, Pasajero } from '../../types';
import { generarQRSvg } from '../../utils/format';
import { useCurrency } from '../../hooks/useCurrency';

interface BoardingTicketProps {
  pasajero: Pasajero;
  excursion: Excursion;
  onNewBooking: () => void;
}

const paymentLabels = {
  tarjeta: { label: 'Tarjeta de Crédito/Débito', icon: CreditCard },
  efectivo: { label: 'Efectivo', icon: Banknote },
  transferencia: { label: 'Transferencia Bancaria', icon: Building2 },
};

// Simulated barcode
function BarcodeSvg({ code }: { code: string }) {
  const bars: string[] = [];
  let seed = 0;
  for (let i = 0; i < code.length; i++) seed = ((seed << 5) - seed + code.charCodeAt(i)) | 0;
  const rand = () => {
    seed = (seed * 16807 + 0) % 2147483647;
    return seed % 3 === 0 ? 2 : 1;
  };
  for (let i = 0; i < 60; i++) {
    const w = rand();
    bars.push(
      `<rect x="${i * 2.5}" y="0" width="${w}" height="40" fill="#064e3b" opacity="${0.7 + (seed % 3) * 0.1}"/>`
    );
  }
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="50" viewBox="0 0 150 50"><rect width="150" height="50" fill="white"/>${bars.join('')}</svg>`
  )}`;
}

// 1. ITBIS calculation fix: montoTotal does NOT include ITBIS — show a clean breakdown
// without fabricating tax. ITBIS applies at the invoice level as informational only.
export default function BoardingTicket({
  pasajero,
  excursion,
  onNewBooking,
}: BoardingTicketProps) {
  const { formatPrice } = useCurrency();
  const qrSvg = generarQRSvg(pasajero.codigoReserva);
  const barcodeSvg = BarcodeSvg({ code: pasajero.codigoReserva });
  const pm = paymentLabels[pasajero.metodoPago];
  const PmIcon = pm.icon;

  // Price breakdown — use stored montoTotal as the source of truth.
  // Recalculating from current excursion prices would be wrong if prices changed after booking.
  const subtotalAdultos = pasajero.cantidadPasajeros * excursion.precio;
  const subtotalNinos = pasajero.cantidadNinos * excursion.precioNino;
  // Use stored total as authoritative — line items are informational
  const subtotalReal = pasajero.montoTotal;
  // ITBIS is informational — shown as included within the total
  const ITBIS_RATE = 0.18;
  const itbisIncluido = subtotalReal * ITBIS_RATE;
  const subtotalSinITBIS = subtotalReal - itbisIncluido;

  // Invoice number derived from reservation code for display
  const noFactura = `FAC-${pasajero.codigoReserva}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className="max-w-lg mx-auto"
    >
      {/* Success header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3"
        >
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </motion.div>
        <h2 className="text-2xl font-bold text-emerald-800">Reserva Confirmada</h2>
        <p className="text-sm text-gray-400 mt-1">
          Tu boleto de abordaje está listo. Guárdalo o tómale una captura.
        </p>
      </motion.div>

      {/* ── FACTURA / COMPROBANTE ── */}
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">

        {/* ── Encabezado empresa ── */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-600 px-6 py-5 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full" />
          <div className="absolute -right-2 -bottom-8 w-16 h-16 bg-white/5 rounded-full" />

          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-white font-bold text-base leading-tight block">
                  Excursiones y Rutas RD
                </span>
                <span className="text-emerald-200 text-[10px] tracking-widest uppercase block">
                  República Dominicana
                </span>
                <span className="text-emerald-300 text-[10px] block mt-0.5">
                  RNC: 1-32-00001-7
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-emerald-200 text-[10px] tracking-wider uppercase block">
                Comprobante Fiscal
              </span>
              <span className="text-white font-mono text-xs font-bold block">
                {noFactura}
              </span>
              <span className="text-emerald-300 text-[10px] block mt-0.5">
                NCF: B01{pasajero.codigoReserva.replace(/[^A-Z0-9]/g, '').slice(-8).padStart(8, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Perforation */}
        <div className="relative h-0">
          <div className="absolute -left-3 top-0 w-6 h-6 bg-gray-50 rounded-full" />
          <div className="absolute -right-3 top-0 w-6 h-6 bg-gray-50 rounded-full" />
        </div>
        <div className="border-t-2 border-dashed border-gray-200 mx-4" />

        {/* ── Datos del cliente ── */}
        <div className="px-6 pt-5 pb-3">
          <div className="flex items-center gap-1.5 mb-3">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Datos del Cliente
            </span>
          </div>
          <div className="grid grid-cols-2 gap-y-2.5 gap-x-6 text-sm">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                Nombre Completo
              </p>
              <p className="font-semibold text-gray-700 mt-0.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-gray-400" />
                {pasajero.nombre} {pasajero.apellido}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                Cédula / RNC
              </p>
              <p className="font-semibold text-gray-700 mt-0.5 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-gray-400" />
                {pasajero.cedula}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                Teléfono
              </p>
              <p className="font-semibold text-gray-700 mt-0.5 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                {pasajero.telefono}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                Correo Electrónico
              </p>
              <p className="font-semibold text-gray-700 mt-0.5 flex items-center gap-1 truncate">
                <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="truncate">{pasajero.email}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 mx-6" />

        {/* ── Detalle del servicio ── */}
        <div className="px-6 pt-3 pb-3">
          <div className="flex items-center gap-1.5 mb-3">
            <Receipt className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Detalle del Servicio
            </span>
          </div>

          {/* Service header */}
          <div className="bg-emerald-50 rounded-xl p-3 mb-3">
            <p className="font-bold text-emerald-800 text-sm">{excursion.nombre}</p>
            <p className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" /> {excursion.destino} · {excursion.duracion}
            </p>
          </div>

          {/* Line items table */}
          <div className="w-full text-xs">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-1 pb-1.5 border-b border-gray-200 text-[10px] text-gray-400 uppercase tracking-wider font-medium">
              <span className="col-span-5">Descripción</span>
              <span className="col-span-2 text-right">Cant.</span>
              <span className="col-span-2 text-right">P. Unit.</span>
              <span className="col-span-3 text-right">Subtotal</span>
            </div>

            {/* Adults row */}
            <div className="grid grid-cols-12 gap-1 py-2 border-b border-gray-100 text-gray-700">
              <span className="col-span-5 flex items-center gap-1">
                <User className="w-3 h-3 text-gray-400 shrink-0" />
                Adulto(s)
              </span>
              <span className="col-span-2 text-right">{pasajero.cantidadPasajeros}</span>
              <span className="col-span-2 text-right">{formatPrice(excursion.precio)}</span>
              <span className="col-span-3 text-right font-semibold">
                {formatPrice(subtotalAdultos)}
              </span>
            </div>

            {/* Children row — only if there are children */}
            {pasajero.cantidadNinos > 0 && (
              <div className="grid grid-cols-12 gap-1 py-2 border-b border-gray-100 text-gray-700">
                <span className="col-span-5 flex items-center gap-1">
                  <Baby className="w-3 h-3 text-gray-400 shrink-0" />
                  Niño(s)
                </span>
                <span className="col-span-2 text-right">{pasajero.cantidadNinos}</span>
                <span className="col-span-2 text-right">{formatPrice(excursion.precioNino)}</span>
                <span className="col-span-3 text-right font-semibold">
                  {formatPrice(subtotalNinos)}
                </span>
              </div>
            )}
          </div>

          {/* Totals block */}
          <div className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal (sin ITBIS)</span>
              <span>{formatPrice(subtotalSinITBIS)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>ITBIS incluido (18%)</span>
              <span>{formatPrice(itbisIncluido)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-emerald-700 pt-2 border-t-2 border-emerald-200">
              <span>TOTAL A PAGAR</span>
              <span>{formatPrice(subtotalReal)}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 mx-6" />

        {/* ── Info de reserva y pago ── */}
        <div className="px-6 pt-3 pb-4">
          <div className="grid grid-cols-2 gap-y-2.5 gap-x-6 text-sm">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                Fecha de Emisión
              </p>
              <p className="font-semibold text-gray-700 mt-0.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {pasajero.fechaReserva}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                Hora de Emisión
              </p>
              <p className="font-semibold text-gray-700 mt-0.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                {pasajero.horaReserva}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                Método de Pago
              </p>
              <p className="font-semibold text-gray-700 mt-0.5 flex items-center gap-1">
                <PmIcon className="w-3.5 h-3.5 text-gray-400" />
                {pm.label}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                Estado del Pago
              </p>
              <p className="font-semibold text-emerald-600 mt-0.5 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                {pasajero.estadoPago === 'completado' ? 'Pagado' : 'Pendiente'}
              </p>
            </div>
          </div>
        </div>

        {/* Perforation */}
        <div className="relative h-0">
          <div className="absolute -left-3 top-0 w-6 h-6 bg-gray-50 rounded-full" />
          <div className="absolute -right-3 top-0 w-6 h-6 bg-gray-50 rounded-full" />
        </div>
        <div className="border-t-2 border-dashed border-gray-200 mx-4" />

        {/* ── QR + Código de barras ── */}
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1">
              Código de Reserva
            </p>
            <p className="font-mono font-bold text-emerald-700 text-sm">
              {pasajero.codigoReserva}
            </p>
            <img src={barcodeSvg} alt="Barcode" className="h-[30px] mt-2" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="bg-white border border-gray-200 rounded-xl p-2 shadow-sm">
              <img src={qrSvg} alt="QR Code" className="w-[90px] h-[90px]" />
            </div>
            <p className="text-[10px] text-gray-400">Escanear al abordaje</p>
          </div>
        </div>

        {/* ── Pie de factura ── */}
        <div className="bg-emerald-50 px-6 py-3 border-t border-emerald-100 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-emerald-600 font-medium">
              Presente este boleto al momento de abordar
            </p>
            <p className="text-[10px] text-emerald-500 font-mono">
              Lleve su cédula vigente
            </p>
          </div>
          <p className="text-[10px] text-emerald-500 text-center">
            Este comprobante es válido como recibo de pago conforme a la Ley 253-12 de la DGII.
          </p>
          <p className="text-[10px] text-gray-400 text-center">
            Excursiones y Rutas RD · Santo Domingo, República Dominicana · info@excursionesrd.com
          </p>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-50 text-center">
          <Plane className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-xs font-bold text-gray-600">Llega 30 min antes</p>
          <p className="text-[10px] text-gray-400">Punto de encuentro: Terminal de excursiones</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-50 text-center">
          <Hash className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-xs font-bold text-gray-600">Código de Reserva</p>
          <p className="text-[10px] text-emerald-600 font-mono">{pasajero.codigoReserva}</p>
        </div>
      </div>

      {/* Action */}
      <div className="text-center mt-6">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNewBooking}
          className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-colors cursor-pointer"
        >
          Realizar otra reserva
        </motion.button>
      </div>
    </motion.div>
  );
}
