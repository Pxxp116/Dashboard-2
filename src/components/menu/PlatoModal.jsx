/**
 * @fileoverview Modal para crear/editar platos
 * Gestiona el formulario de platos con validación
 */

import React, { useState } from 'react';
import { X, Save, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { VALIDATION_RULES } from '../../services/utils/constants';

/**
 * Modal para gestionar platos
 * @param {Object} props - Props del componente
 * @param {Object} props.plato - Datos del plato
 * @param {Array} props.categorias - Lista de categorías
 * @param {Function} props.onChange - Callback al cambiar campos
 * @param {Function} props.onConfirm - Callback al confirmar
 * @param {Function} props.onCancel - Callback al cancelar
 * @param {boolean} props.loading - Estado de carga
 * @returns {JSX.Element} Componente PlatoModal
 */
function PlatoModal({ plato, categorias, onChange, onConfirm, onCancel, loading }) {
  const [alergenoNuevo, setAlergenoNuevo] = useState('');
  
  // Lista de alérgenos comunes
  const alergenosComunes = [
    'Gluten', 'Lácteos', 'Huevos', 'Pescado', 'Mariscos',
    'Frutos secos', 'Soja', 'Apio', 'Mostaza', 'Sésamo',
    'Sulfitos', 'Moluscos', 'Altramuces', 'Cacahuetes'
  ];

  /**
   * Maneja el cambio de un campo
   * @param {string} campo - Nombre del campo
   * @param {any} valor - Nuevo valor
   */
  const handleChange = (campo, valor) => {
    onChange({ ...plato, [campo]: valor });
  };

  /**
   * Añade un alérgeno a la lista
   */
  const añadirAlergeno = () => {
    if (alergenoNuevo && !plato.alergenos?.includes(alergenoNuevo)) {
      handleChange('alergenos', [...(plato.alergenos || []), alergenoNuevo]);
      setAlergenoNuevo('');
    }
  };

  /**
   * Elimina un alérgeno de la lista
   * @param {number} index - Índice del alérgeno
   */
  const eliminarAlergeno = (index) => {
    const nuevosAlergenos = plato.alergenos.filter((_, i) => i !== index);
    handleChange('alergenos', nuevosAlergenos);
  };

  /**
   * Valida si el formulario es válido
   * @returns {boolean} True si es válido
   */
  const esFormularioValido = () => {
    const precio = parseFloat(plato.precio);
    return (
      plato.nombre?.trim().length > 0 &&
      plato.descripcion?.trim().length > 0 &&
      !isNaN(precio) &&
      precio >= VALIDATION_RULES.MIN_PRICE &&
      precio <= VALIDATION_RULES.MAX_PRICE
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Nuevo Plato</h3>
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
          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Categoría <span className="text-red-500">*</span>
            </label>
            <select
              value={plato.categoria_id}
              onChange={(e) => handleChange('categoria_id', parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
          </div>
          
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Nombre del Plato <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={plato.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ej: Paella Valenciana"
              required
            />
          </div>
          
          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              value={plato.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="3"
              placeholder="Descripción breve del plato..."
              required
            />
          </div>
          
          {/* Precio */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Precio (€) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min={VALIDATION_RULES.MIN_PRICE}
              max={VALIDATION_RULES.MAX_PRICE}
              value={plato.precio}
              onChange={(e) => handleChange('precio', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="12.50"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Mínimo: {VALIDATION_RULES.MIN_PRICE}€ - Máximo: {VALIDATION_RULES.MAX_PRICE}€
            </p>
          </div>
          
          {/* Alérgenos */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Alérgenos
            </label>
            
            {/* Lista de alérgenos actuales */}
            {plato.alergenos?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {plato.alergenos.map((alergeno, idx) => (
                  <span 
                    key={idx}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800"
                  >
                    {alergeno}
                    <button
                      onClick={() => eliminarAlergeno(idx)}
                      className="ml-1 hover:text-red-600"
                      type="button"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            {/* Selector de alérgenos */}
            <div className="flex gap-2">
              <select
                value={alergenoNuevo}
                onChange={(e) => setAlergenoNuevo(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Seleccionar alérgeno...</option>
                {alergenosComunes.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <button
                onClick={añadirAlergeno}
                type="button"
                className="px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
                disabled={!alergenoNuevo}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Disponibilidad */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="disponible"
              checked={plato.disponible}
              onChange={(e) => handleChange('disponible', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="disponible" className="text-sm font-medium">
              Disponible inmediatamente
            </label>
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
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Crear Plato
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlatoModal;