/**
 * @fileoverview Tab de gestión y visualización de mesas
 * Muestra el estado actual de todas las mesas del restaurante
 */

import React, { useState } from 'react';
import { Users, Filter } from 'lucide-react';
import TableCard from './TableCard';
import { ESTADOS_MESA } from '../../types';

/**
 * Tab de mesas del restaurante
 * @param {Object} props - Props del componente
 * @param {Array} props.mesas - Lista de mesas
 * @returns {JSX.Element} Componente MesasTab
 */
function MesasTab({ mesas }) {
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [filtroCapacidad, setFiltroCapacidad] = useState('todas');

  /**
   * Filtra las mesas según los criterios seleccionados
   * @returns {Array} Mesas filtradas
   */
  const mesasFiltradas = () => {
    return mesas.filter(mesa => {
      const cumpleEstado = filtroEstado === 'todas' || mesa.estado === filtroEstado;
      const cumpleCapacidad = filtroCapacidad === 'todas' || 
        (filtroCapacidad === '2' && mesa.capacidad <= 2) ||
        (filtroCapacidad === '4' && mesa.capacidad > 2 && mesa.capacidad <= 4) ||
        (filtroCapacidad === '6+' && mesa.capacidad > 4);
      
      return cumpleEstado && cumpleCapacidad;
    });
  };

  /**
   * Calcula estadísticas de las mesas
   * @returns {Object} Estadísticas
   */
  const calcularEstadisticas = () => {
    const total = mesas.length;
    const ocupadas = mesas.filter(m => m.estado === ESTADOS_MESA.OCUPADA).length;
    const libres = mesas.filter(m => m.estado === ESTADOS_MESA.LIBRE).length;
    const porcentajeOcupacion = total > 0 ? Math.round((ocupadas / total) * 100) : 0;
    
    return { total, ocupadas, libres, porcentajeOcupacion };
  };

  const stats = calcularEstadisticas();
  const mesasParaMostrar = mesasFiltradas();

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Resumen de Mesas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Mesas"
            value={stats.total}
            color="bg-blue-50 text-blue-600"
          />
          <StatCard
            label="Ocupadas"
            value={stats.ocupadas}
            color="bg-red-50 text-red-600"
          />
          <StatCard
            label="Libres"
            value={stats.libres}
            color="bg-green-50 text-green-600"
          />
          <StatCard
            label="Ocupación"
            value={`${stats.porcentajeOcupacion}%`}
            color="bg-purple-50 text-purple-600"
          />
        </div>
      </div>

      {/* Filtros y Grid de Mesas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Estado de Mesas</h2>
          
          {/* Filtros */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Filter className="w-4 h-4 mr-2 text-gray-500" />
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-3 py-1 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todas">Todas</option>
                <option value={ESTADOS_MESA.LIBRE}>Libres</option>
                <option value={ESTADOS_MESA.OCUPADA}>Ocupadas</option>
              </select>
            </div>
            
            <select
              value={filtroCapacidad}
              onChange={(e) => setFiltroCapacidad(e.target.value)}
              className="px-3 py-1 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todas">Toda capacidad</option>
              <option value="2">1-2 personas</option>
              <option value="4">3-4 personas</option>
              <option value="6+">5+ personas</option>
            </select>
          </div>
        </div>
        
        {/* Grid de mesas */}
        {mesasParaMostrar.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hay mesas que coincidan con los filtros</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mesasParaMostrar.map((mesa) => (
              <TableCard key={mesa.id} mesa={mesa} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Tarjeta de estadística
 * @param {Object} props - Props del componente
 * @param {string} props.label - Etiqueta
 * @param {string|number} props.value - Valor
 * @param {string} props.color - Clases de color
 * @returns {JSX.Element} Tarjeta de estadística
 */
function StatCard({ label, value, color }) {
  return (
    <div className={`p-4 rounded-lg ${color}`}>
      <p className="text-sm font-medium opacity-75">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

export default MesasTab;