/**
 * @fileoverview Modal para crear/editar reservas
 * Gestiona el formulario de reservas con validación
 */

import React from 'react';
import { X, Save, RefreshCw } from 'lucide-react';
import { VALIDATION_RULES, UI_CONFIG } from '../../services/utils/constants';

/**
 * Modal para gestionar reservas
 * @param {Object} props - Props del componente
 * @param {Object} props.reserva - Datos de la reserva
 * @param {Function} props.onChange - Callback al cambiar campos
 * @param {Function} props.onConfirm - Callback al confirmar
 * @param {Function} props.onCancel - Callback al cancelar
 * @param {boolean} props.loading - Estado de carga
 * @returns {JSX.Element} Componente ReservaModal
 */
function ReservaModal({ reserva, onChange, onConfirm, onCancel, loading }) {
  /**
   * Maneja el cambio de un campo
   * @param {string} campo - Nombre del campo
   * @param {any} valor - Nuevo valor
   */
  const handleChange = (campo, valor) => {
    onChange({ ...reserva, [campo]: valor });
  };
  
  /**
   * Valida si el formulario es válido
   * @returns {boolean} True si es válido
   */
  const esFormularioValido = () => {
    return (
      reserva.nombre?.length >= VALIDATION_RULES.MIN_NAME_LENGTH &&
      reserva.telefono?.match(VALIDATION_RULES.PHONE_REGEX) &&
      reserva.fecha &&
      reserva.hora
    );
  };
  
  /**
   * Genera opciones de personas
   * @returns {Array} Opciones para el select
   */
  const opcionesPersonas = () => {
    return Array.from({ length: UI_CONFIG.MAX_PERSONAS }, (_, i) => i + 1);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Nueva Reserva</h3>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 rounded"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Formulario */}
        <div className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={reserva.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre del cliente"
              maxLength={VALIDATION_RULES.MAX_NAME_LENGTH}
              required
            />
          </div>
          
          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Teléfono <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={reserva.telefono}
              onChange={(e) => handleChange('telefono', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+34 600 000 000"
              required
            />
          </div>
          
          {/* Fecha y Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Fecha <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={reserva.fecha}
                onChange={(e) => handleChange('fecha', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Hora <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={reserva.hora}
                onChange={(e) => handleChange('hora', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          {/* Personas */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Personas <span className="text-red-500">*</span>
            </label>
            <select
              value={reserva.personas}
              onChange={(e) => handleChange('personas', parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {opcionesPersonas().map(n => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'persona' : 'personas'}
                </option>
              ))}
            </select>
          </div>
          
          {/* Notas */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Notas (opcional)
            </label>
            <textarea
              value={reserva.notas}
              onChange={(e) => handleChange('notas', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Alergias, celebraciones, preferencias..."
              maxLength={VALIDATION_RULES.MAX_NOTES_LENGTH}
            />
            <p className="text-xs text-gray-500 mt-1">
              {reserva.notas?.length || 0}/{VALIDATION_RULES.MAX_NOTES_LENGTH} caracteres
            </p>
          </div>
        </div>
        
        {/* Acciones */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading || !esFormularioValido()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Crear Reserva
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReservaModal;