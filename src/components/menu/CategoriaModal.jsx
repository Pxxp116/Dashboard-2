/**
 * @fileoverview Modal para crear/editar categorías del menú
 * Gestiona el formulario de categorías con validación
 */

import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Loader2 } from 'lucide-react';
import { useMessage } from '../../hooks/useMessage';

/**
 * Modal para gestionar categorías del menú
 * @param {Object} props - Props del componente
 * @param {boolean} props.abierto - Si el modal está abierto
 * @param {string} props.modo - Modo del modal ('crear' o 'editar')
 * @param {Object} props.categoria - Datos de la categoría (para editar)
 * @param {Function} props.onCerrar - Callback al cerrar
 * @param {Function} props.onGuardar - Callback al guardar
 * @returns {JSX.Element|null} Componente CategoriaModal
 */
function CategoriaModal({ 
  abierto, 
  modo = 'crear', 
  categoria = null, 
  onCerrar, 
  onGuardar 
}) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    orden: 0,
    visible: true
  });
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState({});
  const { mostrarMensaje } = useMessage();

  // Inicializar formulario cuando se abre o cambia el modo
  useEffect(() => {
    if (abierto) {
      if (modo === 'editar' && categoria) {
        setFormData({
          nombre: categoria.nombre || '',
          descripcion: categoria.descripcion || '',
          orden: categoria.orden || 0,
          visible: categoria.visible !== undefined ? categoria.visible : true
        });
      } else {
        // Modo crear
        setFormData({
          nombre: '',
          descripcion: '',
          orden: 0,
          visible: true
        });
      }
      setErrores({});
    }
  }, [abierto, modo, categoria]);

  /**
   * Valida el formulario
   * @returns {boolean} Si el formulario es válido
   */
  const validarFormulario = () => {
    const nuevosErrores = {};
    
    // Validar nombre
    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio';
    } else if (formData.nombre.trim().length < 3) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData.nombre.trim().length > 50) {
      nuevosErrores.nombre = 'El nombre no puede tener más de 50 caracteres';
    }
    
    // Validar descripción (opcional)
    if (formData.descripcion && formData.descripcion.length > 200) {
      nuevosErrores.descripcion = 'La descripción no puede tener más de 200 caracteres';
    }
    
    // Validar orden
    const orden = parseInt(formData.orden);
    if (isNaN(orden) || orden < 0) {
      nuevosErrores.orden = 'El orden debe ser un número positivo';
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  /**
   * Maneja el cambio en los campos del formulario
   * @param {Object} e - Evento del input
   */
  const manejarCambio = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errores[name]) {
      setErrores(prev => {
        const nuevosErrores = { ...prev };
        delete nuevosErrores[name];
        return nuevosErrores;
      });
    }
  };

  /**
   * Maneja el envío del formulario
   * @param {Object} e - Evento del formulario
   */
  const manejarEnvio = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }
    
    setGuardando(true);
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'https://backend-2-production-227a.up.railway.app/api';
      
      let response;
      if (modo === 'crear') {
        response = await fetch(`${API_URL}/admin/menu/categoria`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: formData.nombre.trim(),
            descripcion: formData.descripcion.trim(),
            orden: parseInt(formData.orden) || 0
          })
        });
      } else {
        // Modo editar
        response = await fetch(`${API_URL}/admin/menu/categoria/${categoria.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: formData.nombre.trim(),
            descripcion: formData.descripcion.trim(),
            orden: parseInt(formData.orden) || 0,
            visible: formData.visible
          })
        });
      }
      
      const data = await response.json();
      
      if (data.exito) {
        mostrarMensaje(
          data.mensaje || `Categoría ${modo === 'crear' ? 'creada' : 'actualizada'} correctamente`,
          'success'
        );
        if (onGuardar) {
          await onGuardar(data.categoria);
        }
        onCerrar();
      } else {
        // Mostrar error del servidor
        if (data.mensaje && data.mensaje.includes('Ya existe')) {
          setErrores({ nombre: data.mensaje });
        } else {
          mostrarMensaje(data.mensaje || 'Error al guardar la categoría', 'error');
        }
      }
    } catch (error) {
      console.error('Error guardando categoría:', error);
      mostrarMensaje('Error al guardar la categoría', 'error');
    } finally {
      setGuardando(false);
    }
  };

  // No renderizar si no está abierto
  if (!abierto) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={guardando ? undefined : onCerrar}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">
              {modo === 'crear' ? 'Nueva Categoría' : 'Editar Categoría'}
            </h2>
            <button
              onClick={onCerrar}
              disabled={guardando}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Formulario */}
          <form onSubmit={manejarEnvio} className="p-6 space-y-4">
            {/* Campo Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Categoría *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={manejarCambio}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errores.nombre ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Entrantes, Platos principales, Postres..."
                maxLength={50}
                disabled={guardando}
              />
              {errores.nombre && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errores.nombre}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.nombre.length}/50 caracteres
              </p>
            </div>
            
            {/* Campo Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción (opcional)
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={manejarCambio}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errores.descripcion ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Descripción breve de la categoría..."
                maxLength={200}
                disabled={guardando}
              />
              {errores.descripcion && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errores.descripcion}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.descripcion.length}/200 caracteres
              </p>
            </div>
            
            {/* Campo Orden */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Orden de visualización
              </label>
              <input
                type="number"
                name="orden"
                value={formData.orden}
                onChange={manejarCambio}
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errores.orden ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
                disabled={guardando}
              />
              {errores.orden && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errores.orden}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Las categorías se muestran ordenadas por este número (menor a mayor)
              </p>
            </div>
            
            {/* Checkbox Visible (solo en modo editar) */}
            {modo === 'editar' && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="visible"
                  name="visible"
                  checked={formData.visible}
                  onChange={manejarCambio}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  disabled={guardando}
                />
                <label htmlFor="visible" className="ml-2 text-sm text-gray-700">
                  Categoría visible en el menú
                </label>
              </div>
            )}
          </form>
          
          {/* Footer con botones */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
            <button
              type="button"
              onClick={onCerrar}
              disabled={guardando}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={manejarEnvio}
              disabled={guardando}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {guardando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {modo === 'crear' ? 'Crear Categoría' : 'Guardar Cambios'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default CategoriaModal;