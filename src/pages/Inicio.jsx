import React from 'react';
import {
  Calendar,
  Users,
  TrendingUp,
  Clock,
  Coffee,
  Star,
  Plus,
  ArrowUpRight,
  Activity,
  Eye
} from 'lucide-react';
import InfoCard from '../components/dashboard/InfoCard';

const Inicio = ({
  estadoSistema,
  loading,
  onNuevaReserva,
  onVerReservas,
  onVerMenu,
  onVerEstadisticas
}) => {
  if (loading || !estadoSistema) {
    return (
      <div className="space-y-8">
        {/* Hero Skeleton */}
        <div className="h-32 bg-white/10 rounded-3xl animate-pulse"></div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-40 bg-white/10 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const statsData = [
    {
      title: 'Reservas Hoy',
      value: estadoSistema.reservas_hoy || 0,
      subtitle: `${estadoSistema.mesas_ocupadas || 0}/${estadoSistema.mesas_totales || 0} mesas ocupadas`,
      icon: Calendar,
      color: 'blue',
      trend: (estadoSistema.reservas_hoy > (estadoSistema.reservas_ayer || 0)) ? 'positive' : 'neutral',
      change: estadoSistema.reservas_ayer ? `+${estadoSistema.reservas_hoy - (estadoSistema.reservas_ayer || 0)}` : null,
      onClick: onVerReservas
    },
    {
      title: 'Ocupación',
      value: `${Math.round((estadoSistema.mesas_ocupadas / estadoSistema.mesas_totales) * 100) || 0}%`,
      subtitle: 'Capacidad actual del restaurante',
      icon: Users,
      color: 'emerald',
      trend: ((estadoSistema.mesas_ocupadas / estadoSistema.mesas_totales) > 0.7) ? 'positive' : 'neutral',
      onClick: onVerEstadisticas
    },
    {
      title: 'Próximas Reservas',
      value: estadoSistema.proximas_reservas?.length || 0,
      subtitle: 'En las próximas 2 horas',
      icon: Clock,
      color: 'amber',
      trend: 'neutral',
      onClick: onVerReservas
    },
    {
      title: 'Ingresos Estimados',
      value: `€${(estadoSistema.ingresos_estimados || 0).toFixed(0)}`,
      subtitle: 'Estimación del día actual',
      icon: TrendingUp,
      color: 'purple',
      trend: 'positive',
      change: '+12%',
      onClick: onVerEstadisticas
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="glass-card-lg p-8 bg-gradient-to-br from-white/20 to-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-3xl bg-theme-gradient flex-center shadow-xl animate-float">
                <Coffee className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold font-poppins bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Dashboard GastroBot
                </h1>
                <p className="text-lg text-slate-600 mt-1">
                  Gestión inteligente de tu restaurante
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-xl">
                <Activity className="w-4 h-4" />
                <span className="font-medium">Sistema Operativo</span>
              </div>
              <div className="text-slate-600">
                Última actualización: {new Date().toLocaleTimeString('es-ES')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNuevaReserva}
              className="btn-glass-primary px-6 py-3 rounded-2xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nueva Reserva
            </button>

            <button
              onClick={onVerMenu}
              className="btn-glass-secondary px-6 py-3 rounded-2xl font-semibold hover:scale-105 transition-all duration-300"
            >
              <Eye className="w-5 h-5 mr-2" />
              Ver Menú
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <InfoCard
            key={index}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            icon={stat.icon}
            color={stat.color}
            trend={stat.trend}
            change={stat.change}
            onClick={stat.onClick}
            className="animate-scale-in"
            style={{ animationDelay: `${index * 100}ms` }}
          />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Próximas Reservas */}
        <div className="glass-card-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex-center shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Próximas Reservas</h3>
                <p className="text-sm text-slate-600">Confirmadas para hoy</p>
              </div>
            </div>
            <button
              onClick={onVerReservas}
              className="p-2 glass-card rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-110"
            >
              <ArrowUpRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          <div className="space-y-4">
            {!estadoSistema?.proximas_reservas?.length ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-white/20 flex-center">
                  <Calendar className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">No hay reservas próximas</p>
                <p className="text-sm text-slate-400 mt-1">Las nuevas reservas aparecerán aquí</p>
              </div>
            ) : (
              estadoSistema.proximas_reservas.slice(0, 4).map((reserva, index) => (
                <div
                  key={index}
                  className="glass-card p-4 hover:bg-white/20 transition-all duration-300 hover:scale-[1.01] group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 flex-center">
                        <Users className="w-6 h-6 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">
                          {reserva.nombre}
                        </p>
                        <p className="text-sm text-slate-600">
                          {reserva.personas} {reserva.personas === 1 ? 'persona' : 'personas'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">{reserva.hora?.substring(0, 5)}</p>
                      <p className="text-xs text-slate-500">Mesa {reserva.mesa_id}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Estado del Menú */}
        <div className="glass-card-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex-center shadow-lg">
                <Coffee className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Estado del Menú</h3>
                <p className="text-sm text-slate-600">Platos destacados de hoy</p>
              </div>
            </div>
            <button
              onClick={onVerMenu}
              className="p-2 glass-card rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-110"
            >
              <ArrowUpRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="glass-card p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <div>
                    <p className="font-semibold text-slate-900">Paella Valenciana</p>
                    <p className="text-sm text-slate-600">Especialidad de la casa</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">€18.50</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-xs text-slate-500">4.8</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div>
                    <p className="font-semibold text-slate-900">Pulpo a la Gallega</p>
                    <p className="text-sm text-slate-600">Recomendación del chef</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">€16.00</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-xs text-slate-500">4.9</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div>
                    <p className="font-semibold text-slate-900">Jamón Ibérico</p>
                    <p className="text-sm text-slate-600">Producto premium</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">€24.00</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-xs text-slate-500">5.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Platos disponibles hoy</span>
              <span className="font-semibold text-slate-900">24 de 28</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inicio;