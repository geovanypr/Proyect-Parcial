import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Shield, Globe, Menu, X, LogOut, Heart } from 'lucide-react';
import { useState } from 'react';
import type { ViewMode } from '../types';
import CurrencySelector from './CurrencySelector';
import { useFavorites } from '../hooks/useFavorites';

interface NavbarProps {
  mode: ViewMode;
  onToggleMode: () => void;
  onAdminClick: () => void;
  isAdmin: boolean;
  onLogout: () => void;
  onGoToCatalog?: () => void;
}

export default function Navbar({ mode, onToggleMode, onAdminClick, isAdmin, onLogout, onGoToCatalog }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { favorites } = useFavorites();

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-emerald-100/50 shadow-lg shadow-emerald-50/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200"
            >
              <MapPin className="w-5 h-5 text-white" />
            </motion.div>
            <div className="leading-tight">
              <span className="font-bold text-emerald-800 text-sm tracking-wide">
                Excursiones y Rutas
              </span>
              <span className="block text-[10px] text-emerald-600 font-medium tracking-widest uppercase">
                Republica Dominicana
              </span>
            </div>
          </div>

          {/* Desktop controls */}
          <div className="hidden md:flex items-center gap-3">
            <CurrencySelector />

            {/* Favorites badge */}
            {mode === 'cliente' && favorites.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onGoToCatalog}
                title="Ver favoritos en el catálogo"
                className="relative px-3 py-1.5 rounded-xl border border-pink-200 bg-pink-50/50 text-sm text-pink-600 hover:bg-pink-50 transition-all cursor-pointer"
              >
                <Heart className="w-4 h-4 fill-pink-400" />
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md"
                >
                  {favorites.length}
                </motion.span>
              </motion.button>
            )}

            {/* Mode toggle */}
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={onToggleMode}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer shadow-md ${
                    mode === 'admin'
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-200'
                      : 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 hover:from-emerald-100 hover:to-emerald-200'
                  }`}
                >
                  {mode === 'admin' ? (
                    <>
                      <Globe className="w-4 h-4" /> Tienda
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" /> Admin
                    </>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onLogout}
                  className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                  title="Cerrar sesion admin"
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={onAdminClick}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 hover:from-emerald-100 hover:to-emerald-200 transition-all cursor-pointer shadow-sm border border-emerald-200"
              >
                <Shield className="w-4 h-4" /> Admin
              </motion.button>
            )}
          </div>

          {/* Mobile menu button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-emerald-50 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-emerald-100 bg-white/95 backdrop-blur-xl px-4 py-4 space-y-3"
          >
            <div className="flex justify-center mb-2">
              <CurrencySelector />
            </div>
            
            {mode === 'cliente' && favorites.length > 0 && (
              <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-pink-50 border border-pink-200">
                <Heart className="w-4 h-4 fill-pink-400 text-pink-600" />
                <span className="text-sm font-medium text-pink-700">
                  {favorites.length} favorito{favorites.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            
            {isAdmin ? (
              <>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onToggleMode();
                    setMobileOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200"
                >
                  {mode === 'admin' ? (
                    <><Globe className="w-4 h-4" /> Ir a Tienda</>
                  ) : (
                    <><Shield className="w-4 h-4" /> Ir a Admin</>
                  )}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onLogout();
                    setMobileOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border-2 border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Cerrar Sesion Admin
                </motion.button>
              </>
            ) : (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onAdminClick();
                  setMobileOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200"
              >
                <Shield className="w-4 h-4" /> Acceder como Admin
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
