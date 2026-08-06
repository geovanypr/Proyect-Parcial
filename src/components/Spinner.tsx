import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

export default function Spinner() {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Spinning shield */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
        className="w-20 h-20 rounded-full border-4 border-emerald-200 border-t-emerald-600 flex items-center justify-center"
      >
        <ShieldCheck className="w-8 h-8 text-emerald-600" />
      </motion.div>

      <div className="text-center">
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-lg font-semibold text-emerald-700"
        >
          Procesando tu reserva...
        </motion.p>
        <p className="text-sm text-gray-400 mt-1">
          Confirmando disponibilidad
        </p>
      </div>

      {/* Animated progress dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
            className="w-2.5 h-2.5 rounded-full bg-emerald-500"
          />
        ))}
      </div>
    </div>
  );
}
