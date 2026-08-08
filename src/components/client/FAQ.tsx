import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'Como puedo reservar una excursion?',
    answer:
      'Selecciona la excursion que deseas, completa el formulario con tus datos personales, elige tu metodo de pago y confirma. Recibiras un boleto digital con tu codigo de reserva al instante.',
  },
  {
    question: 'Cuales son los metodos de pago aceptados?',
    answer:
      'Aceptamos tarjetas de credito y debito (Visa, Mastercard), pagos en efectivo y transferencias bancarias. Todos los pagos son procesados de forma segura.',
  },
  {
    question: 'Puedo cancelar mi reserva?',
    answer:
      'Si, puedes cancelar gratis hasta 24 horas antes de la fecha de la excursion. Despues de ese plazo, se aplicara un cargo del 50% del monto total.',
  },
  {
    question: 'Que debo llevar a la excursion?',
    answer:
      'Recomendamos llevar protector solar, gorra o sombrero, lentes de sol, calzado comodo segun la actividad, traje de banio, efectivo para propinas y una camara para capturar los momentos.',
  },
  {
    question: 'Las excursiones incluyen transporte desde mi hotel?',
    answer:
      'Depende de la excursion. Algunas incluyen recogida en tu hotel, otras tienen un punto de encuentro fijo. Revisa los detalles de cada excursion para verificar la informacion especifica.',
  },
  {
    question: '¿Hay excursiones aptas para niños?',
    answer:
      'Si! Tenemos excursiones familiares con precios especiales para niños. Cada excursion indica su nivel de dificultad. Para actividades de aventura, verifique la edad minima requerida.',
  },
  {
    question: 'Que pasa si llueve el dia de la excursion?',
    answer:
      'En caso de lluvia intensa, ofrecemos reprogramacion sin costo adicional o reembolso completo. Para lluvia ligera, las excursiones generalmente continuan segun lo programado.',
  },
  {
    question: 'Como funciona el sistema de monedas?',
    answer:
      'Puedes cambiar entre pesos dominicanos (RD$), dolares estadounidenses (US$) y euros (EUR) usando el selector de moneda en la parte superior de la pagina. Los precios se actualizan automaticamente.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
          <HelpCircle className="w-6 h-6 text-emerald-600" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-emerald-800">
          Preguntas Frecuentes
        </h2>
        <p className="text-gray-400 mt-2 max-w-lg mx-auto">
          Encuentra respuestas a las preguntas mas comunes sobre nuestras excursiones
        </p>
      </motion.div>

      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((faq, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:bg-gray-50/50 transition-colors"
            >
              <span className="text-sm font-semibold text-gray-700 pr-4">
                {faq.question}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-300 ${
                  openIndex === i ? 'rotate-180 text-emerald-500' : ''
                }`}
              />
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-4">
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
