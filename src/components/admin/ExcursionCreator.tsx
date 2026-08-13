import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ImagePlus,
  Trash2,
  Plus,
  Pencil,
  Eye,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Clock,
  Users,
  X,
  Baby,
  CalendarDays,
  Star,
} from 'lucide-react';
import type { Excursion, Pasajero, CategoriaExcursion } from '../../types';
import { CATEGORIAS } from '../../types';
import { compressImageToBase64 } from '../../utils/imageCompressor';
import { formatRD, formatHora12 } from '../../utils/format';
import Modal from '../Modal';
import Pagination from '../Pagination';

interface ExcursionCreatorProps {
  excursiones: Excursion[];
  pasajeros: Pasajero[];
  onAdd: (exc: Excursion) => void;
  onUpdate: (exc: Excursion) => void;
  onDelete: (id: string) => void;
}

interface FormData {
  nombre: string;
  destino: string;
  region: string;
  descripcion: string;
  descripcionCorta: string;
  precio: string;
  precioNino: string;
  fechaSalida: string;
  fechaRegreso: string;
  capacidadTotal: string;
  categoria: CategoriaExcursion;
  imagen: string;
  destacada: boolean;
  suspendida: boolean;
  finalizada: boolean;
  incluye: string[];
  noIncluye: string[];
  horarios: string[];
  horaSalida: string;
  horaRegreso: string;
}

const emptyForm: FormData = {
  nombre: '',
  destino: '',
  region: '',
  descripcion: '',
  descripcionCorta: '',
  precio: '',
  precioNino: '',
  fechaSalida: '',
  fechaRegreso: '',
  capacidadTotal: '',
  categoria: 'playa',
  imagen: '',
  destacada: false,
  suspendida: false,
  finalizada: false,
  incluye: [],
  noIncluye: [],
  horarios: [],
  horaSalida: '08:00',
  horaRegreso: '18:00',
};

const ITEMS_PER_PAGE = 4;

export default function ExcursionCreator({
  excursiones,
  pasajeros,
  onAdd,
  onUpdate,
  onDelete,
}: ExcursionCreatorProps) {
  const [form, setForm] = useState<FormData>(emptyForm);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewExcursion, setPreviewExcursion] = useState<Excursion | null>(null);
  const [newIncluye, setNewIncluye] = useState('');
  const [newNoIncluye, setNewNoIncluye] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const totalPages = Math.ceil(excursiones.length / ITEMS_PER_PAGE);
  const paginated = excursiones.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const base64 = await compressImageToBase64(file);
      setForm((prev) => ({ ...prev, imagen: base64 }));
    } catch (err) {
      console.error('Error compressing image:', err);
    }
    setIsUploading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const update = (field: string, value: unknown) =>
    setForm((p) => ({ ...p, [field]: value }));

  const addListItem = (field: 'incluye' | 'noIncluye' | 'horarios', value: string, setter: (v: string) => void) => {
    if (!value.trim()) return;
    setForm((p) => ({ ...p, [field]: [...p[field], value.trim()] }));
    setter('');
  };

  const removeListItem = (field: 'incluye' | 'noIncluye' | 'horarios', index: number) => {
    setForm((p) => ({
      ...p,
      [field]: p[field].filter((_: string, i: number) => i !== index),
    }));
  };

  const handleSubmit = () => {
    if (!form.nombre || !form.destino || !form.precio) return;

    const capacidadTotal = Number(form.capacidadTotal) || 20;
    // Al editar, preservar los cupos usados reales; al crear, siempre 0
    const capacidadUsada = editingId
      ? excursiones.find((e) => e.id === editingId)?.capacidadUsada ?? 0
      : 0;
    const horarios = [
      form.horaSalida || form.horarios[0] || '08:00',
      form.horaRegreso || form.horarios[1] || '18:00',
    ];
    const duracion = form.fechaSalida && form.fechaRegreso
      ? `${form.fechaSalida} / ${form.fechaRegreso}`
      : editingId
      ? excursiones.find((e) => e.id === editingId)?.duracion || '1 día'
      : '1 día';

    const excursion: Excursion = {
      id: editingId || `exc-${Date.now()}`,
      nombre: form.nombre,
      destino: form.destino,
      region: form.region,
      descripcion: form.descripcion,
      descripcionCorta: form.descripcionCorta,
      precio: Number(form.precio),
      precioNino: Number(form.precioNino) || Math.round(Number(form.precio) * 0.6),
      duracion,
      capacidadTotal,
      capacidadUsada,
      categoria: form.categoria,
      imagen: form.imagen,
      imagenGaleria: [],
      destacada: form.destacada,
      suspendida: form.suspendida,
      finalizada: form.finalizada,
      incluye: form.incluye,
      noIncluye: form.noIncluye,
      horarios,
      fechaCreacion: editingId
        ? excursiones.find((e) => e.id === editingId)?.fechaCreacion ||
          new Date().toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
    };

    if (editingId) {
      onUpdate(excursion);
    } else {
      onAdd(excursion);
      setCurrentPage(1); // reset to first page after adding
    }

    setForm(emptyForm);
    setEditingId(null);
    setShowModal(false);
  };

  const openEdit = (exc: Excursion) => {
    setEditingId(exc.id);
    setForm({
      nombre: exc.nombre,
      destino: exc.destino,
      region: exc.region,
      descripcion: exc.descripcion,
      descripcionCorta: exc.descripcionCorta,
      precio: exc.precio.toString(),
      precioNino: exc.precioNino.toString(),
      fechaSalida: exc.duracion.includes(' / ') ? exc.duracion.split(' / ')[0] : '',
      fechaRegreso: exc.duracion.includes(' / ') ? exc.duracion.split(' / ')[1] : '',
      capacidadTotal: exc.capacidadTotal.toString(),
      categoria: exc.categoria,
      imagen: exc.imagen,
      destacada: exc.destacada,
      suspendida: exc.suspendida ?? false,
      finalizada: exc.finalizada ?? false,
      incluye: exc.incluye,
      noIncluye: exc.noIncluye,
      horarios: exc.horarios,
      horaSalida: exc.horarios[0] || '08:00 AM',
      horaRegreso: exc.horarios[1] || '18:00 PM',
    });
    setShowModal(true);
  };

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const isAgotada = (exc: Excursion) => exc.capacidadUsada >= exc.capacidadTotal;

  const inputClass =
    'w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm transition-all';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-emerald-800">
            Gestionar Excursiones
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {excursiones.length} excursiones registradas
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={openNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Nueva Excursion
        </motion.button>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paginated.map((exc, i) => {
          const agotada = isAgotada(exc);
          const spotsLeft = exc.capacidadTotal - exc.capacidadUsada;
          return (
            <motion.div
              key={exc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-white rounded-2xl shadow-lg border overflow-hidden ${
                agotada ? 'border-red-200' : exc.finalizada ? 'border-gray-300' : exc.suspendida ? 'border-amber-200' : 'border-gray-50'
              }`}
            >
              {exc.imagen ? (
                <img
                  src={exc.imagen}
                  alt={exc.nombre}
                  className={`w-full h-40 object-cover ${agotada || exc.suspendida || exc.finalizada ? 'grayscale opacity-70' : ''}`}
                />
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                  <Star className="w-12 h-12 text-white/20" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <h3 className="font-bold text-emerald-800 text-sm">
                        {exc.nombre}
                      </h3>
                      {exc.destacada && (
                        <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-semibold rounded-full">
                          Destacada
                        </span>
                      )}
                      {agotada && (
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] font-semibold rounded-full">
                          Agotada
                        </span>
                      )}
                      {exc.suspendida && (
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-semibold rounded-full">
                          Suspendida
                        </span>
                      )}
                      {exc.finalizada && (
                        <span className="px-1.5 py-0.5 bg-gray-200 text-gray-600 text-[10px] font-semibold rounded-full">
                          Finalizada
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{exc.destino}</p>
                  </div>
                  <span className="text-xs text-gray-400 capitalize bg-gray-50 px-2 py-0.5 rounded-full">
                    {exc.categoria}
                  </span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                  {exc.descripcionCorta}
                </p>

                {/* Capacity bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Disponibilidad</span>
                    <span className={`font-semibold ${agotada ? 'text-red-500' : 'text-emerald-600'}`}>
                      {agotada ? 'Agotado' : `${spotsLeft} cupos`}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        agotada ? 'bg-red-400' : spotsLeft / exc.capacidadTotal < 0.3 ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${(exc.capacidadUsada / exc.capacidadTotal) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-emerald-600">
                      {formatRD(exc.precio)}
                    </span>
                    <span className="text-xs text-gray-400 ml-1">
                      | Niños: {formatRD(exc.precioNino)}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setPreviewExcursion(exc)}
                      className="p-2 rounded-lg hover:bg-blue-50 text-blue-400 hover:text-blue-600 transition-colors cursor-pointer"
                      title="Ver"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEdit(exc)}
                      className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-400 hover:text-emerald-600 transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(exc.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteConfirmId && (() => {
          const pasajerosAfectados = pasajeros.filter((p) => p.excursionId === deleteConfirmId);
          const excNombre = excursiones.find((e) => e.id === deleteConfirmId)?.nombre ?? '';
          return (
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
                <h3 className="font-bold text-gray-800 mb-1">Eliminar excursión</h3>
                <p className="text-sm text-gray-600 font-medium mb-1">{excNombre}</p>
                <p className="text-sm text-gray-500 mb-3">
                  Esta acción no se puede deshacer.
                </p>
                {pasajerosAfectados.length > 0 && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-left">
                    <Users className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-600">
                      Se eliminarán también{' '}
                      <span className="font-bold">
                        {pasajerosAfectados.length} pasajero{pasajerosAfectados.length !== 1 ? 's' : ''}
                      </span>{' '}
                      registrado{pasajerosAfectados.length !== 1 ? 's' : ''} en esta excursión.
                    </p>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      onDelete(deleteConfirmId);
                      setDeleteConfirmId(null);
                      const remaining = excursiones.length - 1;
                      const newTotalPages = Math.ceil(remaining / ITEMS_PER_PAGE);
                      if (currentPage > newTotalPages) setCurrentPage(Math.max(1, newTotalPages));
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors cursor-pointer"
                  >
                    Eliminar todo
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Preview modal */}
      <AnimatePresence>
        {previewExcursion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPreviewExcursion(null)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header image */}
              <div className="relative">
                {previewExcursion.imagen ? (
                  <img
                    src={previewExcursion.imagen}
                    alt={previewExcursion.nombre}
                    className="w-full h-52 object-cover rounded-t-2xl"
                  />
                ) : (
                  <div className="w-full h-52 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-t-2xl flex items-center justify-center">
                    <Star className="w-16 h-16 text-white/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-t-2xl" />
                <button
                  onClick={() => setPreviewExcursion(null)}
                  className="absolute top-3 right-3 bg-black/30 hover:bg-black/50 text-white rounded-full p-1.5 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                {previewExcursion.capacidadUsada >= previewExcursion.capacidadTotal && (
                  <span className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">
                    <AlertTriangle className="w-3 h-3" /> Agotada
                  </span>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-xl font-bold text-white">{previewExcursion.nombre}</h3>
                  <p className="text-white/80 text-sm flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" /> {previewExcursion.destino} — Región {previewExcursion.region}
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Quick stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-emerald-50 rounded-xl p-3 text-center">
                    <CalendarDays className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                    <p className="text-[10px] text-gray-400">Fecha / Duración</p>
                    <p className="text-xs font-bold text-emerald-800">{previewExcursion.duracion}</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-3 text-center">
                    <Clock className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                    <p className="text-[10px] text-gray-400">Horarios</p>
                    <p className="text-xs font-bold text-emerald-800">
                      {previewExcursion.horarios.map(formatHora12).join(' / ')}
                    </p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-3 text-center">
                    <Users className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                    <p className="text-[10px] text-gray-400">Capacidad</p>
                    <p className="text-xs font-bold text-emerald-800">
                      {previewExcursion.capacidadUsada}/{previewExcursion.capacidadTotal} cupos
                    </p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-3 text-center">
                    <CalendarDays className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                    <p className="text-[10px] text-gray-400">Disponibles</p>
                    <p className="text-xs font-bold text-emerald-800">
                      {Math.max(0, previewExcursion.capacidadTotal - previewExcursion.capacidadUsada)} cupos
                    </p>
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-emerald-800 mb-3">Precios</h4>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-500" />
                      <div>
                        <p className="text-[10px] text-gray-400">Adulto</p>
                        <p className="text-lg font-bold text-emerald-700">{formatRD(previewExcursion.precio)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Baby className="w-4 h-4 text-amber-500" />
                      <div>
                        <p className="text-[10px] text-gray-400">Niño</p>
                        <p className="text-lg font-bold text-amber-600">{formatRD(previewExcursion.precioNino)}</p>
                      </div>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Categoría</p>
                      <p className="text-sm font-bold text-emerald-700 capitalize">{previewExcursion.categoria}</p>
                    </div>
                  </div>
                </div>

                {/* Capacity bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500 font-medium">Disponibilidad de cupos</span>
                    <span className={`font-semibold ${previewExcursion.capacidadUsada >= previewExcursion.capacidadTotal ? 'text-red-500' : 'text-emerald-600'}`}>
                      {previewExcursion.capacidadTotal - previewExcursion.capacidadUsada} restantes
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        previewExcursion.capacidadUsada >= previewExcursion.capacidadTotal ? 'bg-red-400'
                        : (previewExcursion.capacidadTotal - previewExcursion.capacidadUsada) / previewExcursion.capacidadTotal < 0.3 ? 'bg-amber-400'
                        : 'bg-emerald-400'
                      }`}
                      style={{ width: `${(previewExcursion.capacidadUsada / previewExcursion.capacidadTotal) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Description */}
                {previewExcursion.descripcion && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-2">Descripción</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{previewExcursion.descripcion}</p>
                  </div>
                )}

                {/* Includes / Not includes */}
                {(previewExcursion.incluye.length > 0 || previewExcursion.noIncluye.length > 0) && (
                  <div className="grid grid-cols-2 gap-4">
                    {previewExcursion.incluye.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-emerald-700 mb-2 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Incluye
                        </h4>
                        <ul className="space-y-1">
                          {previewExcursion.incluye.map((item) => (
                            <li key={item} className="flex items-start gap-1.5 text-xs text-gray-600">
                              <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" /> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {previewExcursion.noIncluye.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-red-600 mb-2 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" /> No Incluye
                        </h4>
                        <ul className="space-y-1">
                          {previewExcursion.noIncluye.map((item) => (
                            <li key={item} className="flex items-start gap-1.5 text-xs text-gray-600">
                              <AlertTriangle className="w-3 h-3 text-red-300 mt-0.5 shrink-0" /> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => { setPreviewExcursion(null); openEdit(previewExcursion); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" /> Editar
                  </button>
                  <button
                    onClick={() => setPreviewExcursion(null)}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Form */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingId(null);
        }}
        title={editingId ? 'Editar Excursion' : 'Nueva Excursion'}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-5">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
              isDragActive ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300'
            }`}
          >
            <input {...getInputProps()} />
            {form.imagen ? (
              <div className="relative inline-block">
                <img src={form.imagen} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    update('imagen', '');
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ) : isUploading ? (
              <p className="text-emerald-600 text-sm">Comprimiendo imagen...</p>
            ) : (
              <div className="space-y-2">
                <ImagePlus className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-sm text-gray-400">Arrastra una imagen o haz click</p>
                <p className="text-xs text-gray-300">JPG, PNG o WebP (max 10MB)</p>
              </div>
            )}
          </div>

          {/* Basic info */}
          <div>
            <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3">
              Informacion Basica
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Nombre</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => update('nombre', e.target.value)}
                  className={inputClass}
                  placeholder="Isla Saona - Paraiso en el Caribe"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Destino</label>
                <input
                  type="text"
                  value={form.destino}
                  onChange={(e) => update('destino', e.target.value)}
                  className={inputClass}
                  placeholder="Isla Saona, Bayahibe"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Region</label>
                <select
                  value={form.region}
                  onChange={(e) => update('region', e.target.value)}
                  className={inputClass}
                >
                  <option value="">Seleccionar...</option>
                  <option value="Norte">Norte</option>
                  <option value="Sur">Sur</option>
                  <option value="Este">Este</option>
                  <option value="Oeste">Oeste</option>
                  <option value="Noreste">Noreste</option>
                  <option value="Noroeste">Noroeste</option>
                  <option value="Suroeste">Suroeste</option>
                  <option value="Sureste">Sureste</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Categoria</label>
                <select
                  value={form.categoria}
                  onChange={(e) => update('categoria', e.target.value)}
                  className={inputClass}
                >
                  {CATEGORIAS.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Descripcion Corta</label>
                <input
                  type="text"
                  value={form.descripcionCorta}
                  onChange={(e) => update('descripcionCorta', e.target.value)}
                  className={inputClass}
                  placeholder="Una linea atractiva que resuma la excursion"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Descripcion Completa</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => update('descripcion', e.target.value)}
                  rows={3}
                  className={`${inputClass} resize-none`}
                  placeholder="Descripcion detallada y atractiva..."
                />
              </div>
            </div>
          </div>

          {/* Pricing & Capacity */}
          <div>
            <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3">
              Precios y Capacidad
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Precio Adulto (RD$)</label>
                <input
                  type="number"
                  value={form.precio}
                  onChange={(e) => update('precio', e.target.value)}
                  className={inputClass}
                  placeholder="4500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Precio Niños (RD$)</label>
                <input
                  type="number"
                  value={form.precioNino}
                  onChange={(e) => update('precioNino', e.target.value)}
                  className={inputClass}
                  placeholder="2800"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Fecha de salida</label>
                <input
                  type="date"
                  value={form.fechaSalida}
                  onChange={(e) => update('fechaSalida', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Fecha de regreso</label>
                <input
                  type="date"
                  value={form.fechaRegreso}
                  onChange={(e) => update('fechaRegreso', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Cupos totales</label>
                <input
                  type="number"
                  value={form.capacidadTotal}
                  onChange={(e) => update('capacidadTotal', e.target.value)}
                  className={inputClass}
                  placeholder="40"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Cupos usados
                  <span className="ml-1 text-[10px] text-gray-300">(automático)</span>
                </label>
                <div className="flex h-[42px] items-center px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500 select-none">
                  {editingId
                    ? (excursiones.find((e) => e.id === editingId)?.capacidadUsada ?? 0)
                    : 0}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Cupos restantes</label>
                <div className="flex h-[42px] items-center px-3 rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-semibold text-emerald-700">
                  {Math.max(
                    0,
                    Number(form.capacidadTotal || 0) -
                      (editingId
                        ? (excursiones.find((e) => e.id === editingId)?.capacidadUsada ?? 0)
                        : 0)
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Travel times */}
          <div>
            <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3">
              Horario de salida y regreso
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Hora de salida</label>
                <input
                  type="time"
                  value={form.horaSalida}
                  onChange={(e) => update('horaSalida', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Hora de regreso</label>
                <input
                  type="time"
                  value={form.horaRegreso}
                  onChange={(e) => update('horaRegreso', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Includes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-bold text-emerald-700 mb-3 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Incluye
              </h4>
              <div className="flex gap-1.5 mb-2">
                <input
                  type="text"
                  value={newIncluye}
                  onChange={(e) => setNewIncluye(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addListItem('incluye', newIncluye, setNewIncluye)}
                  className={`${inputClass} flex-1 text-xs`}
                  placeholder="Agregar item..."
                />
                <button
                  onClick={() => addListItem('incluye', newIncluye, setNewIncluye)}
                  className="px-2 py-2 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {form.incluye.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-emerald-50 px-2 py-1 rounded-lg">
                    <span className="text-emerald-700">{item}</span>
                    <button onClick={() => removeListItem('incluye', i)} className="text-red-400 hover:text-red-600 cursor-pointer">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-600 mb-3 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> No Incluye
              </h4>
              <div className="flex gap-1.5 mb-2">
                <input
                  type="text"
                  value={newNoIncluye}
                  onChange={(e) => setNewNoIncluye(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addListItem('noIncluye', newNoIncluye, setNewNoIncluye)}
                  className={`${inputClass} flex-1 text-xs`}
                  placeholder="Agregar item..."
                />
                <button
                  onClick={() => addListItem('noIncluye', newNoIncluye, setNewNoIncluye)}
                  className="px-2 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {form.noIncluye.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-red-50 px-2 py-1 rounded-lg">
                    <span className="text-red-600">{item}</span>
                    <button onClick={() => removeListItem('noIncluye', i)} className="text-red-400 hover:text-red-600 cursor-pointer">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.destacada}
                onChange={(e) => update('destacada', e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span className="text-sm text-gray-600">Destacada</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.suspendida}
                onChange={(e) => update('suspendida', e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded accent-amber-500"
              />
              <span className="text-sm text-gray-600">
                Suspendida
                <span className="ml-1.5 text-[10px] text-amber-500 font-semibold uppercase tracking-wide">
                  (manual)
                </span>
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.finalizada}
                onChange={(e) => update('finalizada', e.target.checked)}
                className="w-4 h-4 rounded accent-gray-500"
              />
              <span className="text-sm text-gray-600">
                Finalizada
                <span className="ml-1.5 text-[10px] text-gray-500 font-semibold uppercase tracking-wide">
                  (manual)
                </span>
              </span>
            </label>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!form.nombre || !form.destino || !form.precio}
            className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {editingId ? 'Guardar Cambios' : 'Crear Excursion'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
