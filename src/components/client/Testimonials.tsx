import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote, CheckCircle } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    country: 'Estados Unidos',
    excursion: 'Isla Saona',
    text: 'Increíble experiencia! El catamarán era de primera y la isla es un paraíso. El almuerzo buffet estaba delicioso y el guía muy profesional. Definitivamente volveremos.',
    avatar: 'SJ',
  },
  {
    name: 'Marco Bianchi',
    country: 'Italia',
    excursion: '27 Charcos',
    text: 'Aventura pura! Los charcos son espectaculares y los guías muy seguros. La mejor excursión que he hecho en el Caribe. El almuerzo dominicano fue una grata sorpresa.',
    avatar: 'MB',
  },
  {
    name: 'Ana María Rodríguez',
    country: 'España',
    excursion: 'Samaná',
    text: 'Ver las ballenas jorobadas fue mágico. El paseo a caballo hasta la cascada es imperdible. Playa Rincón es, sin duda, una de las playas más bonitas que he visitado.',
    avatar: 'AR',
  },
  {
    name: 'Jean-Pierre Dubois',
    country: 'Francia',
    excursion: 'Bahía de las Águilas',
    text: 'Un lugar paradisíaco casi virgen. El transporte 4x4 es toda una aventura y el almuerzo típico está riquísimo. El guía naturalista es muy conocedor.',
    avatar: 'JD',
  },
  {
    name: 'Yuki Tanaka',
    country: 'Japón',
    excursion: 'Hoyo Azul',
    text: 'El color azul del cenote es impresionante, parece de otra dimensión. El zipline sobre el agua fue emocionante. Recomiendo el buffet después de la aventura.',
    avatar: 'YT',
  },
  {
    name: 'María Fernanda',
    country: 'Colombia',
    excursion: 'Santo Domingo Colonial',
    text: 'Historia viva en cada esquina. La degustación de chocolate y ron fue una experiencia única. El guía hace la historia muy entretenida. ¡Imperdible!',
    avatar: 'MF',
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  // Responsive: show 1 on mobile, 2 on tablet, 3 on desktop
  // maxIndex = last valid start position (for 3-visible desktop)
  const total = testimonials.length;
  const maxIndex = Math.max(0, total - 3);

  const next = () => setCurrent((c) => Math.min(c + 1, maxIndex));
  const prev = () => setCurrent((c) => Math.max(c - 1, 0));

  return (
    <section className="py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-end justify-between mb-8"
      >
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-emerald-800">
            Lo que dicen nuestros viajeros
          </h2>
          <p className="text-gray-400 mt-1">
            Reseñas verificadas de viajeros internacionales
          </p>
        </div>
        <div className="hidden md:flex gap-2">
          <button
            onClick={prev}
            disabled={current === 0}
            className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-emerald-50 hover:border-emerald-200 disabled:opacity-30 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={next}
            disabled={current >= maxIndex}
            className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-emerald-50 hover:border-emerald-200 disabled:opacity-30 transition-all cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </motion.div>

      <div className="overflow-hidden">
        <motion.div
          className="flex gap-5"
          animate={{ x: `calc(-${current} * (100% / 3 + 5px / 3))` }}
          transition={{ type: 'spring', stiffness: 200, damping: 30 }}
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="min-w-[calc(33.333%-12px)] bg-white rounded-2xl p-6 shadow-lg shadow-gray-100/50 border border-gray-50 flex-shrink-0"
            >
              {/* Verified badge */}
              <div className="flex items-center gap-1.5 mb-3">
                <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-100" />
                <span className="text-xs font-semibold text-emerald-600">Viajero verificado</span>
              </div>

              <Quote className="w-6 h-6 text-emerald-200 mb-2" />

              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {t.text}
              </p>

              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{t.name}</p>
                  <p className="text-xs text-gray-400">
                    {t.country} · {t.excursion}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Mobile nav dots */}
      <div className="flex md:hidden justify-center gap-2 mt-6">
        <button
          onClick={prev}
          disabled={current === 0}
          className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center disabled:opacity-30 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <button
          onClick={next}
          disabled={current >= maxIndex}
          className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center disabled:opacity-30 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </section>
  );
}
