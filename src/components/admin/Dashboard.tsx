import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Users,
  Map,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  BarChart3,
  Mountain,
  Waves,
  TreePalm,
  Landmark,
  UtensilsCrossed,
  Ship,
  Star,
} from 'lucide-react';
import type { Excursion, Pasajero, CategoriaExcursion } from '../../types';
import { formatRD } from '../../utils/format';

interface DashboardProps {
  excursiones: Excursion[];
  pasajeros: Pasajero[];
}

const CHART_COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const categoryIcons: Record<CategoriaExcursion, typeof Star> = {
  aventura: Mountain,
  playa: Waves,
  naturaleza: TreePalm,
  cultural: Landmark,
  gastronomia: UtensilsCrossed,
  crucero: Ship,
};

const statusConfig: Record<string, { color: string; bg: string; icon: typeof CheckCircle }> = {
  completado: { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle },
  pendiente: { color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
  cancelado: { color: 'text-red-500', bg: 'bg-red-50', icon: XCircle },
};

export default function Dashboard({ excursiones, pasajeros }: DashboardProps) {
  const stats = useMemo(() => {
    const completados = pasajeros.filter((p) => p.estadoPago === 'completado');
    const pendientes = pasajeros.filter((p) => p.estadoPago === 'pendiente');
    const cancelados = pasajeros.filter((p) => p.estadoPago === 'cancelado');

    const ingresosTotales = completados.reduce((s, p) => s + p.montoTotal, 0);
    const pasajerosTotales = completados.reduce(
      (s, p) => s + p.cantidadPasajeros + p.cantidadNinos,
      0
    );

    // Income per destination
    const destinoMap: Record<string, number> = {};
    completados.forEach((p) => {
      const exc = excursiones.find((e) => e.id === p.excursionId);
      const destino = exc?.destino.split(',')[0] || 'Desconocido';
      destinoMap[destino] = (destinoMap[destino] || 0) + p.montoTotal;
    });
    const ingresosPorDestino = Object.entries(destinoMap)
      .map(([destino, ingresos]) => ({ destino, ingresos }))
      .sort((a, b) => b.ingresos - a.ingresos);

    // Category breakdown
    const catMap: Record<string, number> = {};
    completados.forEach((p) => {
      const exc = excursiones.find((e) => e.id === p.excursionId);
      const cat = exc?.categoria || 'Otro';
      catMap[cat] = (catMap[cat] || 0) + 1;
    });
    const reservasPorCategoria = Object.entries(catMap).map(([categoria, reservas]) => ({
      categoria,
      reservas,
    }));

    // Capacity utilization
    const totalCapacidad = excursiones.reduce((s, e) => s + e.capacidadTotal, 0);
    const totalUsada = excursiones.reduce((s, e) => s + e.capacidadUsada, 0);
    const excursionesAgotadas = excursiones.filter(
      (e) => e.capacidadUsada >= e.capacidadTotal
    ).length;
    const excursionesSuspendidas = excursiones.filter((e) => e.suspendida || e.finalizada).length;

    // Recent reservations
    const recientes = [...pasajeros]
      .sort((a, b) => b.fechaReserva.localeCompare(a.fechaReserva) || b.horaReserva.localeCompare(a.horaReserva))
      .slice(0, 5);

    return {
      ingresosTotales,
      pasajerosTotales,
      excursionesActivas: excursiones.length,
      ingresosPorDestino,
      reservasPorCategoria,
      pagados: completados.length,
      pendientes: pendientes.length,
      cancelados: cancelados.length,
      tasaConversion:
        pasajeros.length > 0
          ? Math.round((completados.length / pasajeros.length) * 100)
          : 0,
      totalCapacidad,
      totalUsada,
      excursionesAgotadas,
      excursionesSuspendidas,
      recientes,
    };
  }, [excursiones, pasajeros]);

  const cards = [
    {
      label: 'Ingresos Totales',
      value: formatRD(stats.ingresosTotales),
      sub: `${stats.pagados} reservas completadas`,
      icon: DollarSign,
      color: 'bg-emerald-500',
    },
    {
      label: 'Pasajeros Totales',
      value: stats.pasajerosTotales.toString(),
      sub: `de ${pasajeros.length} reservas`,
      icon: Users,
      color: 'bg-emerald-600',
    },
    {
      label: 'Excursiones',
      value: stats.excursionesActivas.toString(),
      sub: `${stats.excursionesAgotadas} agotada${stats.excursionesAgotadas !== 1 ? 's' : ''}`,
      icon: Map,
      color: 'bg-emerald-700',
    },
    {
      label: 'Tasa de Conversión',
      value: `${stats.tasaConversion}%`,
      sub: `${stats.pendientes} pendiente${stats.pendientes !== 1 ? 's' : ''}`,
      icon: TrendingUp,
      color: 'bg-emerald-800',
    },
    {
      label: 'Capacidad Utilizada',
      value: `${stats.totalCapacidad > 0 ? Math.round((stats.totalUsada / stats.totalCapacidad) * 100) : 0}%`,
      sub: `${stats.totalUsada}/${stats.totalCapacidad} cupos`,
      icon: BarChart3,
      color: 'bg-emerald-600',
    },
    {
      label: 'Suspendidas',
      value: stats.excursionesSuspendidas.toString(),
      sub: `${stats.excursionesAgotadas} agotada${stats.excursionesAgotadas !== 1 ? 's' : ''}`,
      icon: Calendar,
      color: 'bg-amber-500',
    },
  ];

  const pieData = [
    { name: 'Pagados', value: stats.pagados },
    { name: 'Pendientes', value: stats.pendientes },
    { name: 'Cancelados', value: stats.cancelados },
  ];

  // Dynamic monthly data from real reservations
  // Ingresos only from completados; reservas count ALL bookings (any status)
  const monthlyData = useMemo(() => {
    const map: Record<string, { reservas: number; ingresos: number }> = {};

    // Count ALL reservations per month (not just paid)
    pasajeros.forEach((p) => {
      const d = new Date(p.fechaReserva);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map[key]) map[key] = { reservas: 0, ingresos: 0 };
      map[key].reservas += 1;
      // Only add income for completed payments
      if (p.estadoPago === 'completado') {
        map[key].ingresos += p.montoTotal;
      }
    });

    const now = new Date();
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      result.push({
        mes: MONTH_NAMES[d.getMonth()],
        reservas: map[key]?.reservas || 0,
        ingresos: map[key]?.ingresos || 0,
      });
    }
    return result;
  }, [pasajeros]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-emerald-800">Panel de Control</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Resumen general de tu plataforma de turismo
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <Calendar className="w-4 h-4 text-emerald-500" />
          <span className="text-sm text-gray-500">
            {new Date().toLocaleDateString('es-DO', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-4 shadow-lg shadow-gray-100/50 border border-gray-50"
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`${card.color} w-9 h-9 rounded-xl flex items-center justify-center`}
              >
                <card.icon className="w-4.5 h-4.5 text-white" />
              </div>
            </div>
            <p className="text-xl font-bold text-emerald-800">{card.value}</p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">{card.label}</p>
            <p className="text-[10px] text-gray-300 mt-0.5">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area chart - monthly trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-50"
        >
          <h3 className="text-base font-bold text-emerald-800 mb-4">
            Tendencia Mensual
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="gradIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradReservas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="ingresos"
                stroke="#059669"
                strokeWidth={2}
                fill="url(#gradIngresos)"
                name="Ingresos (RD$)"
              />
              <Area
                type="monotone"
                dataKey="reservas"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#gradReservas)"
                name="Reservas"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-50"
        >
          <h3 className="text-base font-bold text-emerald-800 mb-4">
            Estado de Pagos
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-3 mt-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: CHART_COLORS[i] }}
                />
                <span className="text-gray-500">
                  {d.name} ({d.value})
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom row: Bar chart + Category + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart - income by destination */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-50"
        >
          <h3 className="text-base font-bold text-emerald-800 mb-4">
            Ingresos por Destino
          </h3>
          {stats.ingresosPorDestino.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.ingresosPorDestino} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  dataKey="destino"
                  type="category"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={false}
                  width={120}
                />
                <Tooltip
                  formatter={(value) => [formatRD(Number(value)), 'Ingresos']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar
                  dataKey="ingresos"
                  fill="#059669"
                  radius={[0, 8, 8, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-400">
              Sin datos de ingresos disponibles
            </div>
          )}
        </motion.div>

        {/* Category breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-50"
        >
          <h3 className="text-base font-bold text-emerald-800 mb-4">
            Por Categoria
          </h3>
          <div className="space-y-3">
            {stats.reservasPorCategoria.map((cat) => {
              const CatIcon = categoryIcons[cat.categoria as CategoriaExcursion] || Map;
              const maxReservas = Math.max(
                ...stats.reservasPorCategoria.map((c) => c.reservas)
              );
              return (
                <div key={cat.categoria}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="flex items-center gap-1.5 text-gray-600 capitalize">
                      <CatIcon className="w-3.5 h-3.5 text-emerald-500" />
                      {cat.categoria}
                    </span>
                    <span className="font-bold text-emerald-700">{cat.reservas}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full"
                      style={{
                        width: `${maxReservas > 0 ? (cat.reservas / maxReservas) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Recent reservations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-50 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-50">
          <h3 className="text-base font-bold text-emerald-800">
            Reservas Recientes
          </h3>
        </div>
        <div className="divide-y divide-gray-50">
          {stats.recientes.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-400">
              <p className="text-sm">Sin reservas aun</p>
            </div>
          )}
          {stats.recientes.map((p) => {
            const exc = excursiones.find((e) => e.id === p.excursionId);
            const st = statusConfig[p.estadoPago];
            const StIcon = st.icon;
            return (
              <div
                key={p.id}
                className="flex items-center justify-between px-6 py-3 hover:bg-emerald-50/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${st.bg}`}
                  >
                    <StIcon className={`w-4 h-4 ${st.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      {p.nombre} {p.apellido}
                    </p>
                    <p className="text-xs text-gray-400">
                      {exc?.nombre || 'N/A'} - {p.fechaReserva}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-700">
                    {formatRD(p.montoTotal)}
                  </p>
                  <p className="text-xs text-gray-400 font-mono">
                    {p.codigoReserva}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
