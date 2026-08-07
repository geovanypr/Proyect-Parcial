import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Eye, EyeOff, AlertTriangle, X } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (password: string) => boolean;
}

export default function AdminLoginModal({ isOpen, onClose, onLogin }: AdminLoginModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const handleSubmit = () => {
    const normalizedPassword = password.trim();
    const success = onLogin(normalizedPassword);

    if (success) {
      setPassword('');
      setError('');
      onClose();
    } else {
      setError('Contrasena incorrecta. Intenta de nuevo.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPassword('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={
              shake
                ? { scale: 1, opacity: 1, y: 0, x: [-10, 10, -10, 10, 0] }
                : { scale: 1, opacity: 1, y: 0, x: 0 }
            }
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-8 text-center relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full" />
              <div className="absolute -left-4 -bottom-6 w-16 h-16 bg-white/10 rounded-full" />
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 relative z-10">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white relative z-10">Acceso Administrador</h2>
              <p className="text-emerald-200 text-sm mt-1 relative z-10">
                Ingresa la contraseña para acceder
              </p>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    Contrasena
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                      className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm"
                      placeholder="Ingresa tu contrasena"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-xs text-red-600">{error}</p>
                  </motion.div>
                )}

                <button
                  onClick={handleSubmit}
                  className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  Iniciar Sesion
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center mt-4">
                Contacta al administrador si olvidaste tu contraseña.
              </p>
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
