/**
 * @fileoverview Componente del tab de inicio del dashboard
 * Muestra el estado del sistema y las próximas reservas
 */

import React from 'react';
import SystemStatus from './SystemStatus';
import UpcomingReservations from './UpcomingReservations';

/**
 * Tab de inicio con resumen del sistema
 * @param {Object} props - Props del componente
 * @param {Object} props.estadoSistema - Estado actual del sistema
 * @param {Function} props.onRefresh - Callback para refrescar datos
 * @returns {JSX.Element} Componente InicioTab
 */
function InicioTab({ estadoSistema, onRefresh }) {
  return (
    <div className="space-y-6">
      {/* Estado del Sistema */}
      <SystemStatus 
        estadoSistema={estadoSistema}
        onRefresh={onRefresh}
      />
      
      {/* Próximas Reservas */}
      <UpcomingReservations 
        proximasReservas={estadoSistema?.proximas_reservas}
      />
    </div>
  );
}

export default InicioTab;