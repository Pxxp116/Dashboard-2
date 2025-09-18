/**
 * @fileoverview Modal para crear/editar reservas
 * Gestiona el formulario de reservas con validación
 */

import React from 'react';
import { X, Save, RefreshCw, User, Phone, Calendar, Clock, Users, MessageSquare } from 'lucide-react';
import { VALIDATION_RULES, UI_CONFIG } from '../../services/utils/constants';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';

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
    <Modal
      isOpen={true}
      onClose={onCancel}
      title="Nueva Reserva"
      size="default"
    >
      <ModalBody>
        <div className="space-y-6">
          {/* Información del cliente */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-600" />
              Datos del Cliente
            </h4>

            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Nombre del cliente"
                type="text"
                value={reserva.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                placeholder="Nombre completo"
                icon={User}
                required
                maxLength={VALIDATION_RULES.MAX_NAME_LENGTH}
                error={reserva.nombre && reserva.nombre.length < VALIDATION_RULES.MIN_NAME_LENGTH ?
                  `Mínimo ${VALIDATION_RULES.MIN_NAME_LENGTH} caracteres` : ''}
              />

              <Input
                label="Teléfono de contacto"
                type="tel"
                value={reserva.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
                placeholder="+34 600 000 000"
                icon={Phone}
                required
                error={reserva.telefono && !reserva.telefono.match(VALIDATION_RULES.PHONE_REGEX) ?
                  'Formato de teléfono inválido' : ''}
              />
            </div>
          </div>

          {/* Detalles de la reserva */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-600" />
              Detalles de la Reserva
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Fecha"
                type="date"
                value={reserva.fecha}
                onChange={(e) => handleChange('fecha', e.target.value)}
                icon={Calendar}
                min={new Date().toISOString().split('T')[0]}
                required
              />

              <Input
                label="Hora"
                type="time"
                value={reserva.hora}
                onChange={(e) => handleChange('hora', e.target.value)}
                icon={Clock}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Número de personas *
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={reserva.personas}
                  onChange={(e) => handleChange('personas', parseInt(e.target.value))}
                  className="form-input pl-10 appearance-none bg-white cursor-pointer"
                  required
                >
                  {opcionesPersonas().map(n => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'persona' : 'personas'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Notas especiales */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary-600" />
              Notas Especiales
            </h4>

            <div className="form-group">
              <label className="form-label">
                Comentarios adicionales
              </label>
              <textarea
                value={reserva.notas}
                onChange={(e) => handleChange('notas', e.target.value)}
                className="form-input resize-none"
                rows="4"
                placeholder="Alergias, celebraciones, preferencias de mesa, etc..."
                maxLength={VALIDATION_RULES.MAX_NOTES_LENGTH}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  Información opcional para personalizar la experiencia
                </p>
                <p className="text-xs text-gray-500">
                  {reserva.notas?.length || 0}/{VALIDATION_RULES.MAX_NOTES_LENGTH}
                </p>
              </div>
            </div>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={onConfirm}
          disabled={loading || !esFormularioValido()}
          loading={loading}
          icon={loading ? RefreshCw : Save}
        >
          {loading ? 'Creando...' : 'Crear Reserva'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default ReservaModal;