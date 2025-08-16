/**
 * @fileoverview Componente de tarjeta de plato
 * Muestra información detallada de un plato individual
 */

import React from 'react';
import { Eye, EyeOff, AlertCircle, Edit2, Trash2 } from 'lucide-react';

/**
 * Tarjeta de plato individual
 * @param {Object} props - Props del componente
 * @param {Object} props.plato - Datos del plato
 * @param {Function} props.onToggleDisponibilidad - Callback para cambiar disponibilidad
 * @param {Function} props.onEditar - Callback para editar plato
 * @param {Function} props.onEliminar - Callback para eliminar plato
 * @returns {JSX.Element} Componente DishCard
 */
function DishCard({ plato, onToggleDisponibilidad, onEditar, onEliminar }) {
  /**
   * Formatea el precio con el símbolo de euro
   * @param {number|string} precio - Precio del plato
   * @returns {string} Precio formateado
   */
  const formatearPrecio = (precio) => {
    const precioNum = parseFloat(precio);
    return isNaN(precioNum) ? '0.00€' : `${precioNum.toFixed(2)}€`;
  };

  /**
   * Obtiene el icono de alérgeno
   * @param {string} alergeno - Nombre del alérgeno
   * @returns {string} Emoji del alérgeno
   */
  const getAlergenoIcon = (alergeno) => {
    const iconos = {
      'gluten': '🌾',
      'lacteos': '🥛',
      'huevos': '🥚',
      'pescado': '🐟',
      'mariscos': '🦐',
      'frutos secos': '🥜',
      'soja': '🌱',
      'apio': '🥬',
      'mostaza': '🌶️',
      'sesamo': '🌰',
      'sulfitos': '🍷',
      'moluscos': '🦪',
      'altramuces': '🌿',
      'cacahuetes': '🥜'
    };
    return iconos[alergeno.toLowerCase()] || '⚠️';
  };

  return (
    <div className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
      !plato.disponible ? 'bg-gray-50 opacity-75' : ''
    }`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {/* Nombre y precio */}
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-lg">
              {plato.nombre}
              {!plato.disponible && (
                <span className="ml-2 text-xs text-red-600 font-normal">
                  (No disponible)
                </span>
              )}
            </h4>
            <span className="font-bold text-lg text-green-600 ml-2">
              {formatearPrecio(plato.precio)}
            </span>
          </div>
          
          {/* Descripción */}
          {plato.descripcion && (
            <p className="text-sm text-gray-600 mb-2">
              {plato.descripcion}
            </p>
          )}
          
          {/* Alérgenos */}
          {plato.alergenos && plato.alergenos.length > 0 && (
            <div className="flex items-start mt-3">
              <AlertCircle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
              <div className="flex flex-wrap gap-2">
                {plato.alergenos.map((alergeno, idx) => (
                  <span 
                    key={idx}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800"
                    title={alergeno}
                  >
                    <span className="mr-1">{getAlergenoIcon(alergeno)}</span>
                    {alergeno}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Información adicional */}
          {plato.info_adicional && (
            <p className="text-xs text-gray-500 mt-2 italic">
              {plato.info_adicional}
            </p>
          )}
        </div>
        
        {/* Botones de acción */}
        <div className="ml-4 flex flex-col space-y-2">
          {/* Botón de disponibilidad */}
          <button
            onClick={() => onToggleDisponibilidad(plato.id, plato.disponible)}
            className={`p-2 rounded-lg transition-colors ${
              plato.disponible
                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                : 'bg-red-100 text-red-600 hover:bg-red-200'
            }`}
            title={plato.disponible ? 'Marcar como no disponible' : 'Marcar como disponible'}
          >
            {plato.disponible ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </button>
          
          {/* Botón de editar */}
          <button
            onClick={() => onEditar(plato)}
            className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors"
            title="Editar plato"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          
          {/* Botón de eliminar */}
          <button
            onClick={() => onEliminar(plato.id)}
            className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
            title="Eliminar plato"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DishCard;