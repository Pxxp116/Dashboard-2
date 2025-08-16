/**
 * @fileoverview Componente para mostrar el estado del sistema
 * Incluye métricas de archivo espejo, reservas y ocupación
 */

import React from 'react';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { UPDATE_INTERVALS, SYSTEM_MESSAGES } from '../../services/utils/constants';

/**
 * Componente de estado del sistema
 * @param {Object} props - Props del componente
 * @param {Object} props.estadoSistema - Estado del sistema
 * @param {Function} props.onRefresh - Callback para refrescar
 * @returns {JSX.Element|null} Componente SystemStatus
 */
function SystemStatus({ estadoSistema, onRefresh }) {
  if (!estadoSistema) return null;
  
  const espejoFresco = estadoSistema.espejo?.edad_segundos <= UPDATE_INTERVALS.MAX_MIRROR_AGE;
  const porcentajeOcupacion = Math.round(
    (estadoSistema.mesas_ocupadas / estadoSistema.mesas_totales) * 100
  );
  
  /**
   * Renderiza una tarjeta de métrica
   * @param {Object} config - Configuración de la tarjeta
   * @returns {JSX.Element} Tarjeta de métrica
   */
  const renderMetricCard = (config) => {
    const {
      title,
      value,
      subtitle,
      bgColor,
      icon: Icon,
      iconColor,
      showProgress,
      progressValue
    } = config;
    
    return (
      <div className={`p-4 rounded-lg ${bgColor}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{title}</span>
          {Icon && <Icon className={`w-5 h-5 ${iconColor}`} />}
        </div>
        <p className="text-2xl font-bold mt-2">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
        {showProgress && (
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${progressValue}%` }}
              role="progressbar"
              aria-valuenow={progressValue}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <AlertCircle className="mr-2" />
          Estado del Sistema
        </h2>
        <button
          onClick={onRefresh}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Refrescar estado del sistema"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Archivo Espejo */}
        {renderMetricCard({
          title: 'Archivo Espejo',
          value: `${estadoSistema.espejo?.edad_segundos}s`,
          subtitle: espejoFresco ? SYSTEM_MESSAGES.DATA_FRESH : SYSTEM_MESSAGES.DATA_STALE,
          bgColor: espejoFresco ? 'bg-green-50' : 'bg-red-50',
          icon: espejoFresco ? CheckCircle : AlertCircle,
          iconColor: espejoFresco ? 'text-green-600' : 'text-red-600'
        })}
        
        {/* Reservas Hoy */}
        {renderMetricCard({
          title: 'Reservas Hoy',
          value: estadoSistema.reservas_hoy,
          subtitle: `${estadoSistema.mesas_ocupadas}/${estadoSistema.mesas_totales} mesas ocupadas`,
          bgColor: 'bg-blue-50'
        })}
        
        {/* Ocupación */}
        {renderMetricCard({
          title: 'Ocupación',
          value: `${porcentajeOcupacion}%`,
          bgColor: 'bg-purple-50',
          showProgress: true,
          progressValue: porcentajeOcupacion
        })}
      </div>
    </div>
  );
}

export default SystemStatus;