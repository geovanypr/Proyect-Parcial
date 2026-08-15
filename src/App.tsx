import { useState, useCallback, lazy, Suspense, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, Map, Users } from 'lucide-react';

import type {
  ViewMode,
  AdminView,
  ClienteView,
  Excursion,
  Pasajero,
  ReservaData,
} from './types';
import { CurrencyProvider } from './context/CurrencyContext';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { ToastProvider } from './context/ToastContext';
import { useAuth } from './hooks/useAuth';
import { useToast } from './hooks/useToast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useExcursiones, usePasajeros } from './hooks/useLocalStorage';
import { generarCodigoReserva } from './utils/format';

import Navbar from './components/Navbar';
import AdminLoginModal from './components/AdminLoginModal';
import Spinner from './components/Spinner';
import Hero from './components/client/Hero';
import Catalog from './components/client/Catalog';
import ExcursionDetail from './components/client/ExcursionDetail';
import Checkout from './components/client/Checkout';
import BoardingTicket from './components/client/BoardingTicket';
import TrustSection from './components/client/TrustSection';
import Testimonials from './components/client/Testimonials';
import FAQ from './components/client/FAQ';
import Newsletter from './components/client/Newsletter';

// Lazy load admin components for better performance
const Dashboard = lazy(() => import('./components/admin/Dashboard'));
const ExcursionCreator = lazy(() => import('./components/admin/ExcursionCreator'));
const PassengersTable = lazy(() => import('./components/admin/PassengersTable'));

function AppContent() {
  const [mode, setMode] = useState<ViewMode>('cliente');
  const [adminView, setAdminView] = useState<AdminView>('dashboard');
  const [clienteView, setClienteView] = useState<ClienteView>('catalogo');
  const [selectedExcursion, setSelectedExcursion] = useState<Excursion | null>(null);
  const [lastPasajero, setLastPasajero] = useState<Pasajero | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { isAdmin, login, logout } = useAuth();
  const { success: toastSuccess } = useToast();
  const { excursiones, addExcursion, updateExcursion, deleteExcursion } = useExcursiones();
  const { pasajeros, addPasajero, updatePasajero, deletePasajero } = usePasajeros();

  const toggleMode = useCallback(() => {
    setMode((m) => (m === 'admin' ? 'cliente' : 'admin'));
    setClienteView('catalogo');
    setAdminView('dashboard');
  }, []);

  const handleAdminClick = useCallback(() => {
    if (isAdmin) {
      setMode('admin');
      setAdminView('dashboard');
    } else {
      setShowLoginModal(true);
    }
  }, [isAdmin]);

  const handleLogin = useCallback((password: string) => {
    const success = login(password);
    if (success) {
      setMode('admin');
      setAdminView('dashboard');
    }
    return success;
  }, [login]);

  const handleLogout = useCallback(() => {
    logout();
    setMode('cliente');
    setClienteView('catalogo');
  }, [logout]);

  const handleDeletePasajero = useCallback((id: string) => {
    const pasajero = pasajeros.find((p) => p.id === id);
    if (pasajero) {
      // Devolver los cupos a la excursión
      const excursion = excursiones.find((e) => e.id === pasajero.excursionId);
      if (excursion) {
        const cuposADevolver = pasajero.cantidadPasajeros + pasajero.cantidadNinos;
        updateExcursion({
          ...excursion,
          capacidadUsada: Math.max(0, excursion.capacidadUsada - cuposADevolver),
        });
      }
    }
    deletePasajero(id);
  }, [pasajeros, excursiones, deletePasajero, updateExcursion]);

  const handleDeleteExcursion = useCallback((id: string) => {
    // Eliminar todos los pasajeros asociados a esta excursión
    pasajeros
      .filter((p) => p.excursionId === id)
      .forEach((p) => deletePasajero(p.id));
    // Eliminar la excursión
    deleteExcursion(id);
  }, [pasajeros, deletePasajero, deleteExcursion]);

  const handleSelectExcursion = useCallback((exc: Excursion) => {
    setSelectedExcursion(exc);
    setClienteView('detalle');
  }, []);

  const handleReserveFromDetail = useCallback(() => {
    setClienteView('checkout');
  }, []);

  const handleCheckoutSubmit = useCallback(
    (data: ReservaData) => {
      if (!selectedExcursion) return;
      // Snapshot the excursion ID and prices — safe values that don't change
      const excursionId = selectedExcursion.id;
      const precioAdulto = selectedExcursion.precio;
      const precioNino = selectedExcursion.precioNino;

      setClienteView('procesando');

      setTimeout(() => {
        const totalPasajeros = data.cantidadPasajeros + data.cantidadNinos;
        const montoTotal = precioAdulto * data.cantidadPasajeros + precioNino * data.cantidadNinos;

        const pasajero: Pasajero = {
          id: `pas-${Date.now()}`,
          excursionId,
          nombre: data.nombre,
          apellido: data.apellido,
          cedula: data.cedula,
          telefono: data.telefono,
          email: data.email,
          cantidadPasajeros: data.cantidadPasajeros,
          cantidadNinos: data.cantidadNinos,
          montoTotal,
          estadoPago: 'completado',
          metodoPago: data.metodoPago,
          fechaReserva: new Date().toISOString().split('T')[0],
          horaReserva: new Date().toLocaleTimeString('es-DO', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          codigoReserva: generarCodigoReserva(),
          notas: data.notas,
        };

        addPasajero(pasajero);

        // Read the CURRENT excursion from state to avoid stale capacidadUsada
        setSelectedExcursion((current) => {
          if (!current || current.id !== excursionId) return current;
          const updated = {
            ...current,
            capacidadUsada: current.capacidadUsada + totalPasajeros,
          };
          updateExcursion(updated);
          return updated;
        });

        setLastPasajero(pasajero);
        setClienteView('ticket');
        toastSuccess('¡Reserva confirmada correctamente!');
      }, 2500);
    },
    [selectedExcursion, addPasajero, updateExcursion, toastSuccess]
  );

  const handleNewBooking = useCallback(() => {
    setSelectedExcursion(null);
    setLastPasajero(null);
    setClienteView('catalogo');
  }, []);

  const handleScrollToCatalog = useCallback(() => {
    setClienteView('catalogo');
    setSelectedExcursion(null);
  }, []);

  // Scroll al top cada vez que cambia la vista o el modo
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [clienteView, adminView, mode]);

  const adminTabs: { key: AdminView; label: string; icon: typeof BarChart3 }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { key: 'excursiones', label: 'Excursiones', icon: Map },
    { key: 'pasajeros', label: 'Pasajeros', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        mode={mode}
        onToggleMode={toggleMode}
        onAdminClick={handleAdminClick}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        onGoToCatalog={handleScrollToCatalog}
      />

      <AdminLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {/* ADMIN MODE */}
          {mode === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex items-center gap-1 mb-6 bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-fit">
                {adminTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setAdminView(tab.key)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                      adminView === tab.key
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {adminView === 'dashboard' && (
                <Suspense fallback={<Spinner />}>
                  <Dashboard excursiones={excursiones} pasajeros={pasajeros} />
                </Suspense>
              )}
              {adminView === 'excursiones' && (
                <Suspense fallback={<Spinner />}>
                  <ExcursionCreator
                    excursiones={excursiones}
                    pasajeros={pasajeros}
                    onAdd={addExcursion}
                    onUpdate={updateExcursion}
                    onDelete={handleDeleteExcursion}
                  />
                </Suspense>
              )}
              {adminView === 'pasajeros' && (
                <Suspense fallback={<Spinner />}>
                  <PassengersTable
                    pasajeros={pasajeros}
                    excursiones={excursiones}
                    onUpdatePasajero={updatePasajero}
                    onDeletePasajero={handleDeletePasajero}
                  />
                </Suspense>
              )}
            </motion.div>
          )}

          {/* CLIENT MODE */}
          {mode === 'cliente' && (
            <motion.div
              key="cliente"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AnimatePresence mode="wait">
                {clienteView === 'catalogo' && (
                  <motion.div key="catalogo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Hero excursiones={excursiones} pasajeros={pasajeros} onExplore={handleScrollToCatalog} />
                    <Catalog excursiones={excursiones} onSelect={handleSelectExcursion} />
                    <TrustSection />
                    <Testimonials />
                    <FAQ />
                    <Newsletter />
                  </motion.div>
                )}

                {clienteView === 'detalle' && selectedExcursion && (
                  <motion.div key="detalle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ExcursionDetail
                      excursion={selectedExcursion}
                      onReserve={handleReserveFromDetail}
                      onBack={handleNewBooking}
                    />
                  </motion.div>
                )}

                {clienteView === 'checkout' && selectedExcursion && (
                  <motion.div key="checkout" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Checkout
                      excursion={selectedExcursion}
                      onSubmit={handleCheckoutSubmit}
                      onBack={() => setClienteView('detalle')}
                    />
                  </motion.div>
                )}

                {clienteView === 'procesando' && (
                  <motion.div
                    key="procesando"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center py-32"
                  >
                    <Spinner />
                  </motion.div>
                )}

                {clienteView === 'ticket' && lastPasajero && selectedExcursion && (
                  <motion.div key="ticket" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <BoardingTicket pasajero={lastPasajero} excursion={selectedExcursion} onNewBooking={handleNewBooking} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center">
                  <Map className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-emerald-800 text-sm">Excursiones y Rutas R.D</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                La plataforma #1 de turismo interno en Republica Dominicana. Excursiones premium, pagos seguros y experiencias inolvidables.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-700 text-sm mb-3">Destinos Populares</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li>Isla Saona</li>
                <li>Bahia de las Aguilas</li>
                <li>27 Charcos de Damajagua</li>
                <li>Samana</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-700 text-sm mb-3">Soporte</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li>Centro de Ayuda</li>
                <li>Politica de Cancelacion</li>
                <li>Terminos y Condiciones</li>
                <li>Privacidad</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-700 text-sm mb-3">Contacto</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li>+1 (809) 555-0123</li>
                <li>info@excursionesrd.com</li>
                <li>Santo Domingo, R.D.</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-300">
              © {new Date().getFullYear()} Excursiones y Rutas R.D. Todos los derechos reservados. | Peso Dominicano (RD$)
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <CurrencyProvider>
        <AuthProvider>
          <FavoritesProvider>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </FavoritesProvider>
        </AuthProvider>
      </CurrencyProvider>
    </ErrorBoundary>
  );
}
