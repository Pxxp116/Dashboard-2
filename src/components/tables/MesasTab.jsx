/**
 * @fileoverview Tab de gestión y visualización de mesas
 * Muestra el estado actual de todas las mesas del restaurante
 */

import React, { useState } from 'react';
import { Users, Filter, Plus, Edit, Trash2 } from 'lucide-react';
import TableCard from './TableCard';
import MesaModal from './MesaModal';
import HistorialMesaModal from './HistorialMesaModal';
import { ESTADOS_MESA } from '../../types';
import { useAppContext } from '../../context/AppContext';
import mirrorService from '../../services/api/mirrorService';
import { useMessage } from '../../hooks/useMessage';

/**
 * Tab de mesas del restaurante
 * @param {Object} props - Props del componente
 * @param {Array} props.mesas - Lista de mesas
 * @returns {JSX.Element} Componente MesasTab
 */
function MesasTab({ mesas }) {
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [filtroCapacidad, setFiltroCapacidad] = useState('todas');
  const [modalMesa, setModalMesa] = useState({ abierto: false, mesa: null, modo: 'crear' });
  const [modalHistorial, setModalHistorial] = useState({ abierto: false, mesa: null });
  
  const { actualizarDatosEspejo } = useAppContext();
  const { mostrarMensaje } = useMessage();

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

  const abrirModalCrear = () => {
    setModalMesa({ abierto: true, mesa: null, modo: 'crear' });
  };

  const abrirModalEditar = (mesa) => {
    setModalMesa({ abierto: true, mesa, modo: 'editar' });
  };

  const abrirHistorial = (mesa) => {
    setModalHistorial({ abierto: true, mesa });
  };

  const cerrarModales = () => {
    setModalMesa({ abierto: false, mesa: null, modo: 'crear' });
    setModalHistorial({ abierto: false, mesa: null });
  };

  const guardarMesa = async (datosMesa) => {
    try {
      let response;
      if (modalMesa.modo === 'crear') {
        response = await mirrorService.crearMesa(datosMesa);
      } else {
        response = await mirrorService.actualizarMesa(modalMesa.mesa.id, datosMesa);
      }
      
      if (response.exito) {
        mostrarMensaje(response.mensaje, 'success');
        await actualizarDatosEspejo();
        cerrarModales();
      } else {
        mostrarMensaje(response.mensaje || 'Error al guardar mesa', 'error');
      }
    } catch (error) {
      mostrarMensaje('Error al guardar mesa: ' + error.message, 'error');
    }
  };

  const eliminarMesa = async (mesaId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta mesa?')) {
      return;
    }
    
    try {
      const response = await mirrorService.eliminarMesa(mesaId);
      if (response.exito) {
        mostrarMensaje(response.mensaje, 'success');
        await actualizarDatosEspejo();
      } else {
        mostrarMensaje(response.mensaje || 'Error al eliminar mesa', 'error');
      }
    } catch (error) {
      mostrarMensaje('Error al eliminar mesa: ' + error.message, 'error');
    }
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
          
          <button
            onClick={abrirModalCrear}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Mesa</span>
          </button>
          
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
              <div key={mesa.id} className="relative group">
                <TableCard 
                  mesa={mesa} 
                  onDoubleClick={() => abrirHistorial(mesa)}
                  onClick={() => abrirHistorial(mesa)}
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      abrirModalEditar(mesa);
                    }}
                    className="bg-yellow-500 text-white p-1 rounded hover:bg-yellow-600 text-xs"
                    title="Editar mesa"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      eliminarMesa(mesa.id);
                    }}
                    className="bg-red-500 text-white p-1 rounded hover:bg-red-600 text-xs"
                    title="Eliminar mesa"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Modales */}
      <MesaModal
        abierto={modalMesa.abierto}
        mesa={modalMesa.mesa}
        modo={modalMesa.modo}
        onGuardar={guardarMesa}
        onCerrar={cerrarModales}
      />
      
      <HistorialMesaModal
        abierto={modalHistorial.abierto}
        mesa={modalHistorial.mesa}
        onCerrar={cerrarModales}
      />
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