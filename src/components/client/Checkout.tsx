import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CreditCard,
  User,
  Mail,
  Phone,
  Hash,
  Users,
  Baby,
  StickyNote,
  Banknote,
  Building2,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import type { Excursion, ReservaData } from '../../types';
import { useCurrency } from '../../hooks/useCurrency';
import { useToast } from '../../hooks/useToast';
import { formatHora12 } from '../../utils/format';

interface CheckoutProps {
  excursion: Excursion;
  onSubmit: (data: ReservaData) => void;
  onBack: () => void;
}

export default function Checkout({ excursion, onSubmit, onBack }: CheckoutProps) {
  const { formatPrice } = useCurrency();
  const { error, warning } = useToast();
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    telefono: '',
    email: '',
    cantidad: '1',
    ninos: '0',
    metodoPago: 'tarjeta' as 'tarjeta' | 'efectivo' | 'transferencia',
    notas: '',
  });

  const cantidad = Math.max(1, Number(form.cantidad) || 1);
  const ninos = Math.max(0, Number(form.ninos) || 0);
  const montoAdultos = cantidad * excursion.precio;
  const montoNinos = ninos * excursion.precioNino;
  const total = montoAdultos + montoNinos;
  const totalPasajeros = cantidad + ninos;
  const spotsLeft = Math.max(0, excursion.capacidadTotal - excursion.capacidadUsada);
  const exceedsCapacity = totalPasajeros > spotsLeft;

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone: string) => {
    const re = /^\d{3}-\d{3}-\d{4}$|^\d{10}$/;
    return re.test(phone.replace(/[\s-]/g, ''));
  };

  const validateCedula = (cedula: string) => {
    const re = /^\d{3}-\d{7}-\d$|^\d{11}$/;
    return re.test(cedula.replace(/[\s-]/g, ''));
  };

  const isValid =
    form.nombre.trim().length >= 2 &&
    form.apellido.trim().length >= 2 &&
    validateCedula(form.cedula.trim()) &&
    validatePhone(form.telefono.trim()) &&
    validateEmail(form.email.trim()) &&
    cantidad >= 1 &&
    !exceedsCapacity;

  const update = (field: string, value: string) =>
    setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = () => {
    if (!isValid) {
      if (!validateEmail(form.email.trim())) {
        error('Por favor, ingresa un email válido');
        return;
      }
      if (!validatePhone(form.telefono.trim())) {
        error('Por favor, ingresa un teléfono válido (809-555-1234)');
        return;
      }
      if (!validateCedula(form.cedula.trim())) {
        error('Por favor, ingresa una cédula válida (001-1234567-8)');
        return;
      }
      if (exceedsCapacity) {
        warning(`Solo quedan ${spotsLeft} cupos disponibles`);
        return;
      }
      error('Por favor, completa todos los campos requeridos');
      return;
    }

    onSubmit({
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      cedula: form.cedula.trim(),
      telefono: form.telefono.trim(),
      email: form.email.trim(),
      cantidadPasajeros: cantidad,
      cantidadNinos: ninos,
      metodoPago: form.metodoPago,
      notas: form.notas.trim(),
    });
  };

  const inputClass =
    'w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm bg-white transition-all';

  const paymentMethods = [
    { key: 'tarjeta' as const, label: 'Tarjeta', icon: CreditCard, desc: 'Crédito/Débito' },
    { key: 'efectivo' as const, label: 'Efectivo', icon: Banknote, desc: 'Al reservar' },
    { key: 'transferencia' as const, label: 'Transferencia', icon: Building2, desc: 'Banco local' },
  ];

  const ctaLabel =
    form.metodoPago === 'tarjeta'
      ? `Confirmar y Pagar ${formatPrice(total)}`
      : `Confirmar Reserva — ${formatPrice(total)}`;

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Volver a detalles
      </button>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-50 p-6">
        <h2 className="text-2xl font-bold text-emerald-800 mb-1">
          Completar Reserva
        </h2>
        <p className="text-sm text-gray-400 mb-6">{excursion.nombre}</p>

        {/* Excursion summary */}
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-700">{excursion.destino}</p>
              <p className="text-xs text-emerald-500 mt-0.5">
                {excursion.duracion} · {excursion.horarios.map(formatHora12).join(' / ')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-emerald-500">Adulto / Niño</p>
              <p className="font-bold text-emerald-700">
                {formatPrice(excursion.precio)} / {formatPrice(excursion.precioNino)}
              </p>
            </div>
          </div>
        </div>

        {/* Capacity warning */}
        {exceedsCapacity && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-600">
              Solo quedan {spotsLeft} lugar{spotsLeft !== 1 ? 'es' : ''} disponible{spotsLeft !== 1 ? 's' : ''}.
              Has seleccionado {totalPasajeros} pasajeros.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {/* Personal info */}
          <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">
            Datos Personales
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nombre</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => update('nombre', e.target.value)}
                  className={inputClass}
                  placeholder="Juan"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Apellido</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type="text"
                  value={form.apellido}
                  onChange={(e) => update('apellido', e.target.value)}
                  className={inputClass}
                  placeholder="Pérez"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Cédula</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input
                type="text"
                value={form.cedula}
                onChange={(e) => update('cedula', e.target.value)}
                className={inputClass}
                placeholder="001-1234567-8"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Teléfono</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type="tel"
                  value={form.telefono}
                  onChange={(e) => update('telefono', e.target.value)}
                  className={inputClass}
                  placeholder="809-555-1234"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  className={inputClass}
                  placeholder="juan@email.com"
                />
              </div>
            </div>
          </div>

          {/* Reservation details */}
          <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider pt-2">
            Detalles de la Reserva
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Adultos</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type="number"
                  min={1}
                  max={Math.max(1, spotsLeft)}
                  value={form.cantidad}
                  onChange={(e) => update('cantidad', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Niños</label>
              <div className="relative">
                <Baby className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type="number"
                  min={0}
                  max={Math.max(0, spotsLeft - cantidad)}
                  value={form.ninos}
                  onChange={(e) => update('ninos', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Payment method */}
          <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider pt-2">
            Método de Pago
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {paymentMethods.map((pm) => (
              <button
                key={pm.key}
                onClick={() => update('metodoPago', pm.key)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                  form.metodoPago === pm.key
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 text-gray-500 hover:border-emerald-200'
                }`}
              >
                <pm.icon className="w-5 h-5" />
                <span className="text-xs font-bold">{pm.label}</span>
                <span className="text-[10px] text-gray-400">{pm.desc}</span>
              </button>
            ))}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Notas adicionales <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <div className="relative">
              <StickyNote className="absolute left-3 top-3 w-4 h-4 text-gray-300" />
              <textarea
                value={form.notas}
                onChange={(e) => update('notas', e.target.value)}
                rows={2}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm bg-white resize-none"
                placeholder="Restricciones alimentarias, accesibilidad, etc."
              />
            </div>
          </div>
        </div>

        {/* Price breakdown */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                {cantidad} adulto{cantidad > 1 ? 's' : ''} × {formatPrice(excursion.precio)}
              </span>
              <span className="text-gray-700 font-medium">{formatPrice(montoAdultos)}</span>
            </div>
            {ninos > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  {ninos} niño{ninos > 1 ? 's' : ''} × {formatPrice(excursion.precioNino)}
                </span>
                <span className="text-gray-700 font-medium">{formatPrice(montoNinos)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-100">
              <span className="text-emerald-800">Total</span>
              <span className="text-emerald-600">{formatPrice(total)}</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={!isValid}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Shield className="w-5 h-5" /> {ctaLabel}
          </motion.button>

          <p className="text-xs text-gray-400 text-center mt-3">
            Reserva segura. Cancelación gratuita hasta 24h antes.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
