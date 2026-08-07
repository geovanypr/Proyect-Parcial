import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, DollarSign, Euro } from 'lucide-react';
import { useCurrency } from '../hooks/useCurrency';
import { type Moneda } from '../context/CurrencyContext';

const options: { key: Moneda; label: string; flag: string; icon: any }[] = [
  { key: 'RD', label: 'RD$', flag: 'DO', icon: DollarSign },
  { key: 'USD', label: 'US$', flag: 'US', icon: DollarSign },
  { key: 'EUR', label: 'EUR', flag: 'EU', icon: Euro },
];

export default function CurrencySelector() {
  const { moneda, setMoneda } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = options.find((o) => o.key === moneda)!;
  const CurrentIcon = current.icon;

  return (
    <div ref={ref} className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white hover:from-emerald-100 hover:to-emerald-50 text-sm font-semibold text-emerald-700 transition-all cursor-pointer shadow-sm"
      >
        <CurrentIcon className="w-3.5 h-3.5" />
        {current.label}
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-3 h-3" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl shadow-emerald-900/10 border border-emerald-100 overflow-hidden z-50 min-w-[140px]"
          >
            {options.map((opt) => {
              const Icon = opt.icon;
              return (
                <motion.button
                  key={opt.key}
                  whileHover={{ x: 4 }}
                  onClick={() => {
                    setMoneda(opt.key);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors cursor-pointer ${
                    moneda === opt.key
                      ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700'
                      : 'text-gray-600 hover:bg-emerald-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-bold text-gray-400 w-6">{opt.flag}</span>
                  {opt.label}
                  {moneda === opt.key && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto w-2 h-2 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/50"
                    />
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
