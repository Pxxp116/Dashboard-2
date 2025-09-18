/**
 * @fileoverview Componente DashboardResumen con diseño glassmorphism moderno
 * Muestra las métricas principales del restaurante con efectos visuales avanzados
 */

import React from 'react';
import { Calendar, Users, DollarSign, TrendingUp, Clock, ChefHat } from 'lucide-react';
import GlassCard, { GlassStatsCard, GlassMetricCard } from '../ui/GlassCard';
import { useTheme } from '../../context/ThemeContext';

/**
 * Componente principal del resumen del dashboard
 * @param {Object} props - Props del componente
 * @param {Object} props.estadoSistema - Estado actual del sistema desde el backend
 * @param {boolean} props.loading - Estado de carga
 * @returns {JSX.Element} Componente DashboardResumen
 */
function DashboardResumen({ estadoSistema, loading = false }) {
  const { currentThemeConfig } = useTheme();

  // Calcular métricas derivadas
  const porcentajeOcupacion = estadoSistema ?
    Math.round((estadoSistema.mesas_ocupadas / estadoSistema.mesas_totales) * 100) : 0;

  const ingresosEstimados = estadoSistema ?
    (estadoSistema.reservas_hoy * 45).toLocaleString('es-ES') : '0';

  const tendenciaReservas = estadoSistema?.reservas_hoy > 15 ? 'up' :
    estadoSistema?.reservas_hoy < 8 ? 'down' : 'neutral';

  const tendenciaOcupacion = porcentajeOcupacion > 75 ? 'up' :
    porcentajeOcupacion < 30 ? 'down' : 'neutral';

  return (
    <div className="space-y-8">
      {/* Título de la sección */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
          style={{
            background: currentThemeConfig?.gradient || 'linear-gradient(135deg, #93c5fd 0%, #2563eb 100%)'
          }}
        >
          <ChefHat className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-poppins">
            Resumen del Día
          </h2>
          <p className="text-sm text-slate-600 font-medium">
            Métricas clave en tiempo real
          </p>
        </div>
      </div>

      {/* Grid principal de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta 1: Reservas Hoy */}
        <GlassStatsCard
          title="Reservas Hoy"
          value={loading ? '-' : estadoSistema?.reservas_hoy || 0}
          subtitle={`${estadoSistema?.mesas_ocupadas || 0}/${estadoSistema?.mesas_totales || 0} mesas ocupadas`}
          icon={Calendar}
          trend={tendenciaReservas}
          trendValue={estadoSistema?.reservas_hoy > 15 ? '+12%' : estadoSistema?.reservas_hoy < 8 ? '-8%' : '~'}
          loading={loading}
          gradient
          onClick={() => console.log('Ver detalles de reservas')}
        >
          {/* Información adicional de reservas */}
          <div className="flex items-center justify-between text-xs text-slate-500 bg-white/10 rounded-lg p-2 mt-2">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Próxima: 19:30</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>Mesa 5</span>
            </div>
          </div>
        </GlassStatsCard>

        {/* Tarjeta 2: Ocupación */}
        <GlassStatsCard
          title="Ocupación"
          value={loading ? '-' : `${porcentajeOcupacion}%`}
          subtitle={porcentajeOcupacion > 80 ? 'Capacidad casi completa' :
            porcentajeOcupacion > 50 ? 'Buena ocupación' : 'Disponibilidad amplia'}
          icon={Users}
          trend={tendenciaOcupacion}
          trendValue={porcentajeOcupacion > 75 ? '+15%' : porcentajeOcupacion < 30 ? '-20%' : '~'}
          showProgress
          progressValue={porcentajeOcupacion}
          loading={loading}
          gradient
          onClick={() => console.log('Ver estado de mesas')}
        >
          {/* Indicadores de capacidad */}
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="text-center">
              <div className="text-xs text-slate-500">Libres</div>
              <div className="text-sm font-semibold text-emerald-600">
                {(estadoSistema?.mesas_totales || 0) - (estadoSistema?.mesas_ocupadas || 0)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500">Ocupadas</div>
              <div className="text-sm font-semibold text-orange-600">
                {estadoSistema?.mesas_ocupadas || 0}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500">Total</div>
              <div className="text-sm font-semibold text-slate-700">
                {estadoSistema?.mesas_totales || 0}
              </div>
            </div>
          </div>
        </GlassStatsCard>

        {/* Tarjeta 3: Ingresos Estimados */}
        <GlassStatsCard
          title="Ingresos Estimados"
          value={loading ? '-' : `€${ingresosEstimados}`}
          subtitle="Basado en reservas del día"
          icon={DollarSign}
          trend="up"
          trendValue="+8%"
          loading={loading}
          gradient
          onClick={() => console.log('Ver detalles financieros')}
        >
          {/* Desglose de ingresos */}
          <div className="space-y-2 mt-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Ticket promedio:</span>
              <span className="font-semibold text-slate-700">€45</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Meta del día:</span>
              <span className="font-semibold text-blue-600">€2,500</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-1">
              <div
                className="h-1 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (parseInt(ingresosEstimados.replace(/,/g, '')) / 2500) * 100)}%`,
                  background: currentThemeConfig?.gradient
                }}
              />
            </div>
          </div>
        </GlassStatsCard>
      </div>

      {/* Sección de métricas secundarias */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Tiempo promedio de servicio */}
        <GlassMetricCard
          title="Tiempo Promedio"
          value="45min"
          subtitle="Servicio completo"
          icon={Clock}
          size="sm"
          loading={loading}
        />

        {/* Satisfacción cliente */}
        <GlassMetricCard
          title="Satisfacción"
          value="4.8★"
          subtitle="Valoración media"
          icon={TrendingUp}
          size="sm"
          trend="up"
          trendValue="+0.2"
          loading={loading}
        />

        {/* Cancelaciones */}
        <GlassMetricCard
          title="Cancelaciones"
          value={loading ? '-' : '2'}
          subtitle="En las últimas 24h"
          icon={Calendar}
          size="sm"
          trend="down"
          trendValue="-50%"
          loading={loading}
        />

        {/* Personal activo */}
        <GlassMetricCard
          title="Personal Activo"
          value="8"
          subtitle="Meseros y cocina"
          icon={Users}
          size="sm"
          loading={loading}
        />
      </div>

      {/* Indicador de último update */}
      {estadoSistema?.espejo && (
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <div
            className={`w-2 h-2 rounded-full ${
              estadoSistema.espejo.edad_segundos <= 30 ? 'bg-emerald-400' : 'bg-orange-400'
            }`}
          />
          <span>
            Actualizado hace {estadoSistema.espejo.edad_segundos} segundos
          </span>
        </div>
      )}
    </div>
  );
}

export default DashboardResumen;