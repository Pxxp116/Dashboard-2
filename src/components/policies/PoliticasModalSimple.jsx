/**
 * @fileoverview Modal simplificado para editar políticas del restaurante
 * Solo incluye los 3 campos esenciales: cancelación, duración de mesa y fumadores
 */

import React, { useState, useEffect } from 'react';
import { X, Save, Clock, Calendar, AlertCircle, PawPrint } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useMessage } from '../../hooks/useMessage';
import mirrorService from '../../services/api/mirrorService';

/**
 * Modal simplificado de edición de políticas
 * @param {Object} props - Props del componente
 * @param {boolean} props.abierto - Si el modal está abierto
 * @param {Object} props.politicas - Políticas actuales
 * @param {Function} props.onCerrar - Callback al cerrar
 * @param {Function} props.onGuardar - Callback al guardar
 * @returns {JSX.Element} Modal de políticas simplificado
 */
function PoliticasModalSimple({ abierto, politicas, onCerrar, onGuardar }) {
  const [formData, setFormData] = useState({
    cancelacion_horas: 24,
    tiempo_mesa_minutos: 120,
    mascotas_permitidas: false,
    fumadores_terraza: true
  });

  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState({});
  
  const { actualizarDatosEspejo } = useAppContext();
  const { mostrarMensaje } = useMessage();

  useEffect(() => {
    if (abierto && politicas) {
      setFormData({
        cancelacion_horas: politicas.cancelacion_horas || 24,
        tiempo_mesa_minutos: politicas.tiempo_mesa_minutos || 120,
        mascotas_permitidas: politicas.mascotas_permitidas || false,
        fumadores_terraza: politicas.fumadores_terraza !== false
      });
      setErrores({});
    }
  }, [abierto, politicas]);

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (formData.cancelacion_horas < 0 || formData.cancelacion_horas > 168) {
      nuevosErrores.cancelacion_horas = 'Debe estar entre 0 y 168 horas';
    }

    if (formData.tiempo_mesa_minutos < 30 || formData.tiempo_mesa_minutos > 480) {
      nuevosErrores.tiempo_mesa_minutos = 'Debe estar entre 30 y 480 minutos';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      mostrarMensaje('Por favor corrige los errores en el formulario', 'error');
      return;
    }

    setGuardando(true);
    try {
      const response = await mirrorService.actualizarPoliticas(formData);
      
      if (response.exito) {
        mostrarMensaje('Políticas actualizadas correctamente', 'success');
        await actualizarDatosEspejo();
        if (onGuardar) onGuardar(formData);
        onCerrar();
      } else {
        mostrarMensaje(response.mensaje || 'Error al actualizar políticas', 'error');
      }
    } catch (error) {
      console.error('Error actualizando políticas:', error);
      mostrarMensaje('Error al actualizar políticas: ' + error.message, 'error');
    } finally {
      setGuardando(false);
    }
  };

  const manejarCambio = (campo, valor) => {
    setFormData(prev => ({
      ...prev,
      [campo]: valor
    }));
    
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 mr-2 text-blue-600" />
            <h2 className="text-xl font-bold">Editar Políticas del Restaurante</h2>
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
          <div className="space-y-6">
            
            {/* Tiempo de antelación para cancelar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Tiempo de antelación para cancelar (horas)
              </label>
              <input
                type="number"
                value={formData.cancelacion_horas}
                onChange={(e) => manejarCambio('cancelacion_horas', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errores.cancelacion_horas ? 'border-red-500' : 'border-gray-300'
                }`}
                min="0"
                max="168"
                placeholder="24"
              />
              {errores.cancelacion_horas && (
                <p className="text-red-500 text-sm mt-1">{errores.cancelacion_horas}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                Número de horas de antelación mínima para cancelar una reserva
              </p>
            </div>

            {/* Duración estándar de mesa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Duración estándar de mesa (minutos)
              </label>
              <input
                type="number"
                value={formData.tiempo_mesa_minutos}
                onChange={(e) => manejarCambio('tiempo_mesa_minutos', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errores.tiempo_mesa_minutos ? 'border-red-500' : 'border-gray-300'
                }`}
                min="30"
                max="480"
                placeholder="120"
              />
              {errores.tiempo_mesa_minutos && (
                <p className="text-red-500 text-sm mt-1">{errores.tiempo_mesa_minutos}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                Tiempo promedio que cada reserva ocupa la mesa
              </p>
            </div>

            {/* Mascotas permitidas */}
            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.mascotas_permitidas}
                  onChange={(e) => manejarCambio('mascotas_permitidas', e.target.checked)}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <PawPrint className="w-4 h-4 mr-2 text-gray-600" />
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Mascotas permitidas
                  </span>
                  <p className="text-gray-500 text-sm">
                    Permite que los clientes traigan sus mascotas al restaurante
                  </p>
                </div>
              </label>
            </div>

            {/* Permitir fumadores en terraza */}
            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.fumadores_terraza}
                  onChange={(e) => manejarCambio('fumadores_terraza', e.target.checked)}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <AlertCircle className="w-4 h-4 mr-2 text-gray-600" />
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Permitir fumadores en terraza
                  </span>
                  <p className="text-gray-500 text-sm">
                    Permite que los clientes fumen en las mesas de la terraza
                  </p>
                </div>
              </label>
            </div>

          </div>

          {/* Información adicional */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              Los cambios se aplicarán inmediatamente y se sincronizarán con el GPT personalizado
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
              <span>{guardando ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PoliticasModalSimple;