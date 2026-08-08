import { motion } from 'framer-motion';
import { MapPin, Star, Users, Shield } from 'lucide-react';
import type { Excursion, Pasajero } from '../../types';

interface HeroProps {
  excursiones: Excursion[];
  pasajeros: Pasajero[];
  onExplore: () => void;
}

export default function Hero({ excursiones, pasajeros, onExplore }: HeroProps) {
  const completados = pasajeros.filter((p) => p.estadoPago === 'completado');
  const totalPasajeros = completados.reduce((s, p) => s + p.cantidadPasajeros + p.cantidadNinos, 0);
  const excursionesActivas = excursiones.filter(
    (e) => e.capacidadUsada < e.capacidadTotal && !e.suspendida && !e.finalizada
  ).length;

  const stats = [
    { icon: MapPin, value: excursiones.length, label: 'Destinos' },
    { icon: Users, value: totalPasajeros || '0', label: 'Viajeros' },
    { icon: Star, value: excursionesActivas, label: 'Disponibles' },
    { icon: Shield, value: '100%', label: 'Seguro' },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl mb-10">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-300 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 px-8 py-12 md:px-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-2xl"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-white/90 text-xs font-medium mb-4"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            Turismo premium en Republica Dominicana
          </motion.div>

          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
            Vive la Republica Dominicana como nunca antes
          </h1>

          <p className="text-emerald-100/80 text-base md:text-lg mb-8 max-w-xl">
            Excursiones exclusivas en los destinos mas hermosos del Caribe.
            Reserva instantanea, pagos seguros y experiencias inolvidables.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onExplore}
              className="px-8 py-3.5 bg-white text-emerald-700 font-bold rounded-xl shadow-lg hover:bg-emerald-50 transition-colors cursor-pointer text-sm"
            >
              Explorar Excursiones
            </motion.button>
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Shield className="w-4 h-4" />
              Reserva segura con cancelacion gratuita
            </div>
          </div>
        </motion.div>

        {/* Stats - all dynamic from real data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10"
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3"
            >
              <s.icon className="w-5 h-5 text-emerald-300" />
              <div>
                <p className="text-lg font-bold text-white">{s.value}</p>
                <p className="text-xs text-emerald-200/70">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
