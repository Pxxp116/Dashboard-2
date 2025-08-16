/**
 * @fileoverview Modal para crear nueva reserva desde una mesa específica
 * Permite crear reservas directamente desde el historial de mesa
 */

import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Clock, Users, Phone, User, MessageSquare } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useMessage } from '../../hooks/useMessage';

/**
 * Modal para crear nueva reserva
 * @param {Object} props - Props del componente
 * @param {boolean} props.abierto - Si el modal está abierto
 * @param {Object} [props.mesa] - Mesa seleccionada
 * @param {Function} props.onCerrar - Callback al cerrar
 * @param {Function} props.onReservaCreada - Callback cuando se crea la reserva
 * @returns {JSX.Element} Modal de nueva reserva
 */
function NuevaReservaModal({ abierto, mesa, onCerrar, onReservaCreada }) {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    fecha: new Date().toISOString().split('T')[0],
    hora: '19:00',
    personas: 2,
    notas: '',
    alergias: ''
  });
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  
  const { actualizarDatosEspejo, datosEspejo } = useAppContext();
  const { mostrarMensaje } = useMessage();

  useEffect(() => {
    if (abierto) {
      // Resetear formulario al abrir
      setFormData({
        nombre: '',
        telefono: '',
        email: '',
        fecha: new Date().toISOString().split('T')[0],
        hora: '19:00',
        personas: mesa ? Math.min(mesa.capacidad, 4) : 2,
        notas: '',
        alergias: ''
      });
      setErrores({});
    }
  }, [abierto, mesa]);

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio';
    } else if (formData.nombre.trim().length < 2) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.telefono.trim()) {
      nuevosErrores.telefono = 'El teléfono es obligatorio';
    } else if (!/^\+?[0-9\s-()]{9,15}$/.test(formData.telefono.trim())) {
      nuevosErrores.telefono = 'Formato de teléfono inválido';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nuevosErrores.email = 'Email inválido';
    }

    if (!formData.fecha) {
      nuevosErrores.fecha = 'La fecha es obligatoria';
    } else {
      const fechaSeleccionada = new Date(formData.fecha);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      if (fechaSeleccionada < hoy) {
        nuevosErrores.fecha = 'La fecha no puede ser anterior a hoy';
      }
    }

    if (!formData.hora) {
      nuevosErrores.hora = 'La hora es obligatoria';
    }

    if (!formData.personas || formData.personas < 1) {
      nuevosErrores.personas = 'Debe ser al menos 1 persona';
    } else if (mesa && formData.personas > mesa.capacidad) {
      nuevosErrores.personas = `Esta mesa tiene capacidad para máximo ${mesa.capacidad} personas`;
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario() || !mesa) return;

    setGuardando(true);
    try {
      // Preparar datos para enviar
      const datosReserva = {
        nombre: formData.nombre.trim(),
        telefono: formData.telefono.trim(),
        email: formData.email.trim() || null,
        fecha: formData.fecha,
        hora: formData.hora,
        personas: parseInt(formData.personas),
        mesa_id: mesa.id,
        notas: formData.notas.trim() || null,
        alergias: formData.alergias.trim() || null,
        duracion: datosEspejo?.politicas?.tiempo_mesa_minutos || 120
      };

      // Llamar a la API para crear reserva
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://backend-2-production-227a.up.railway.app/api'}/crear-reserva`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosReserva)
      });

      const resultado = await response.json();

      if (resultado.exito) {
        mostrarMensaje(resultado.mensaje || 'Reserva creada correctamente', 'success');
        
        // Actualizar archivo espejo
        await actualizarDatosEspejo();
        
        // Notificar que se creó la reserva
        if (onReservaCreada) {
          onReservaCreada(resultado);
        }
        
        onCerrar();
      } else {
        mostrarMensaje(resultado.mensaje || 'Error al crear la reserva', 'error');
      }
    } catch (error) {
      console.error('Error creando reserva:', error);
      mostrarMensaje('Error al crear la reserva: ' + error.message, 'error');
    } finally {
      setGuardando(false);
    }
  };

  const manejarCambio = (campo, valor) => {
    setFormData(prev => ({
      ...prev,
      [campo]: valor
    }));
    
    // Limpiar error del campo al cambiar
    if (errores[campo]) {
      setErrores(prev => ({
        ...prev,
        [campo]: ''
      }));
    }
  };

  if (!abierto || !mesa) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold">Nueva Reserva</h2>
            <p className="text-gray-600 text-sm">
              {mesa.nombre ? `${mesa.nombre} (Mesa ${mesa.numero_mesa})` : `Mesa ${mesa.numero_mesa}`} 
              - Capacidad: {mesa.capacidad} personas
            </p>
          </div>
          <button
            onClick={onCerrar}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={manejarSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre del cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Nombre del Cliente *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => manejarCambio('nombre', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errores.nombre ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nombre completo"
                maxLength="100"
                required
              />
              {errores.nombre && (
                <p className="text-red-500 text-sm mt-1">{errores.nombre}</p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Teléfono *
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => manejarCambio('telefono', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errores.telefono ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+34 600 000 000"
                maxLength="20"
                required
              />
              {errores.telefono && (
                <p className="text-red-500 text-sm mt-1">{errores.telefono}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (Opcional)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => manejarCambio('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errores.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="cliente@email.com"
                maxLength="100"
              />
              {errores.email && (
                <p className="text-red-500 text-sm mt-1">{errores.email}</p>
              )}
            </div>

            {/* Número de personas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Número de Personas *
              </label>
              <input
                type="number"
                value={formData.personas}
                onChange={(e) => manejarCambio('personas', parseInt(e.target.value) || 1)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errores.personas ? 'border-red-500' : 'border-gray-300'
                }`}
                min="1"
                max={mesa.capacidad}
                required
              />
              {errores.personas && (
                <p className="text-red-500 text-sm mt-1">{errores.personas}</p>
              )}
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Fecha *
              </label>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => manejarCambio('fecha', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errores.fecha ? 'border-red-500' : 'border-gray-300'
                }`}
                min={new Date().toISOString().split('T')[0]}
                required
              />
              {errores.fecha && (
                <p className="text-red-500 text-sm mt-1">{errores.fecha}</p>
              )}
            </div>

            {/* Hora */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Hora *
              </label>
              <input
                type="time"
                value={formData.hora}
                onChange={(e) => manejarCambio('hora', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errores.hora ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errores.hora && (
                <p className="text-red-500 text-sm mt-1">{errores.hora}</p>
              )}
            </div>
          </div>

          {/* Notas */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="w-4 h-4 inline mr-1" />
              Notas Adicionales
            </label>
            <textarea
              value={formData.notas}
              onChange={(e) => manejarCambio('notas', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Comentarios especiales, celebraciones, preferencias..."
              maxLength="500"
            />
          </div>

          {/* Alergias */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alergias / Restricciones Alimentarias
            </label>
            <input
              type="text"
              value={formData.alergias}
              onChange={(e) => manejarCambio('alergias', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: frutos secos, gluten, lactosa..."
              maxLength="200"
            />
          </div>

          {/* Información de duración */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <Clock className="w-4 h-4 inline mr-1" />
              Duración estimada: {datosEspejo?.politicas?.tiempo_mesa_minutos || 120} minutos
            </p>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onCerrar}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={guardando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              disabled={guardando}
            >
              <Save className="w-4 h-4" />
              <span>{guardando ? 'Creando...' : 'Crear Reserva'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NuevaReservaModal;