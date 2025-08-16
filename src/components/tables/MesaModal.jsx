/**
 * @fileoverview Modal para crear y editar mesas
 * Permite gestionar los datos de una mesa
 */

import React, { useState, useEffect } from 'react';
import { X, Save, Users, MapPin, Hash } from 'lucide-react';

/**
 * Modal para crear/editar mesas
 * @param {Object} props - Props del componente
 * @param {boolean} props.abierto - Si el modal está abierto
 * @param {Object} [props.mesa] - Mesa a editar (null para crear)
 * @param {string} props.modo - 'crear' o 'editar'
 * @param {Function} props.onGuardar - Callback al guardar
 * @param {Function} props.onCerrar - Callback al cerrar
 * @returns {JSX.Element} Modal de mesa
 */
function MesaModal({ abierto, mesa, modo, onGuardar, onCerrar }) {
  const [formData, setFormData] = useState({
    numero_mesa: '',
    capacidad: 2,
    zona: ''
  });
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (abierto) {
      if (mesa && modo === 'editar') {
        setFormData({
          numero_mesa: mesa.numero_mesa.toString(),
          capacidad: mesa.capacidad,
          zona: mesa.zona || ''
        });
      } else {
        setFormData({
          numero_mesa: '',
          capacidad: 2,
          zona: ''
        });
      }
      setErrores({});
    }
  }, [abierto, mesa, modo]);

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.numero_mesa.trim()) {
      nuevosErrores.numero_mesa = 'El número de mesa es obligatorio';
    } else if (isNaN(formData.numero_mesa) || parseInt(formData.numero_mesa) <= 0) {
      nuevosErrores.numero_mesa = 'Debe ser un número válido mayor a 0';
    }

    if (!formData.capacidad || formData.capacidad <= 0) {
      nuevosErrores.capacidad = 'La capacidad debe ser mayor a 0';
    } else if (formData.capacidad > 20) {
      nuevosErrores.capacidad = 'La capacidad no puede ser mayor a 20';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;

    setGuardando(true);
    try {
      const datosMesa = {
        numero_mesa: parseInt(formData.numero_mesa),
        capacidad: parseInt(formData.capacidad),
        zona: formData.zona.trim() || null
      };

      await onGuardar(datosMesa);
    } catch (error) {
      console.error('Error guardando mesa:', error);
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

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">
            {modo === 'crear' ? 'Nueva Mesa' : 'Editar Mesa'}
          </h2>
          <button
            onClick={onCerrar}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={manejarSubmit} className="p-6">
          <div className="space-y-4">
            {/* Número de mesa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Hash className="w-4 h-4 inline mr-1" />
                Número de Mesa *
              </label>
              <input
                type="number"
                value={formData.numero_mesa}
                onChange={(e) => manejarCambio('numero_mesa', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errores.numero_mesa ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: 1, 2, 3..."
                min="1"
                required
              />
              {errores.numero_mesa && (
                <p className="text-red-500 text-sm mt-1">{errores.numero_mesa}</p>
              )}
            </div>

            {/* Capacidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Capacidad *
              </label>
              <input
                type="number"
                value={formData.capacidad}
                onChange={(e) => manejarCambio('capacidad', parseInt(e.target.value))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errores.capacidad ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Número de personas"
                min="1"
                max="20"
                required
              />
              {errores.capacidad && (
                <p className="text-red-500 text-sm mt-1">{errores.capacidad}</p>
              )}
            </div>

            {/* Zona */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Zona (Opcional)
              </label>
              <input
                type="text"
                value={formData.zona}
                onChange={(e) => manejarCambio('zona', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Terraza, Salón, VIP..."
                maxLength="50"
              />
            </div>
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
              <span>{guardando ? 'Guardando...' : 'Guardar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MesaModal;