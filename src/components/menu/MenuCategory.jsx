/**
 * @fileoverview Componente de categoría del menú
 * Agrupa y muestra platos por categoría
 */

import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
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
 * @returns {JSX.Element|null} Componente MenuCategory
 */
function MenuCategory({ 
  categoria, 
  onToggleDisponibilidad, 
  onEditarPlato,
  onEliminarPlato,
  expandida, 
  onToggleExpand,
  mostrarVacio = true 
}) {
  // No mostrar si no hay platos y no se debe mostrar vacío
  if (!mostrarVacio && (!categoria.platos || categoria.platos.length === 0)) {
    return null;
  }

  const cantidadPlatos = categoria.platos?.length || 0;
  const platosDisponibles = categoria.platos?.filter(p => p.disponible).length || 0;

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
        
        {/* Descripción de la categoría si existe */}
        {categoria.descripcion && (
          <p className="text-sm text-gray-600 mt-1">{categoria.descripcion}</p>
        )}
      </div>

      {/* Lista de platos */}
      {expandida && (
        <div className="p-4">
          {cantidadPlatos === 0 ? (
            <p className="text-center py-4 text-gray-500">
              No hay platos en esta categoría
            </p>
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