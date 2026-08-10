import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Star,
  CheckCircle,
  XCircle,
  Shield,
  Calendar,
  AlertTriangle,
  Mountain,
  Waves,
  TreePalm,
  Landmark,
  UtensilsCrossed,
  Ship,
} from 'lucide-react';
import type { Excursion, CategoriaExcursion } from '../../types';
import { useCurrency } from '../../hooks/useCurrency';
import { formatHora12 } from '../../utils/format';

interface ExcursionDetailProps {
  excursion: Excursion;
  onReserve: () => void;
  onBack: () => void;
}

const categoryIcons: Record<CategoriaExcursion, typeof Star> = {
  aventura: Mountain,
  playa: Waves,
  naturaleza: TreePalm,
  cultural: Landmark,
  gastronomia: UtensilsCrossed,
  crucero: Ship,
};

export default function ExcursionDetail({ excursion, onReserve, onBack }: ExcursionDetailProps) {
  const { formatPrice } = useCurrency();
  const agotada = excursion.capacidadUsada >= excursion.capacidadTotal;
  const suspendida = excursion.suspendida ?? false;
  const finalizada = excursion.finalizada ?? false;
  const inactiva = agotada || suspendida || finalizada;
  const spotsLeft = excursion.capacidadTotal - excursion.capacidadUsada;
  const spotPercent = excursion.capacidadTotal > 0 ? (spotsLeft / excursion.capacidadTotal) * 100 : 0;
  const CatIcon = categoryIcons[excursion.categoria];

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al catálogo
      </button>

      {/* Hero image */}
      <div className="relative rounded-2xl overflow-hidden">
        {excursion.imagen ? (
          <img
            src={excursion.imagen}
            alt={excursion.nombre}
            className="w-full h-72 md:h-96 object-cover"
          />
        ) : (
          <div className="w-full h-72 md:h-96 bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
            <CatIcon className="w-24 h-24 text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="flex items-center gap-1 px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-lg capitalize">
              <CatIcon className="w-3 h-3" /> {excursion.categoria}
            </span>
            {agotada && !finalizada && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">
                <AlertTriangle className="w-3 h-3" /> Agotada
              </span>
            )}
            {suspendida && !agotada && !finalizada && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 text-white text-xs font-bold rounded-lg">
                <AlertTriangle className="w-3 h-3" /> Suspendida
              </span>
            )}
            {finalizada && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-gray-600 text-white text-xs font-bold rounded-lg">
                <CheckCircle className="w-3 h-3" /> Finalizada
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {excursion.nombre}
          </h1>
          <p className="text-white/80 flex items-center gap-1 mt-1">
            <MapPin className="w-4 h-4" /> {excursion.destino} — Región {excursion.region}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                icon: Calendar,
                label: 'Fecha / Duración',
                value: excursion.duracion,
              },
              {
                icon: Users,
                label: 'Disponibilidad',
                value: finalizada ? 'Finalizada' : agotada ? 'Agotada' : suspendida ? 'Suspendida' : `${spotsLeft} cupos`,
              },
              {
                icon: Clock,
                label: 'Horarios',
                value: `${formatHora12(excursion.horarios[0] ?? '')} → ${formatHora12(excursion.horarios[1] ?? '')}`,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl p-3 shadow-sm border border-gray-50 text-center"
              >
                <stat.icon className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                <p className="text-xs text-gray-400">{stat.label}</p>
                <p className="text-sm font-bold text-emerald-800 break-words">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          {excursion.descripcion && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
              <h2 className="text-lg font-bold text-emerald-800 mb-3">
                Sobre esta excursión
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {excursion.descripcion}
              </p>
            </div>
          )}

          {/* Includes & Excludes */}
          {(excursion.incluye.length > 0 || excursion.noIncluye.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {excursion.incluye.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
                  <h3 className="text-base font-bold text-emerald-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" /> Incluye
                  </h3>
                  <ul className="space-y-2">
                    {excursion.incluye.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {excursion.noIncluye.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
                  <h3 className="text-base font-bold text-red-600 mb-3 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-400" /> No incluye
                  </h3>
                  <ul className="space-y-2">
                    {excursion.noIncluye.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                        <XCircle className="w-4 h-4 text-red-300 mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-50 sticky top-24">
            {/* Precios */}
            <div className="mb-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Precios</p>
              <div className="flex items-end gap-4 mb-1">
                <div>
                  <p className="text-xs text-gray-400">Adulto</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {formatPrice(excursion.precio)}
                  </p>
                </div>
                <div className="pb-0.5">
                  <p className="text-xs text-gray-400">Niño</p>
                  <p className="text-xl font-bold text-amber-500">
                    {formatPrice(excursion.precioNino)}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-400">por persona</p>
            </div>

            {/* Capacity bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">
                  {agotada
                    ? 'Sin cupos disponibles'
                    : finalizada
                    ? 'Esta excursión ha finalizado'
                    : suspendida
                    ? 'Temporalmente suspendida'
                    : `${spotsLeft} lugar${spotsLeft !== 1 ? 'es' : ''} disponible${spotsLeft !== 1 ? 's' : ''}`}
                </span>
                <span className="text-gray-400">
                  {excursion.capacidadTotal > 0
                    ? Math.round((excursion.capacidadUsada / excursion.capacidadTotal) * 100)
                    : 0}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    agotada
                      ? 'bg-red-400'
                      : finalizada
                      ? 'bg-gray-400'
                      : suspendida
                      ? 'bg-amber-400'
                      : spotPercent < 30
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                  style={{
                    width: `${excursion.capacidadTotal > 0 ? (excursion.capacidadUsada / excursion.capacidadTotal) * 100 : 0}%`,
                  }}
                />
              </div>
              {spotPercent < 30 && !inactiva && (
                <p className="text-xs text-amber-600 mt-1 font-medium">
                  ¡Quedan pocos lugares!
                </p>
              )}
            </div>

            {/* Horarios */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 mb-2">Horarios</p>
              <div className="flex flex-col gap-2">
                {excursion.horarios[0] && (
                  <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 rounded-lg">
                    <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
                      🟢 Hora de Ida
                    </span>
                    <span className="text-sm font-bold text-emerald-700">
                      {formatHora12(excursion.horarios[0])}
                    </span>
                  </div>
                )}
                {excursion.horarios[1] && (
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      🔴 Hora de Regreso
                    </span>
                    <span className="text-sm font-bold text-gray-600">
                      {formatHora12(excursion.horarios[1])}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* CTA */}
            <motion.button
              whileHover={inactiva ? {} : { scale: 1.02 }}
              whileTap={inactiva ? {} : { scale: 0.98 }}
              onClick={inactiva ? undefined : onReserve}
              disabled={inactiva}
              className={`w-full py-3.5 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
                agotada
                  ? 'bg-red-50 text-red-400 cursor-not-allowed'
                  : finalizada
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : suspendida
                  ? 'bg-amber-50 text-amber-500 cursor-not-allowed'
                  : 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700 cursor-pointer'
              }`}
            >
              {agotada ? (
                <><AlertTriangle className="w-5 h-5" /> Agotada</>
              ) : finalizada ? (
                <><CheckCircle className="w-5 h-5" /> Excursión Finalizada</>
              ) : suspendida ? (
                <><AlertTriangle className="w-5 h-5" /> Temporalmente Suspendida</>
              ) : (
                <><Shield className="w-5 h-5" /> Reservar Ahora</>
              )}
            </motion.button>

            <p className="text-xs text-gray-400 text-center mt-3">
              Reserva segura con confirmación instantánea
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
