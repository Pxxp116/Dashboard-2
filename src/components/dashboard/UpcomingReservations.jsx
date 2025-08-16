/**
 * @fileoverview Componente para mostrar las próximas reservas
 * Muestra una lista de las reservas más cercanas en el tiempo
 */

import React from 'react';
import { Clock } from 'lucide-react';

/**
 * Componente de próximas reservas
 * @param {Object} props - Props del componente
 * @param {Array} props.proximasReservas - Lista de próximas reservas
 * @returns {JSX.Element} Componente UpcomingReservations
 */
function UpcomingReservations({ proximasReservas }) {
  /**
   * Formatea la hora de la reserva
   * @param {string} hora - Hora en formato HH:MM:SS
   * @returns {string} Hora formateada HH:MM
   */
  const formatearHora = (hora) => {
    return hora ? hora.substring(0, 5) : '';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Próximas Reservas</h2>
      
      {!proximasReservas || proximasReservas.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No hay reservas próximas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {proximasReservas.map((reserva, idx) => (
            <div 
              key={reserva.id || idx} 
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-3 text-gray-500" />
                <div>
                  <p className="font-medium">{reserva.nombre}</p>
                  <p className="text-sm text-gray-500">
                    {reserva.fecha} - {formatearHora(reserva.hora)} - {reserva.personas} {reserva.personas === 1 ? 'persona' : 'personas'}
                  </p>
                </div>
              </div>
              <span className="text-sm font-medium text-blue-600">
                Mesa {reserva.mesa_id}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UpcomingReservations;