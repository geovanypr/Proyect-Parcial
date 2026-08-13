import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  DollarSign,
  Banknote,
  CreditCard,
  Building2,
  Trash2,
  Eye,
  AlertTriangle,
  X,
} from 'lucide-react';
import type { Excursion, Pasajero } from '../../types';
import { formatRD } from '../../utils/format';
import Pagination from '../Pagination';

interface PassengersTableProps {
  pasajeros: Pasajero[];
  excursiones: Excursion[];
  onUpdatePasajero: (p: Pasajero) => void;
  onDeletePasajero: (id: string) => void;
}

type FilterStatus = 'todos' | 'completado' | 'pendiente' | 'cancelado';

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  completado: { label: 'Pagado', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: CheckCircle },
  pendiente: { label: 'Pendiente', color: 'text-amber-700', bg: 'bg-amber-100', icon: Clock },
  cancelado: { label: 'Cancelado', color: 'text-red-600', bg: 'bg-red-100', icon: XCircle },
};

const paymentIcons: Record<string, typeof CreditCard> = {
  tarjeta: CreditCard,
  efectivo: Banknote,
  transferencia: Building2,
};

const ITEMS_PER_PAGE = 8;

export default function PassengersTable({
  pasajeros,
  excursiones,
  onUpdatePasajero,
  onDeletePasajero,
}: PassengersTableProps) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('todos');
  const [currentPage, setCurrentPage] = useState(1);

  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [viewDetail, setViewDetail] = useState<Pasajero | null>(null);

  // Close status dropdown on outside click
  useEffect(() => {
    if (!editingStatus) return;
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element).closest('[data-status-dropdown]')) {
        setEditingStatus(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [editingStatus]);

  const stats = useMemo(() => {
    const completados = pasajeros.filter((p) => p.estadoPago === 'completado');
    const pendientes = pasajeros.filter((p) => p.estadoPago === 'pendiente');
    const cancelados = pasajeros.filter((p) => p.estadoPago === 'cancelado');
    const totalIngresos = completados.reduce((s, p) => s + p.montoTotal, 0);
    const totalPendiente = pendientes.reduce((s, p) => s + p.montoTotal, 0);
    const totalPasajeros = completados.reduce((s, p) => s + p.cantidadPasajeros + p.cantidadNinos, 0);
    return {
      completados: completados.length,
      pendientes: pendientes.length,
      cancelados: cancelados.length,
      totalIngresos,
      totalPendiente,
      totalPasajeros,
    };
  }, [pasajeros]);

  const filtered = useMemo(() => {
    return pasajeros.filter((p) => {
      const exc = excursiones.find((e) => e.id === p.excursionId);
      const matchesSearch =
        !search ||
        `${p.nombre} ${p.apellido} ${p.email} ${p.cedula} ${p.codigoReserva} ${exc?.nombre || ''}`
          .toLowerCase()
          .includes(search.toLowerCase());
      const matchesFilter = filterStatus === 'todos' || p.estadoPago === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [pasajeros, excursiones, search, filterStatus]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleFilterChange = (f: FilterStatus) => {
    setFilterStatus(f);
    setCurrentPage(1);
  };

  const handleStatusChange = (pasajero: Pasajero, newStatus: Pasajero['estadoPago']) => {
    onUpdatePasajero({ ...pasajero, estadoPago: newStatus });
    setEditingStatus(null);
  };

  const handleDelete = (id: string) => {
    // Close detail modal if the deleted passenger is currently being viewed
    if (viewDetail?.id === id) setViewDetail(null);
    onDeletePasajero(id);
    setDeleteConfirmId(null);
  };

  const filters: { key: FilterStatus; label: string; count: number }[] = [
    { key: 'todos', label: 'Todos', count: pasajeros.length },
    { key: 'completado', label: 'Pagados', count: stats.completados },
    { key: 'pendiente', label: 'Pendientes', count: stats.pendientes },
    { key: 'cancelado', label: 'Cancelados', count: stats.cancelados },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-emerald-800">Registro de Pasajeros</h2>
        <p className="text-sm text-gray-400 mt-0.5">{pasajeros.length} reservas en total</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-xs text-gray-400 font-medium">Ingresos</span>
          </div>
          <p className="text-lg font-bold text-emerald-700">{formatRD(stats.totalIngresos)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-xs text-gray-400 font-medium">Pendiente</span>
          </div>
          <p className="text-lg font-bold text-amber-600">{formatRD(stats.totalPendiente)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-xs text-gray-400 font-medium">Pasajeros</span>
          </div>
          <p className="text-lg font-bold text-emerald-700">{stats.totalPasajeros}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-4 h-4 text-red-500" />
            </div>
            <span className="text-xs text-gray-400 font-medium">Cancelados</span>
          </div>
          <p className="text-lg font-bold text-red-500">{stats.cancelados}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Buscar por nombre, email, cedula, codigo o excursion..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm bg-white"
          />
        </div>
        <div className="flex gap-1.5">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => handleFilterChange(f.key)}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterStatus === f.key
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {f.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${filterStatus === f.key ? 'bg-white/20' : 'bg-gray-100'}`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-50 overflow-hidden">
        {pasajeros.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-lg font-medium">Sin reservas aún</p>
            <p className="text-gray-300 text-sm mt-1">
              Las reservas aparecerán aquí cuando los clientes completen una compra
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <Search className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-lg font-medium">Sin resultados</p>
            <p className="text-gray-300 text-sm mt-1">
              No hay pasajeros que coincidan con tu búsqueda o filtro
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Pasajero</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Excursion</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Contacto</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">PAX</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Monto</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Pago</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden xl:table-cell">Codigo</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center text-gray-400">
                      No se encontraron pasajeros
                    </td>
                  </tr>
                ) : (
                  paginated.map((p, i) => {
                    const exc = excursiones.find((e) => e.id === p.excursionId);
                    const st = statusConfig[p.estadoPago];
                    const StatusIcon = st.icon;
                    const PayIcon = paymentIcons[p.metodoPago] || CreditCard;

                    return (
                      <motion.tr
                        key={p.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-gray-50 hover:bg-emerald-50/30 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-sm text-gray-800">{p.nombre} {p.apellido}</p>
                          <p className="text-xs text-gray-400">{p.cedula}</p>
                        </td>
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          <p className="text-sm text-gray-600 line-clamp-1">{exc?.nombre || 'N/A'}</p>
                          <p className="text-xs text-gray-400">{exc?.destino || ''}</p>
                        </td>
                        <td className="px-5 py-3.5 hidden lg:table-cell">
                          <p className="text-sm text-gray-600">{p.email}</p>
                          <p className="text-xs text-gray-400">{p.telefono}</p>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="inline-flex items-center justify-center min-w-[28px] h-7 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-sm">
                            {p.cantidadPasajeros}
                          </span>
                          {p.cantidadNinos > 0 && (
                            <span className="ml-1 inline-flex items-center justify-center px-1.5 h-5 rounded-full bg-amber-100 text-amber-700 font-bold text-[10px]">
                              {p.cantidadNinos} niños
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="font-bold text-sm text-emerald-700">{formatRD(p.montoTotal)}</span>
                        </td>
                        <td className="px-5 py-3.5 text-center relative">
                          <button
                            onClick={() => setEditingStatus(editingStatus === p.id ? null : p.id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer hover:ring-2 hover:ring-emerald-200 transition-all ${st.bg} ${st.color}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {st.label}
                          </button>
                          {/* Status dropdown */}
                          {editingStatus === p.id && (
                            <div data-status-dropdown className="absolute z-30 top-full mt-1 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden min-w-[140px]">
                              {(['completado', 'pendiente', 'cancelado'] as const).map((s) => {
                                const cfg = statusConfig[s];
                                const SIcon = cfg.icon;
                                return (
                                  <button
                                    key={s}
                                    onClick={() => handleStatusChange(p, s)}
                                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold hover:bg-gray-50 transition-colors cursor-pointer ${
                                      p.estadoPago === s ? 'bg-emerald-50' : ''
                                    }`}
                                  >
                                    <SIcon className={`w-3.5 h-3.5 ${cfg.color}`} />
                                    <span className={cfg.color}>{cfg.label}</span>
                                    {p.estadoPago === s && <span className="ml-auto text-emerald-500">actual</span>}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-center hidden lg:table-cell">
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                            <PayIcon className="w-3 h-3" />
                            <span className="capitalize">{p.metodoPago}</span>
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center hidden xl:table-cell">
                          <span className="font-mono text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">{p.codigoReserva}</span>
                        </td>
                        <td className="px-3 py-3.5">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setViewDetail(p)}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-400 hover:text-blue-600 transition-colors cursor-pointer"
                              title="Ver detalle"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(p.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-100 py-3">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full text-center"
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">Eliminar reserva</h3>
              <p className="text-sm text-gray-500 mb-4">
                Se eliminara el registro de esta reserva permanentemente.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors cursor-pointer"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View detail modal */}
      <AnimatePresence>
        {viewDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewDetail(null)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
            >
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-white font-bold">Detalle de Reserva</h3>
                  <p className="text-emerald-200 text-xs font-mono">{viewDetail.codigoReserva}</p>
                </div>
                <button onClick={() => setViewDetail(null)} className="text-white/70 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="px-6 py-5 space-y-4">
                {(() => {
                  const exc = excursiones.find((e) => e.id === viewDetail.excursionId);
                  const st = statusConfig[viewDetail.estadoPago];
                  const StIcon = st.icon;
                  return (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider">Nombre</p>
                          <p className="text-sm font-semibold text-gray-700">{viewDetail.nombre} {viewDetail.apellido}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider">Cedula</p>
                          <p className="text-sm font-semibold text-gray-700">{viewDetail.cedula}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider">Email</p>
                          <p className="text-sm font-semibold text-gray-700">{viewDetail.email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider">Telefono</p>
                          <p className="text-sm font-semibold text-gray-700">{viewDetail.telefono}</p>
                        </div>
                      </div>
                      <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider">Excursion</p>
                          <p className="text-sm font-semibold text-gray-700">{exc?.nombre || 'N/A'}</p>
                          <p className="text-xs text-gray-400">{exc?.destino || ''}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider">Fecha Reserva</p>
                          <p className="text-sm font-semibold text-gray-700">{viewDetail.fechaReserva} {viewDetail.horaReserva}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider">Pasajeros</p>
                          <p className="text-sm font-semibold text-gray-700">{viewDetail.cantidadPasajeros} total ({viewDetail.cantidadNinos} niños)</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider">Metodo de Pago</p>
                          <p className="text-sm font-semibold text-gray-700 capitalize">{viewDetail.metodoPago}</p>
                        </div>
                      </div>
                      <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${st.bg} ${st.color}`}>
                          <StIcon className="w-4 h-4" /> {st.label}
                        </span>
                        <span className="text-xl font-bold text-emerald-600">{formatRD(viewDetail.montoTotal)}</span>
                      </div>
                      {viewDetail.notas && (
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Notas</p>
                          <p className="text-sm text-gray-600">{viewDetail.notas}</p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
