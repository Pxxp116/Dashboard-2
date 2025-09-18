/**
 * @fileoverview Componente del tab de inicio del dashboard con diseño glassmorphism
 * Muestra resumen principal, estado del sistema y próximas reservas
 */

import React, { useState, useEffect } from 'react';
import DashboardResumen from './DashboardResumen';
import SystemStatus from './SystemStatus';
import UpcomingReservations from './UpcomingReservations';
import { useTheme } from '../../context/ThemeContext';

/**
 * Tab de inicio con resumen glassmorphism del sistema
 * @param {Object} props - Props del componente
 * @param {Object} props.estadoSistema - Estado actual del sistema
 * @param {Function} props.onRefresh - Callback para refrescar datos
 * @param {boolean} props.loading - Estado de carga
 * @returns {JSX.Element} Componente InicioTab
 */
function InicioTab({ estadoSistema, onRefresh, loading = false }) {
  const { currentThemeConfig } = useTheme();
  const [animationsReady, setAnimationsReady] = useState(false);

  // Activar animaciones después del montaje para mejor UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-8 min-h-screen">
      {/* Hero Section - Resumen Principal */}
      <section
        className={`animate-fade-slide-up ${animationsReady ? 'opacity-100' : 'opacity-0'}`}
      >
        <DashboardResumen
          estadoSistema={estadoSistema}
          loading={loading}
        />
      </section>

      {/* Estado del Sistema - Con animación staggered */}
      <section
        className={`animate-fade-slide-up animate-stagger-1 ${animationsReady ? 'opacity-100' : 'opacity-0'}`}
      >
        <SystemStatus
          estadoSistema={estadoSistema}
          onRefresh={onRefresh}
          loading={loading}
        />
      </section>

      {/* Próximas Reservas - Con animación staggered */}
      <section
        className={`animate-fade-slide-up animate-stagger-2 ${animationsReady ? 'opacity-100' : 'opacity-0'}`}
      >
        <UpcomingReservationsGlass
          proximasReservas={estadoSistema?.proximas_reservas}
          loading={loading}
        />
      </section>

      {/* Background decorativo glassmorphism */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 animate-glass-float"
          style={{
            background: currentThemeConfig?.gradient || 'linear-gradient(135deg, #93c5fd 0%, #2563eb 100%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-10 animate-glass-float"
          style={{
            background: currentThemeConfig?.gradient || 'linear-gradient(135deg, #93c5fd 0%, #2563eb 100%)',
            filter: 'blur(60px)',
            animationDelay: '3s'
          }}
        />
      </div>
    </div>
  );
}

/**
 * Componente UpcomingReservations mejorado con glassmorphism
 */
function UpcomingReservationsGlass({ proximasReservas, loading }) {
  const { currentThemeConfig } = useTheme();

  /**
   * Formatea la hora de la reserva
   */
  const formatearHora = (hora) => {
    return hora ? hora.substring(0, 5) : '';
  };

  return (
    <div className="glass-card p-6 glass-hover-lift">
      {/* Header mejorado */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
          style={{
            background: currentThemeConfig?.gradient || 'linear-gradient(135deg, #93c5fd 0%, #2563eb 100%)'
          }}
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-poppins">
            Próximas Reservas
          </h2>
          <p className="text-sm text-slate-600 font-medium">
            Agenda del día actualizada
          </p>
        </div>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="glass-metric p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-white/20 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-white/20 rounded w-48"></div>
                  </div>
                  <div className="h-6 bg-white/20 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !proximasReservas || proximasReservas.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-slate-500 font-medium">No hay reservas próximas</p>
          <p className="text-sm text-slate-400 mt-1">Disfruta de un momento tranquilo</p>
        </div>
      ) : (
        <div className="space-y-3">
          {proximasReservas.map((reserva, idx) => (
            <div
              key={reserva.id || idx}
              className={`glass-metric p-4 hover:scale-[1.02] transition-all duration-300 animate-fade-slide-up animate-stagger-${Math.min(idx + 1, 4)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                    style={{
                      background: currentThemeConfig?.gradient || 'linear-gradient(135deg, #93c5fd 0%, #2563eb 100%)'
                    }}
                  >
                    {reserva.personas}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 font-poppins">{reserva.nombre}</p>
                    <p className="text-sm text-slate-500">
                      {reserva.fecha} • {formatearHora(reserva.hora)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-700">
                    Mesa {reserva.mesa_id}
                  </div>
                  <div className="text-xs text-slate-500">
                    {reserva.personas} {reserva.personas === 1 ? 'persona' : 'personas'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default InicioTab;