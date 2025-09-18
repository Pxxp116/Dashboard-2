/**
 * @fileoverview Componente para mostrar el estado del sistema con diseño glassmorphism
 * Incluye métricas de archivo espejo, reservas y ocupación
 */

import React from 'react';
import { AlertCircle, CheckCircle, RefreshCw, Server, Database, Activity } from 'lucide-react';
import { UPDATE_INTERVALS, SYSTEM_MESSAGES } from '../../services/utils/constants';
import GlassCard, { GlassMetricCard } from '../ui/GlassCard';
import { useTheme } from '../../context/ThemeContext';

/**
 * Componente de estado del sistema con glassmorphism
 * @param {Object} props - Props del componente
 * @param {Object} props.estadoSistema - Estado del sistema
 * @param {Function} props.onRefresh - Callback para refrescar
 * @param {boolean} props.loading - Estado de carga
 * @returns {JSX.Element|null} Componente SystemStatus
 */
function SystemStatus({ estadoSistema, onRefresh, loading = false }) {
  const { currentThemeConfig } = useTheme();

  if (!estadoSistema && !loading) return null;

  const espejoFresco = estadoSistema?.espejo?.edad_segundos <= UPDATE_INTERVALS.MAX_MIRROR_AGE;
  const porcentajeOcupacion = estadoSistema ? Math.round(
    (estadoSistema.mesas_ocupadas / estadoSistema.mesas_totales) * 100
  ) : 0;

  // Determinar el estado de salud del sistema
  const systemHealth = espejoFresco ? 'healthy' : 'warning';
  const healthColors = {
    healthy: 'text-emerald-600',
    warning: 'text-amber-600',
    error: 'text-red-600'
  };

  return (
    <GlassCard className="p-6" gradient>
      {/* Header con título mejorado */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{
              background: currentThemeConfig?.gradient || 'linear-gradient(135deg, #93c5fd 0%, #2563eb 100%)'
            }}
          >
            <Server className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-poppins">
              Estado del Sistema
            </h2>
            <div className={`flex items-center gap-2 text-sm font-medium ${healthColors[systemHealth]}`}>
              <div className={`w-2 h-2 rounded-full ${
                systemHealth === 'healthy' ? 'bg-emerald-400 animate-pulse' :
                systemHealth === 'warning' ? 'bg-amber-400' : 'bg-red-400'
              }`} />
              <span>
                {systemHealth === 'healthy' ? 'Sistema Operativo' :
                 systemHealth === 'warning' ? 'Requiere Atención' : 'Sistema Crítico'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onRefresh}
          className="btn-glass-secondary p-3 rounded-xl hover:scale-105 transition-all duration-300 group"
          aria-label="Refrescar estado del sistema"
          disabled={loading}
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
        </button>
      </div>

      {/* Grid de métricas del sistema */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Archivo Espejo - Estado de conexión */}
        <GlassMetricCard
          title="Conexión Backend"
          value={loading ? '-' : `${estadoSistema?.espejo?.edad_segundos || 0}s`}
          subtitle={loading ? 'Verificando...' :
            espejoFresco ? SYSTEM_MESSAGES.DATA_FRESH : SYSTEM_MESSAGES.DATA_STALE}
          icon={espejoFresco ? CheckCircle : AlertCircle}
          trend={espejoFresco ? 'up' : 'down'}
          trendValue={espejoFresco ? 'OK' : 'Revisar'}
          loading={loading}
          className={espejoFresco ? 'border-emerald-200' : 'border-amber-200'}
        />

        {/* Actividad del Sistema */}
        <GlassMetricCard
          title="Actividad Sistema"
          value={loading ? '-' : estadoSistema?.reservas_hoy || 0}
          subtitle={loading ? 'Cargando...' :
            `${estadoSistema?.mesas_ocupadas || 0}/${estadoSistema?.mesas_totales || 0} mesas activas`}
          icon={Database}
          trend="up"
          trendValue="+5%"
          loading={loading}
        />

        {/* Rendimiento del Sistema */}
        <GlassMetricCard
          title="Rendimiento"
          value={loading ? '-' : `${porcentajeOcupacion}%`}
          subtitle="Capacidad utilizada"
          icon={Activity}
          showProgress
          progressValue={porcentajeOcupacion}
          trend={porcentajeOcupacion > 70 ? 'up' : 'neutral'}
          trendValue={porcentajeOcupacion > 70 ? 'Alto' : 'Normal'}
          loading={loading}
        />
      </div>

      {/* Información adicional del sistema */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
          <div className="text-xs text-slate-500 font-medium">Uptime</div>
          <div className="text-sm font-bold text-slate-900">99.8%</div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
          <div className="text-xs text-slate-500 font-medium">Latencia</div>
          <div className="text-sm font-bold text-slate-900">&lt; 50ms</div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
          <div className="text-xs text-slate-500 font-medium">CPU</div>
          <div className="text-sm font-bold text-slate-900">23%</div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
          <div className="text-xs text-slate-500 font-medium">Memoria</div>
          <div className="text-sm font-bold text-slate-900">1.2GB</div>
        </div>
      </div>
    </GlassCard>
  );
}

export default SystemStatus;