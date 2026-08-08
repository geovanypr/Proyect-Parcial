import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, CheckCircle, MapPin, Phone, MessageSquare } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    const trimmed = email.trim();
    if (!trimmed) return;
    // Basic email format check
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(trimmed)) return;
    setSubmitted(true);
    setEmail('');
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section className="py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Newsletter */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-3xl p-8 text-white relative overflow-hidden"
        >
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute -left-5 -bottom-5 w-20 h-20 bg-white/10 rounded-full" />

          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Recibe ofertas exclusivas</h3>
            <p className="text-emerald-100/80 text-sm mb-6">
              Suscribete para recibir descuentos, nuevas excursiones y tips de viaje directamente en tu correo.
            </p>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 p-3 bg-white/20 rounded-xl"
              >
                <CheckCircle className="w-5 h-5 text-emerald-200" />
                <span className="text-sm font-medium">
                  Te has suscrito correctamente!
                </span>
              </motion.div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="tu@email.com"
                  className="flex-1 px-4 py-3 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 text-sm outline-none focus:border-white/50 focus:ring-2 focus:ring-white/10"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmit}
                  className="px-5 py-3 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-colors cursor-pointer"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Contact info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl p-8 shadow-lg border border-gray-50"
        >
          <h3 className="text-xl font-bold text-emerald-800 mb-6">
            Contactanos
          </h3>
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Direccion</p>
                <p className="text-sm text-gray-500">
                  Av. George Washington 123, Santo Domingo, R.D.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Telefono</p>
                <p className="text-sm text-gray-500">+1 (809) 555-0123</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Email</p>
                <p className="text-sm text-gray-500">info@excursionesrd.com</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">WhatsApp</p>
                <p className="text-sm text-gray-500">+1 (809) 555-4567</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
