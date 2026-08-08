import { motion } from 'framer-motion';
import { Shield, Clock, CreditCard, Headphones, Star, Award } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Reserva 100% Segura',
    description: 'Pagos encriptados y proteccion total de tus datos personales.',
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    icon: Clock,
    title: 'Confirmacion Instantanea',
    description: 'Tu reserva se confirma al instante. Sin esperas, sin complicaciones.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: CreditCard,
    title: 'Multiples Metodos de Pago',
    description: 'Paga con tarjeta, efectivo o transferencia bancaria.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: Headphones,
    title: 'Soporte 24/7',
    description: 'Equipo de soporte disponible a cualquier hora para ayudarte.',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    icon: Star,
    title: 'Experiencias Verificadas',
    description: 'Todas nuestras excursiones son evaluadas por viajeros reales.',
    color: 'bg-pink-100 text-pink-600',
  },
  {
    icon: Award,
    title: 'Guias Certificados',
    description: 'Profesionales certificados que conocen cada rincon del pais.',
    color: 'bg-teal-100 text-teal-600',
  },
];

export default function TrustSection() {
  return (
    <section className="py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-emerald-800">
          Por que elegirnos
        </h2>
        <p className="text-gray-400 mt-2 max-w-lg mx-auto">
          Mas de 500 viajeros confian en nosotros para sus aventuras en Republica Dominicana
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-100/50 border border-gray-50 group"
          >
            <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <f.icon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-800 mb-1">{f.title}</h3>
            <p className="text-sm text-gray-500">{f.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
