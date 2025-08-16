/**
 * @fileoverview Componente Header del Dashboard
 * Muestra el título de la aplicación y la fecha actual
 */

import React from 'react';
import { Coffee } from 'lucide-react';
import { DATE_FORMATS } from '../../services/utils/constants';

/**
 * Header principal del dashboard
 * @returns {JSX.Element} Componente Header
 */
function Header() {
  /**
   * Obtiene la fecha actual formateada
   * @returns {string} Fecha formateada
   */
  const obtenerFechaActual = () => {
    return new Date().toLocaleDateString('es-ES', DATE_FORMATS.DISPLAY_DATE);
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Coffee className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-xl font-bold text-gray-900">GastroBot Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {obtenerFechaActual()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;