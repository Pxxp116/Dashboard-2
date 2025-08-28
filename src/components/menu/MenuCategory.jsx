/**
 * @fileoverview Componente de categoría del menú
 * Agrupa y muestra platos por categoría
 */

import React from 'react';
import { ChevronDown, ChevronUp, Edit2, Trash2, Plus } from 'lucide-react';
import DishCard from './DishCard';

/**
 * Categoría del menú con sus platos
 * @param {Object} props - Props del componente
 * @param {Object} props.categoria - Datos de la categoría
 * @param {Function} props.onToggleDisponibilidad - Callback para cambiar disponibilidad
 * @param {Function} props.onEditarPlato - Callback para editar plato
 * @param {Function} props.onEliminarPlato - Callback para eliminar plato
 * @param {boolean} props.expandida - Si la categoría está expandida
 * @param {Function} props.onToggleExpand - Callback para expandir/contraer
 * @param {boolean} props.mostrarVacio - Si mostrar cuando no hay platos
 * @param {Function} props.onEditarCategoria - Callback para editar categoría
 * @param {Function} props.onEliminarCategoria - Callback para eliminar categoría
 * @param {Function} props.onAñadirPlato - Callback para añadir plato a la categoría
 * @returns {JSX.Element|null} Componente MenuCategory
 */
function MenuCategory({ 
  categoria, 
  onToggleDisponibilidad, 
  onEditarPlato,
  onEliminarPlato,
  expandida, 
  onToggleExpand,
  mostrarVacio = true,
  onEditarCategoria,
  onEliminarCategoria,
  onAñadirPlato
}) {
  // No mostrar si no hay platos y no se debe mostrar vacío
  if (!mostrarVacio && (!categoria.platos || categoria.platos.length === 0)) {
    return null;
  }

  const cantidadPlatos = categoria.platos?.length || 0;
  const platosDisponibles = categoria.platos?.filter(p => p.disponible).length || 0;

  /**
   * Maneja el clic en editar categoría
   * @param {Object} e - Evento del clic
   */
  const manejarEditarCategoria = (e) => {
    e.stopPropagation(); // Evitar que se expanda/contraiga
    if (onEditarCategoria) {
      onEditarCategoria(categoria);
    }
  };

  /**
   * Maneja el clic en eliminar categoría
   * @param {Object} e - Evento del clic
   */
  const manejarEliminarCategoria = (e) => {
    e.stopPropagation(); // Evitar que se expanda/contraiga
    if (onEliminarCategoria) {
      onEliminarCategoria(categoria);
    }
  };

  /**
   * Maneja el clic en añadir plato
   * @param {Object} e - Evento del clic
   */
  const manejarAñadirPlato = (e) => {
    e.stopPropagation(); // Evitar que se expanda/contraiga
    if (onAñadirPlato) {
      onAñadirPlato(categoria);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header de la categoría */}
      <div 
        className="bg-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h3 className="text-lg font-semibold text-gray-800">
              {categoria.nombre}
            </h3>
            <span className="ml-3 text-sm text-gray-500">
              ({platosDisponibles}/{cantidadPlatos} disponibles)
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Botones de acción de categoría */}
            {(onEditarCategoria || onEliminarCategoria) && (
              <div className="flex items-center space-x-1 mr-2">
                {onEditarCategoria && (
                  <button
                    onClick={manejarEditarCategoria}
                    className="p-1.5 hover:bg-gray-200 rounded transition-colors text-gray-600 hover:text-blue-600"
                    title="Editar categoría"
                    aria-label="Editar categoría"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
                
                {onEliminarCategoria && (
                  <button
                    onClick={manejarEliminarCategoria}
                    className="p-1.5 hover:bg-gray-200 rounded transition-colors text-gray-600 hover:text-red-600"
                    title={`Eliminar categoría${cantidadPlatos > 0 ? ` (${cantidadPlatos} platos)` : ''}`}
                    aria-label="Eliminar categoría"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                
                {/* Separador visual */}
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
              </div>
            )}
            
            {/* Botón expandir/contraer */}
            <button
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              aria-label={expandida ? 'Contraer' : 'Expandir'}
            >
              {expandida ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
        
        {/* Descripción de la categoría si existe */}
        {categoria.descripcion && (
          <p className="text-sm text-gray-600 mt-1">{categoria.descripcion}</p>
        )}
      </div>

      {/* Lista de platos */}
      {expandida && (
        <div className="p-4">
          {/* Botón añadir plato contextual */}
          {onAñadirPlato && (
            <div className="mb-4">
              <button
                onClick={manejarAñadirPlato}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm"
                title={`Añadir plato a ${categoria.nombre}`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Añadir plato a {categoria.nombre}
              </button>
            </div>
          )}
          
          {cantidadPlatos === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-3">No hay platos en esta categoría</p>
              {onAñadirPlato && (
                <button
                  onClick={manejarAñadirPlato}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center mx-auto"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Crear primer plato
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoria.platos.map((plato) => (
                <DishCard
                  key={plato.id}
                  plato={plato}
                  onToggleDisponibilidad={onToggleDisponibilidad}
                  onEditar={onEditarPlato}
                  onEliminar={onEliminarPlato}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MenuCategory;