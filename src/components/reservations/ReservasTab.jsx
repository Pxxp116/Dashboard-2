/**
 * @fileoverview Componente del tab de reservas
 * Gestiona la visualización y acciones sobre las reservas
 */

import React from 'react';
import { Plus } from 'lucide-react';
import ReservationTable from './ReservationTable';
import { SYSTEM_MESSAGES } from '../../services/utils/constants';

/**
 * Tab de gestión de reservas
 * @param {Object} props - Props del componente
 * @param {Array} props.reservas - Lista de reservas
 * @param {boolean} props.loading - Estado de carga
 * @param {Function} props.onNuevaReserva - Callback para nueva reserva
 * @param {Function} props.onCancelarReserva - Callback para cancelar reserva
 * @param {Function} props.onEliminarReserva - Callback para eliminar reserva
 * @returns {JSX.Element} Componente ReservasTab
 */
function ReservasTab({ reservas, loading, onNuevaReserva, onCancelarReserva, onEliminarReserva }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Reservas del Día</h2>
          <button
            onClick={onNuevaReserva}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            disabled={loading}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Reserva
          </button>
        </div>
        
        {reservas.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No hay reservas para hoy</p>
          </div>
        ) : (
          <ReservationTable
            reservas={reservas}
            onCancelar={onCancelarReserva}
            onEliminar={onEliminarReserva}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}

export default ReservasTab;