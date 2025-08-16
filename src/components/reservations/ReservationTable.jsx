/**
 * @fileoverview Tabla de reservas con acciones
 * Muestra todas las reservas en formato tabla
 */

import React from 'react';
import { X, Phone, Users, Clock } from 'lucide-react';
import { ESTADOS_RESERVA } from '../../types';

/**
 * Tabla de reservas
 * @param {Object} props - Props del componente
 * @param {Array} props.reservas - Lista de reservas
 * @param {Function} props.onCancelar - Callback para cancelar reserva
 * @param {boolean} props.loading - Estado de carga
 * @returns {JSX.Element} Componente ReservationTable
 */
function ReservationTable({ reservas, onCancelar, loading }) {
  /**
   * Obtiene el estilo del badge de estado
   * @param {string} estado - Estado de la reserva
   * @returns {string} Clases CSS para el badge
   */
  const getEstadoBadgeClass = (estado) => {
    const styles = {
      [ESTADOS_RESERVA.CONFIRMADA]: 'bg-green-100 text-green-800',
      [ESTADOS_RESERVA.PENDIENTE]: 'bg-yellow-100 text-yellow-800',
      [ESTADOS_RESERVA.CANCELADA]: 'bg-red-100 text-red-800'
    };
    return styles[estado] || 'bg-gray-100 text-gray-800';
  };

  /**
   * Formatea la hora
   * @param {string} hora - Hora en formato HH:MM:SS
   * @returns {string} Hora formateada
   */
  const formatearHora = (hora) => {
    return hora ? hora.substring(0, 5) : '';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 px-3">
              <Clock className="w-4 h-4 inline mr-1" />
              Hora
            </th>
            <th className="text-left py-2 px-3">Cliente</th>
            <th className="text-left py-2 px-3">
              <Users className="w-4 h-4 inline mr-1" />
              Personas
            </th>
            <th className="text-left py-2 px-3">Mesa</th>
            <th className="text-left py-2 px-3">Estado</th>
            <th className="text-left py-2 px-3">Notas</th>
            <th className="text-center py-2 px-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reservas.map((reserva) => (
            <tr key={reserva.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-3 font-medium">
                {formatearHora(reserva.hora)}
              </td>
              <td className="py-3 px-3">
                <div>
                  <p className="font-medium">{reserva.nombre}</p>
                  <p className="text-sm text-gray-500 flex items-center">
                    <Phone className="w-3 h-3 mr-1" />
                    {reserva.telefono}
                  </p>
                </div>
              </td>
              <td className="py-3 px-3">
                <span className="inline-flex items-center">
                  {reserva.personas}
                </span>
              </td>
              <td className="py-3 px-3">
                <span className="font-medium">Mesa {reserva.mesa_id}</span>
              </td>
              <td className="py-3 px-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoBadgeClass(reserva.estado)}`}>
                  {reserva.estado}
                </span>
              </td>
              <td className="py-3 px-3">
                {reserva.notas ? (
                  <span className="text-sm text-gray-600" title={reserva.notas}>
                    {reserva.notas.length > 30 
                      ? `${reserva.notas.substring(0, 30)}...` 
                      : reserva.notas}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">-</span>
                )}
              </td>
              <td className="py-3 px-3 text-center">
                {reserva.estado !== ESTADOS_RESERVA.CANCELADA && (
                  <button
                    onClick={() => onCancelar(reserva.id)}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition-colors"
                    disabled={loading}
                    title="Cancelar reserva"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReservationTable;