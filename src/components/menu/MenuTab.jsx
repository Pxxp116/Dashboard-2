/**
 * @fileoverview Tab de gestión del menú del restaurante
 * Permite visualizar y gestionar platos y categorías
 */

import React, { useState } from 'react';
import { Plus, Search, FolderPlus } from 'lucide-react';
import MenuCategory from './MenuCategory';
import PlatoModal from './PlatoModal';
import CategoriaModal from './CategoriaModal';
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
  const [categoriaSeleccionadaParaPlato, setCategoriaSeleccionadaParaPlato] = useState(null);
  
  // Estados para el modal de categorías
  const [modalCategoriaAbierto, setModalCategoriaAbierto] = useState(false);
  const [modoCategoriaModal, setModoCategoriaModal] = useState('crear');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  
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
   * @param {Object} categoria - Categoría seleccionada (opcional)
   */
  const abrirModalCrear = (categoria = null) => {
    console.log('🔄 MenuTab: Abriendo modal crear', { categoria: categoria?.nombre, categoriaId: categoria?.id });
    setModoModal('crear');
    setPlatoSeleccionado(null);
    setCategoriaSeleccionadaParaPlato(categoria);
    
    // Si se proporciona una categoría, expandir la categoría si no está expandida
    if (categoria) {
      if (categoriaExpandida !== categoria.id) {
        setCategoriaExpandida(categoria.id);
      }
    }
    
    setModalAbierto(true);
  };

  /**
   * Maneja la creación de plato desde una categoría específica
   * @param {Object} categoria - Categoría donde crear el plato
   */
  const manejarAñadirPlatoCategoria = (categoria) => {
    abrirModalCrear(categoria);
  };

  /**
   * Abre el modal para editar un plato
   * @param {Object} plato - Plato a editar
   */
  const abrirModalEditar = (plato) => {
    setModoModal('editar');
    setPlatoSeleccionado(plato);
    setCategoriaSeleccionadaParaPlato(null); // No preseleccionar categoría al editar
    setModalAbierto(true);
  };

  /**
   * Maneja el cierre del modal de platos
   */
  const manejarCierreModal = () => {
    console.log('🔄 MenuTab: Cerrando modal de platos');
    setModalAbierto(false);
    setCategoriaSeleccionadaParaPlato(null);
    setPlatoSeleccionado(null);
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

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

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

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

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
   * Maneja el guardado del modal de platos
   * @param {Object} platoCreado - Datos del plato creado/editado
   */
  const manejarGuardadoModal = async (platoCreado = null) => {
    console.log('✅ MenuTab: Guardado exitoso', { modo: modoModal, platoCreado });
    
    await actualizarDatosEspejo();
    
    // Si se creó un plato nuevo, expandir su categoría
    if (modoModal === 'crear' && platoCreado && platoCreado.categoria_id) {
      console.log('📂 Expandiendo categoría:', platoCreado.categoria_id);
      setCategoriaExpandida(platoCreado.categoria_id);
    }
    
    // Resetear estados
    setModalAbierto(false);
    setCategoriaSeleccionadaParaPlato(null);
    setPlatoSeleccionado(null);
  };

  /**
   * Abre el modal para crear una nueva categoría
   */
  const abrirModalCrearCategoria = () => {
    setModoCategoriaModal('crear');
    setCategoriaSeleccionada(null);
    setModalCategoriaAbierto(true);
  };

  /**
   * Abre el modal para editar una categoría
   * @param {Object} categoria - Categoría a editar
   */
  const abrirModalEditarCategoria = (categoria) => {
    setModoCategoriaModal('editar');
    setCategoriaSeleccionada(categoria);
    setModalCategoriaAbierto(true);
  };

  /**
   * Elimina una categoría con confirmación
   * @param {Object} categoria - Categoría a eliminar
   */
  const eliminarCategoria = async (categoria) => {
    // Contar platos en la categoría
    const totalPlatos = categoria.platos?.length || 0;
    
    let confirmacion;
    if (totalPlatos > 0) {
      confirmacion = window.confirm(
        `¿Estás seguro de que quieres eliminar la categoría "${categoria.nombre}"?\n\n` +
        `Esta categoría contiene ${totalPlatos} plato${totalPlatos > 1 ? 's' : ''}.\n` +
        `Si continúas, se eliminarán también todos los platos de esta categoría.\n\n` +
        `Esta acción no se puede deshacer.`
      );
    } else {
      confirmacion = window.confirm(
        `¿Estás seguro de que quieres eliminar la categoría "${categoria.nombre}"?`
      );
    }
    
    if (!confirmacion) return;

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'https://backend-2-production-227a.up.railway.app/api';
      const queryParams = totalPlatos > 0 ? '?forzar=true' : '';
      
      const response = await fetch(`${API_URL}/admin/menu/categoria/${categoria.id}${queryParams}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.exito) {
        mostrarMensaje(data.mensaje || 'Categoría eliminada correctamente', 'success');
        await actualizarDatosEspejo();
        
        // Si la categoría eliminada estaba expandida, contraer
        if (categoriaExpandida === categoria.id) {
          setCategoriaExpandida(null);
        }
      } else {
        // Si el servidor requiere confirmación adicional
        if (data.requiereForzar) {
          const forzarConfirmacion = window.confirm(
            `${data.mensaje}\n\n¿Deseas eliminar la categoría y todos sus platos?`
          );
          
          if (forzarConfirmacion) {
            // Intentar de nuevo con forzar=true
            const response2 = await fetch(`${API_URL}/admin/menu/categoria/${categoria.id}?forzar=true`, {
              method: 'DELETE'
            });
            const data2 = await response2.json();
            
            if (data2.exito) {
              mostrarMensaje(data2.mensaje || 'Categoría eliminada correctamente', 'success');
              await actualizarDatosEspejo();
            } else {
              mostrarMensaje(data2.mensaje || 'Error al eliminar categoría', 'error');
            }
          }
        } else {
          mostrarMensaje(data.mensaje || 'Error al eliminar categoría', 'error');
        }
      }
    } catch (error) {
      console.error('Error eliminando categoría:', error);
      mostrarMensaje('Error al eliminar categoría: ' + error.message, 'error');
    }
  };

  /**
   * Maneja el guardado del modal de categorías
   */
  const manejarGuardadoCategoriaModal = async () => {
    await actualizarDatosEspejo();
    setModalCategoriaAbierto(false);
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
            
            {/* Botón nueva categoría */}
            <button
              onClick={abrirModalCrearCategoria}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              Nueva Categoría
            </button>
            
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
                onEditarCategoria={abrirModalEditarCategoria}
                onEliminarCategoria={eliminarCategoria}
                onAñadirPlato={manejarAñadirPlatoCategoria}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de plato */}
      {modalAbierto && (
        <PlatoModal
          abierto={modalAbierto}
          modo={modoModal}
          plato={platoSeleccionado}
          categorias={menu.categorias || []}
          categoriaInicialId={categoriaSeleccionadaParaPlato?.id}
          onCerrar={manejarCierreModal}
          onGuardar={manejarGuardadoModal}
        />
      )}

      {/* Modal de categoría */}
      <CategoriaModal
        abierto={modalCategoriaAbierto}
        modo={modoCategoriaModal}
        categoria={categoriaSeleccionada}
        onCerrar={() => setModalCategoriaAbierto(false)}
        onGuardar={manejarGuardadoCategoriaModal}
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