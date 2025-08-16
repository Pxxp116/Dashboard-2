/**
 * @fileoverview Componente de navegación por tabs
 * Gestiona la navegación entre las diferentes secciones del dashboard
 */

import React from 'react';
import { Home, Calendar, Users, Menu, Settings, Eye } from 'lucide-react';

/**
 * Mapeo de iconos por nombre
 */
const ICON_MAP = {
  Home,
  Calendar,
  Users,
  Menu,
  Settings,
  Eye
};

/**
 * Componente de navegación con tabs
 * @param {Object} props - Props del componente
 * @param {Array} props.tabs - Lista de tabs
 * @param {string} props.activeTab - Tab activo actual
 * @param {Function} props.onTabChange - Callback al cambiar de tab
 * @returns {JSX.Element} Componente Navigation
 */
function Navigation({ tabs, activeTab, onTabChange }) {
  /**
   * Renderiza un tab individual
   * @param {Object} tab - Configuración del tab
   * @returns {JSX.Element} Tab renderizado
   */
  const renderTab = (tab) => {
    const Icon = ICON_MAP[tab.icon];
    const isActive = activeTab === tab.id;
    
    return (
      <button
        key={tab.id}
        onClick={() => onTabChange(tab.id)}
        className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
          isActive
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
        aria-current={isActive ? 'page' : undefined}
      >
        <Icon className="w-4 h-4 mr-2" />
        {tab.label}
      </button>
    );
  };

  return (
    <nav className="bg-white shadow-sm" role="navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {tabs.map(renderTab)}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;