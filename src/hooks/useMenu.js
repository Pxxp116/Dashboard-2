/**
 * @fileoverview Hook personalizado para gestión del menú
 * Maneja el estado y operaciones relacionadas con el menú del restaurante
 */

import { useState, useCallback } from 'react';
import menuService from '../services/api/menuService';

/**
 * Hook para gestionar el menú del restaurante
 * @returns {Object} Estado y funciones para manejar el menú
 */
export function useMenu() {
  const [menu, setMenu] = useState({ categorias: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [platoSeleccionado, setPlatoSeleccionado] = useState(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);

  /**
   * Carga el menú completo
   */
  const cargarMenu = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await menuService.obtenerMenu();
      
      if (response.exito) {
        setMenu(response.menu);
      }
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  }, []);

  /**
   * Crea un nuevo plato
   * @param {Object} datosPlato - Datos del plato
   * @returns {Promise<{exito: boolean, mensaje: string}>}
   */
  const crearPlato = useCallback(async (datosPlato) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await menuService.crearPlato(datosPlato);
      
      if (response.exito && response.plato) {
        // Añadir el plato a la categoría correspondiente
        setMenu(prev => ({
          ...prev,
          categorias: prev.categorias.map(cat => 
            cat.id === datosPlato.categoria_id
              ? { ...cat, platos: [...(cat.platos || []), response.plato] }
              : cat
          )
        }));
      }
      
      setLoading(false);
      return response;
    } catch (error) {
      setLoading(false);
      setError(error.message);
      return { exito: false, mensaje: error.message };
    }
  }, []);

  /**
   * Actualiza un plato existente
   * @param {number} platoId - ID del plato
   * @param {Object} cambios - Cambios a aplicar
   * @returns {Promise<{exito: boolean, mensaje: string}>}
   */
  const actualizarPlato = useCallback(async (platoId, cambios) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await menuService.actualizarPlato(platoId, cambios);
      
      if (response.exito && response.plato) {
        // Actualizar el plato en el menú
        setMenu(prev => ({
          ...prev,
          categorias: prev.categorias.map(cat => ({
            ...cat,
            platos: cat.platos?.map(plato => 
              plato.id === platoId ? response.plato : plato
            )
          }))
        }));
      }
      
      setLoading(false);
      return response;
    } catch (error) {
      setLoading(false);
      setError(error.message);
      return { exito: false, mensaje: error.message };
    }
  }, []);

  /**
   * Cambia la disponibilidad de un plato
   * @param {number} platoId - ID del plato
   * @param {boolean} disponible - Nueva disponibilidad
   * @returns {Promise<{exito: boolean, mensaje: string}>}
   */
  const cambiarDisponibilidadPlato = useCallback(async (platoId, disponible) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await menuService.cambiarDisponibilidadPlato(platoId, disponible);
      
      if (response.exito) {
        // Actualizar la disponibilidad en el estado local
        setMenu(prev => ({
          ...prev,
          categorias: prev.categorias.map(cat => ({
            ...cat,
            platos: cat.platos?.map(plato => 
              plato.id === platoId 
                ? { ...plato, disponible }
                : plato
            )
          }))
        }));
      }
      
      setLoading(false);
      return response;
    } catch (error) {
      setLoading(false);
      setError(error.message);
      return { exito: false, mensaje: error.message };
    }
  }, []);

  /**
   * Elimina un plato
   * @param {number} platoId - ID del plato
   * @returns {Promise<{exito: boolean, mensaje: string}>}
   */
  const eliminarPlato = useCallback(async (platoId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await menuService.eliminarPlato(platoId);
      
      if (response.exito) {
        // Eliminar el plato del menú
        setMenu(prev => ({
          ...prev,
          categorias: prev.categorias.map(cat => ({
            ...cat,
            platos: cat.platos?.filter(plato => plato.id !== platoId)
          }))
        }));
      }
      
      setLoading(false);
      return response;
    } catch (error) {
      setLoading(false);
      setError(error.message);
      return { exito: false, mensaje: error.message };
    }
  }, []);

  /**
   * Crea una nueva categoría
   * @param {Object} datosCategoria - Datos de la categoría
   * @returns {Promise<{exito: boolean, mensaje: string}>}
   */
  const crearCategoria = useCallback(async (datosCategoria) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await menuService.crearCategoria(datosCategoria);
      
      if (response.exito && response.categoria) {
        // Añadir la nueva categoría
        setMenu(prev => ({
          ...prev,
          categorias: [...prev.categorias, { ...response.categoria, platos: [] }]
        }));
      }
      
      setLoading(false);
      return response;
    } catch (error) {
      setLoading(false);
      setError(error.message);
      return { exito: false, mensaje: error.message };
    }
  }, []);

  /**
   * Actualiza el menú completo
   * @param {Object} nuevoMenu - Nuevo menú
   */
  const actualizarMenu = useCallback((nuevoMenu) => {
    setMenu(nuevoMenu);
  }, []);

  /**
   * Selecciona un plato
   * @param {Object} plato - Plato a seleccionar
   */
  const seleccionarPlato = useCallback((plato) => {
    setPlatoSeleccionado(plato);
  }, []);

  /**
   * Selecciona una categoría
   * @param {Object} categoria - Categoría a seleccionar
   */
  const seleccionarCategoria = useCallback((categoria) => {
    setCategoriaSeleccionada(categoria);
  }, []);

  /**
   * Busca platos por término
   * @param {string} termino - Término de búsqueda
   * @returns {Array} Platos encontrados
   */
  const buscarPlatos = useCallback((termino) => {
    if (!termino) return [];
    
    const terminoLower = termino.toLowerCase();
    const platosEncontrados = [];
    
    menu.categorias?.forEach(categoria => {
      categoria.platos?.forEach(plato => {
        if (
          plato.nombre?.toLowerCase().includes(terminoLower) ||
          plato.descripcion?.toLowerCase().includes(terminoLower) ||
          plato.alergenos?.some(a => a.toLowerCase().includes(terminoLower))
        ) {
          platosEncontrados.push({
            ...plato,
            categoria: categoria.nombre
          });
        }
      });
    });
    
    return platosEncontrados;
  }, [menu]);

  /**
   * Obtiene estadísticas del menú
   * @returns {Object} Estadísticas
   */
  const obtenerEstadisticas = useCallback(() => {
    let totalPlatos = 0;
    let platosDisponibles = 0;
    let precioMinimo = Infinity;
    let precioMaximo = 0;
    let sumaPrecio = 0;
    
    menu.categorias?.forEach(categoria => {
      categoria.platos?.forEach(plato => {
        totalPlatos++;
        const precio = parseFloat(plato.precio) || 0;
        
        if (plato.disponible) platosDisponibles++;
        if (precio < precioMinimo) precioMinimo = precio;
        if (precio > precioMaximo) precioMaximo = precio;
        sumaPrecio += precio;
      });
    });
    
    return {
      totalCategorias: menu.categorias?.length || 0,
      totalPlatos,
      platosDisponibles,
      platosNoDisponibles: totalPlatos - platosDisponibles,
      precioMinimo: precioMinimo === Infinity ? 0 : precioMinimo,
      precioMaximo,
      precioPromedio: totalPlatos > 0 ? (sumaPrecio / totalPlatos).toFixed(2) : 0
    };
  }, [menu]);

  /**
   * Limpia el error actual
   */
  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Estado
    menu,
    loading,
    error,
    platoSeleccionado,
    categoriaSeleccionada,
    
    // Acciones
    cargarMenu,
    crearPlato,
    actualizarPlato,
    cambiarDisponibilidadPlato,
    eliminarPlato,
    crearCategoria,
    actualizarMenu,
    seleccionarPlato,
    seleccionarCategoria,
    limpiarError,
    
    // Utilidades
    buscarPlatos,
    obtenerEstadisticas
  };
}

export default useMenu;