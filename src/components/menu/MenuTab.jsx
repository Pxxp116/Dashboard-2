/**
 * @fileoverview Tab de gestión del menú del restaurante
 * Permite visualizar y gestionar platos y categorías
 */

import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import MenuCategory from './MenuCategory';
import PlatoModal from './PlatoModal';
import { useAppContext } from '../../context/AppContext';
import { useMessage } from '../../hooks/useMessage';

/**
 * Tab de gestión del menú
 * @param {Object} props - Props del componente
 * @param {Object} props.menu - Datos del menú
 * @returns {JSX.Element} Componente MenuTab
 */
function MenuTab({ menu }) {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaExpandida, setCategoriaExpandida] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoModal, setModoModal] = useState('crear');
  const [platoSeleccionado, setPlatoSeleccionado] = useState(null);
  
  const { actualizarDatosEspejo } = useAppContext();
  const { mostrarMensaje } = useMessage();

  /**
   * Filtra los platos según la búsqueda
   * @param {Array} platos - Lista de platos
   * @returns {Array} Platos filtrados
   */
  const filtrarPlatos = (platos) => {
    if (!busqueda) return platos;
    
    const termino = busqueda.toLowerCase();
    return platos.filter(plato => 
      plato.nombre.toLowerCase().includes(termino) ||
      plato.descripcion?.toLowerCase().includes(termino) ||
      plato.alergenos?.some(a => a.toLowerCase().includes(termino))
    );
  };

  /**
   * Calcula estadísticas del menú
   * @returns {Object} Estadísticas
   */
  const calcularEstadisticas = () => {
    let totalPlatos = 0;
    let platosDisponibles = 0;
    let precioPromedio = 0;
    let sumaPrecio = 0;

    menu.categorias?.forEach(categoria => {
      categoria.platos?.forEach(plato => {
        totalPlatos++;
        if (plato.disponible) platosDisponibles++;
        sumaPrecio += parseFloat(plato.precio) || 0;
      });
    });

    if (totalPlatos > 0) {
      precioPromedio = (sumaPrecio / totalPlatos).toFixed(2);
    }

    return {
      totalPlatos,
      platosDisponibles,
      platosNoDisponibles: totalPlatos - platosDisponibles,
      precioPromedio,
      totalCategorias: menu.categorias?.length || 0
    };
  };

  /**
   * Maneja el toggle de categoría expandida
   * @param {number} categoriaId - ID de la categoría
   */
  const toggleCategoria = (categoriaId) => {
    setCategoriaExpandida(prev => prev === categoriaId ? null : categoriaId);
  };

  /**
   * Abre el modal para crear un nuevo plato
   */
  const abrirModalCrear = () => {
    setModoModal('crear');
    setPlatoSeleccionado(null);
    setModalAbierto(true);
  };

  /**
   * Abre el modal para editar un plato
   * @param {Object} plato - Plato a editar
   */
  const abrirModalEditar = (plato) => {
    setModoModal('editar');
    setPlatoSeleccionado(plato);
    setModalAbierto(true);
  };

  /**
   * Elimina un plato
   * @param {number} platoId - ID del plato a eliminar
   */
  const eliminarPlato = async (platoId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este plato?')) {
      return;
    }

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'https://backend-2-production-227a.up.railway.app/api';
      const response = await fetch(`${API_URL}/admin/menu/plato/${platoId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.exito) {
        mostrarMensaje('Plato eliminado correctamente', 'success');
        await actualizarDatosEspejo();
      } else {
        mostrarMensaje(data.mensaje || 'Error al eliminar plato', 'error');
      }
    } catch (error) {
      console.error('Error eliminando plato:', error);
      mostrarMensaje('Error al eliminar plato: ' + error.message, 'error');
    }
  };

  /**
   * Cambia la disponibilidad de un plato
   * @param {number} platoId - ID del plato
   * @param {boolean} disponibleActual - Estado actual de disponibilidad
   */
  const toggleDisponibilidad = async (platoId, disponibleActual) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'https://backend-2-production-227a.up.railway.app/api';
      const response = await fetch(`${API_URL}/admin/menu/plato/${platoId}/disponibilidad`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disponible: !disponibleActual })
      });

      const data = await response.json();

      if (data.exito) {
        mostrarMensaje(
          `Plato marcado como ${!disponibleActual ? 'disponible' : 'no disponible'}`,
          'success'
        );
        await actualizarDatosEspejo();
      } else {
        mostrarMensaje(data.mensaje || 'Error al cambiar disponibilidad', 'error');
      }
    } catch (error) {
      console.error('Error cambiando disponibilidad:', error);
      mostrarMensaje('Error al cambiar disponibilidad: ' + error.message, 'error');
    }
  };

  /**
   * Maneja el guardado del modal
   */
  const manejarGuardadoModal = async () => {
    await actualizarDatosEspejo();
    setModalAbierto(false);
  };

  const stats = calcularEstadisticas();

  return (
    <div className="space-y-6">
      {/* Estadísticas del menú */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Resumen del Menú</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Categorías" value={stats.totalCategorias} />
          <StatCard label="Total Platos" value={stats.totalPlatos} />
          <StatCard label="Disponibles" value={stats.platosDisponibles} color="text-green-600" />
          <StatCard label="No Disponibles" value={stats.platosNoDisponibles} color="text-red-600" />
          <StatCard label="Precio Promedio" value={`${stats.precioPromedio}€`} />
        </div>
      </div>

      {/* Gestión del menú */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Gestión del Menú</h2>
          
          <div className="flex items-center space-x-4">
            {/* Barra de búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar plato..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            {/* Botón nuevo plato */}
            <button
              onClick={abrirModalCrear}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Plato
            </button>
          </div>
        </div>
        
        {/* Categorías y platos */}
        {menu.categorias?.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No hay categorías en el menú</p>
          </div>
        ) : (
          <div className="space-y-6">
            {menu.categorias?.map((categoria) => (
              <MenuCategory
                key={categoria.id}
                categoria={{
                  ...categoria,
                  platos: filtrarPlatos(categoria.platos || [])
                }}
                onToggleDisponibilidad={toggleDisponibilidad}
                onEditarPlato={abrirModalEditar}
                onEliminarPlato={eliminarPlato}
                expandida={categoriaExpandida === categoria.id}
                onToggleExpand={() => toggleCategoria(categoria.id)}
                mostrarVacio={!busqueda}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de plato */}
      <PlatoModal
        abierto={modalAbierto}
        modo={modoModal}
        plato={platoSeleccionado}
        categorias={menu.categorias || []}
        onCerrar={() => setModalAbierto(false)}
        onGuardar={manejarGuardadoModal}
      />
    </div>
  );
}

/**
 * Tarjeta de estadística
 * @param {Object} props - Props del componente
 * @param {string} props.label - Etiqueta
 * @param {string|number} props.value - Valor
 * @param {string} [props.color] - Color del texto
 * @returns {JSX.Element} Tarjeta de estadística
 */
function StatCard({ label, value, color = 'text-gray-900' }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default MenuTab;