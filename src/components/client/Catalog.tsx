import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Clock,
  MapPin,
  Star,
  ArrowRight,
  Filter,
  SlidersHorizontal,
  Mountain,
  Waves,
  TreePalm,
  Landmark,
  UtensilsCrossed,
  Ship,
  AlertTriangle,
  CheckCircle,
  Users,
  Heart,
} from 'lucide-react';
import type { Excursion, CategoriaExcursion } from '../../types';
import { CATEGORIAS } from '../../types';
import { useCurrency } from '../../hooks/useCurrency';
import { useFavorites } from '../../hooks/useFavorites';
import Pagination from '../Pagination';

interface CatalogProps {
  excursiones: Excursion[];
  onSelect: (exc: Excursion) => void;
}

const ITEMS_PER_PAGE = 6;

const categoryIcons: Record<CategoriaExcursion, typeof Star> = {
  aventura: Mountain,
  playa: Waves,
  naturaleza: TreePalm,
  cultural: Landmark,
  gastronomia: UtensilsCrossed,
  crucero: Ship,
};

export default function Catalog({ excursiones, onSelect }: CatalogProps) {
  const { formatPrice } = useCurrency();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoriaExcursion | 'todos'>('todos');
  const [sortBy, setSortBy] = useState<'precio' | 'popular'>('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const isAgotada = (exc: Excursion) => exc.capacidadUsada >= exc.capacidadTotal;
  const isInactiva = (exc: Excursion) => isAgotada(exc) || (exc.suspendida ?? false) || (exc.finalizada ?? false);

  // Base filtered by search only — used for category counts so they don't go to 0
  const searchFiltered = useMemo(() => {
    if (!search) return excursiones;
    const q = search.toLowerCase();
    return excursiones.filter(
      (e) =>
        e.nombre.toLowerCase().includes(q) ||
        e.destino.toLowerCase().includes(q) ||
        e.region.toLowerCase().includes(q)
    );
  }, [excursiones, search]);

  const filtered = useMemo(() => {
    let result = searchFiltered.filter((e) => {
      return activeCategory === 'todos' || e.categoria === activeCategory;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === 'precio') return a.precio - b.precio;
      // popular = destacada first, then active before inactive
      if (a.destacada !== b.destacada) return a.destacada ? -1 : 1;
      return 0;
    });

    return result;
  }, [searchFiltered, activeCategory, sortBy]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCategoryChange = (cat: CategoriaExcursion | 'todos') => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleFavoriteClick = (e: React.MouseEvent, excursionId: string) => {
    e.stopPropagation();
    toggleFavorite(excursionId);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
          Descubre la República Dominicana
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Excursiones únicas en los destinos más hermosos del Caribe.
          Reserva tu aventura hoy.
        </p>
      </motion.div>

      {/* Search & Filters toggle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar destino, excursión o región..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 outline-none text-sm bg-white shadow-sm transition-all"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-sm font-medium transition-all cursor-pointer ${
            showFilters
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-200'
              : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
        </motion.button>
      </motion.div>

      {/* Filters panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-emerald-100 max-w-3xl mx-auto">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Ordenar por
              </p>
              <div className="flex gap-2">
                {[
                  { key: 'popular' as const, label: 'Populares primero' },
                  { key: 'precio' as const, label: 'Menor precio' },
                ].map((s) => (
                  <motion.button
                    key={s.key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSortBy(s.key)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      sortBy === s.key
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {s.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none max-w-4xl mx-auto">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleCategoryChange('todos')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeCategory === 'todos'
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200'
              : 'bg-white text-gray-500 border border-gray-200 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50'
          }`}
        >
          <Filter className="w-3.5 h-3.5" /> Todas
        </motion.button>
        {CATEGORIAS.map((cat) => {
          const Icon = categoryIcons[cat.key];
          const count = searchFiltered.filter((e) => e.categoria === cat.key).length;
          return (
            <motion.button
              key={cat.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCategoryChange(cat.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.key
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {cat.label}
              <motion.span
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                  activeCategory === cat.key
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {count}
              </motion.span>
            </motion.button>
          );
        })}
      </div>

      {/* Results count */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm text-gray-400 text-center"
      >
        {filtered.length} excursión{filtered.length !== 1 ? 'es' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
      </motion.p>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {paginated.map((exc, i) => {
            const agotada = isAgotada(exc);
            const suspendida = exc.suspendida ?? false;
            const finalizada = exc.finalizada ?? false;
            const inactiva = isInactiva(exc);
            const spotsLeft = exc.capacidadTotal - exc.capacidadUsada;
            const spotPercent = exc.capacidadTotal > 0 ? (spotsLeft / exc.capacidadTotal) * 100 : 0;
            const CatIcon = categoryIcons[exc.categoria];
            const favorite = isFavorite(exc.id);

            return (
              <motion.div
                key={exc.id}
                layout
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => onSelect(exc)}
                className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl border overflow-hidden group transition-all duration-300 cursor-pointer ${
                  inactiva
                    ? 'border-gray-200 opacity-75 hover:border-amber-200'
                    : 'border-gray-50 hover:border-emerald-200'
                }`}
              >
                {/* Image */}
                <div className="relative">
                  {exc.imagen ? (
                    <img
                      src={exc.imagen}
                      alt={exc.nombre}
                      className={`w-full h-52 object-cover ${
                        inactiva ? 'grayscale' : 'group-hover:scale-105'
                      } transition-transform duration-700`}
                    />
                  ) : (
                    <div className="w-full h-52 bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                      <CatIcon className="w-16 h-16 text-white/30" />
                    </div>
                  )}

                  {/* Favorite button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleFavoriteClick(e, exc.id)}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors z-10"
                  >
                    <Heart 
                      className={`w-4 h-4 transition-colors ${favorite ? 'fill-pink-500 text-pink-500' : 'text-gray-400'}`} 
                    />
                  </motion.button>

                  {/* Status badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {exc.destacada && !inactiva && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold rounded-lg shadow-md"
                      >
                        <Star className="w-3 h-3" /> Popular
                      </motion.span>
                    )}
                    {agotada && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-lg shadow-md"
                      >
                        <AlertTriangle className="w-3 h-3" /> Agotada
                      </motion.span>
                    )}
                    {suspendida && !agotada && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold rounded-lg shadow-md"
                      >
                        <AlertTriangle className="w-3 h-3" /> Suspendida
                      </motion.span>
                    )}
                    {finalizada && !agotada && !suspendida && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-xs font-bold rounded-lg shadow-md"
                      >
                        <CheckCircle className="w-3 h-3" /> Finalizada
                      </motion.span>
                    )}
                  </div>

                  {/* Category badge */}
                  <div className="absolute bottom-3 left-3">
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-emerald-700 text-xs font-semibold rounded-lg shadow-sm capitalize">
                      <CatIcon className="w-3 h-3" /> {exc.categoria}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className={`text-lg font-bold transition-colors ${
                    inactiva ? 'text-gray-500' : 'text-emerald-800 group-hover:text-emerald-600'
                  }`}>
                    {exc.nombre}
                  </h3>
                  <p className="text-sm text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" /> {exc.destino}
                  </p>

                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                    {exc.descripcionCorta}
                  </p>

                  {/* Meta row */}
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {exc.duracion}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {agotada ? 'Sin cupos' : `${spotsLeft} cupos`}
                    </span>
                  </div>

                  {/* Capacity bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">
                        {finalizada
                          ? 'Esta excursión ha finalizado'
                          : suspendida && !agotada
                          ? 'Temporalmente suspendida'
                          : agotada
                          ? 'Sin cupos disponibles'
                          : `${spotsLeft} cupo${spotsLeft !== 1 ? 's' : ''} libre${spotsLeft !== 1 ? 's' : ''}`}
                      </span>
                      <span className="text-gray-400">
                        {exc.capacidadUsada}/{exc.capacidadTotal}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${exc.capacidadTotal > 0 ? (exc.capacidadUsada / exc.capacidadTotal) * 100 : 0}%` }}
                        transition={{ duration: 0.5, delay: i * 0.05 }}
                        className={`h-full rounded-full ${
                          agotada
                            ? 'bg-gradient-to-r from-red-400 to-red-500'
                            : finalizada
                            ? 'bg-gradient-to-r from-gray-400 to-gray-500'
                            : suspendida
                            ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                            : spotPercent < 30
                            ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                            : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div>
                      <span className="text-xs text-gray-400">Desde</span>
                      <p className={`text-xl font-bold ${inactiva ? 'text-gray-400' : 'text-emerald-600'}`}>
                        {formatPrice(exc.precio)}
                      </p>
                      <span className="text-xs text-gray-400">por persona</span>
                    </div>
                    {agotada ? (
                      <span className="px-4 py-2 bg-red-50 text-red-400 text-sm font-semibold rounded-xl border border-red-200">
                        Agotada
                      </span>
                    ) : finalizada ? (
                      <span className="px-4 py-2 bg-gray-100 text-gray-500 text-sm font-semibold rounded-xl border border-gray-200">
                        Finalizada
                      </span>
                    ) : suspendida ? (
                      <span className="px-4 py-2 bg-amber-50 text-amber-500 text-sm font-semibold rounded-xl border border-amber-200">
                        Suspendida
                      </span>
                    ) : (
                      <motion.div 
                        whileHover={{ x: 2 }}
                        className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-200 transition-colors"
                      >
                        Ver detalles <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-emerald-300" />
          </div>
          <p className="text-gray-400 text-lg font-medium">No se encontraron excursiones</p>
          <p className="text-gray-300 text-sm mt-1">
            Intenta con otros términos o categoría
          </p>
        </motion.div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
