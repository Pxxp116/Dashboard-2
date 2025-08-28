/**
 * @fileoverview Servicio para gestionar operaciones del menú
 * Encapsula la lógica de comunicación con la API para platos y categorías
 */

import apiClient from './apiClient';

/**
 * Servicio de gestión del menú
 */
class MenuService {
  /**
   * Obtiene el menú completo con categorías y platos
   * @returns {Promise<{exito: boolean, menu: Object}>}
   */
  async obtenerMenu() {
    try {
      const response = await apiClient.get('/menu');
      return response;
    } catch (error) {
      console.error('Error obteniendo menú:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo plato
   * @param {Object} platoData - Datos del plato
   * @param {number} platoData.categoria_id - ID de la categoría
   * @param {string} platoData.nombre - Nombre del plato
   * @param {string} platoData.descripcion - Descripción del plato
   * @param {number|string} platoData.precio - Precio del plato
   * @param {boolean} platoData.disponible - Disponibilidad inicial
   * @param {string[]} [platoData.alergenos] - Lista de alérgenos
   * @returns {Promise<{exito: boolean, mensaje: string, plato?: Object}>}
   */
  async crearPlato(platoData) {
    try {
      // Asegurar que el precio sea un número
      const dataConPrecioNumerico = {
        ...platoData,
        precio: parseFloat(platoData.precio)
      };
      
      const response = await apiClient.post('/admin/menu/plato', dataConPrecioNumerico);
      return response;
    } catch (error) {
      console.error('Error creando plato:', error);
      throw error;
    }
  }

  /**
   * Actualiza un plato existente
   * @param {number} platoId - ID del plato
   * @param {Object} cambios - Cambios a aplicar
   * @returns {Promise<{exito: boolean, mensaje: string, plato?: Object}>}
   */
  async actualizarPlato(platoId, cambios) {
    try {
      // Si hay precio en los cambios, asegurar que sea número
      if (cambios.precio !== undefined) {
        cambios.precio = parseFloat(cambios.precio);
      }
      
      const response = await apiClient.patch(`/admin/menu/plato/${platoId}`, cambios);
      return response;
    } catch (error) {
      console.error('Error actualizando plato:', error);
      throw error;
    }
  }

  /**
   * Cambia la disponibilidad de un plato
   * @param {number} platoId - ID del plato
   * @param {boolean} disponible - Nueva disponibilidad
   * @returns {Promise<{exito: boolean, mensaje: string}>}
   */
  async cambiarDisponibilidadPlato(platoId, disponible) {
    try {
      const response = await apiClient.patch(
        `/admin/menu/plato/${platoId}/disponibilidad`,
        { disponible }
      );
      return response;
    } catch (error) {
      console.error('Error cambiando disponibilidad del plato:', error);
      throw error;
    }
  }

  /**
   * Elimina un plato
   * @param {number} platoId - ID del plato a eliminar
   * @returns {Promise<{exito: boolean, mensaje: string}>}
   */
  async eliminarPlato(platoId) {
    try {
      const response = await apiClient.delete(`/admin/menu/plato/${platoId}`);
      return response;
    } catch (error) {
      console.error('Error eliminando plato:', error);
      throw error;
    }
  }

  /**
   * Crea una nueva categoría
   * @param {Object} categoriaData - Datos de la categoría
   * @param {string} categoriaData.nombre - Nombre de la categoría
   * @param {number} [categoriaData.orden] - Orden de visualización
   * @returns {Promise<{exito: boolean, mensaje: string, categoria?: Object}>}
   */
  async crearCategoria(categoriaData) {
    try {
      const response = await apiClient.post('/admin/menu/categoria', categoriaData);
      return response;
    } catch (error) {
      console.error('Error creando categoría:', error);
      throw error;
    }
  }

  /**
   * Actualiza una categoría existente
   * @param {number} categoriaId - ID de la categoría
   * @param {Object} cambios - Cambios a aplicar
   * @returns {Promise<{exito: boolean, mensaje: string, categoria?: Object}>}
   */
  async actualizarCategoria(categoriaId, cambios) {
    try {
      const response = await apiClient.patch(`/admin/menu/categoria/${categoriaId}`, cambios);
      return response;
    } catch (error) {
      console.error('Error actualizando categoría:', error);
      throw error;
    }
  }

  /**
   * Elimina una categoría
   * @param {number} categoriaId - ID de la categoría
   * @param {boolean} [forzar=false] - Si true, elimina también los platos asociados
   * @returns {Promise<{exito: boolean, mensaje: string, platosEliminados?: number}>}
   */
  async eliminarCategoria(categoriaId, forzar = false) {
    try {
      const queryParams = forzar ? '?forzar=true' : '';
      const response = await apiClient.delete(`/admin/menu/categoria/${categoriaId}${queryParams}`);
      return response;
    } catch (error) {
      console.error('Error eliminando categoría:', error);
      throw error;
    }
  }

  /**
   * Verifica si existe una categoría con el mismo nombre
   * @param {string} nombre - Nombre de la categoría a verificar
   * @param {number} [excludeId] - ID de categoría a excluir (para edición)
   * @returns {Promise<{exito: boolean, existe: boolean}>}
   */
  async verificarCategoriaDuplicada(nombre, excludeId = null) {
    try {
      // Esta funcionalidad se maneja en el servidor al crear/actualizar
      // Por ahora retornamos siempre false y dejamos que el servidor valide
      return { exito: true, existe: false };
    } catch (error) {
      console.error('Error verificando categoría duplicada:', error);
      throw error;
    }
  }

  /**
   * Obtiene información detallada de una categoría
   * @param {number} categoriaId - ID de la categoría
   * @returns {Promise<{exito: boolean, categoria: Object}>}
   */
  async obtenerCategoria(categoriaId) {
    try {
      const response = await apiClient.get(`/admin/menu/categoria/${categoriaId}`);
      return response;
    } catch (error) {
      console.error('Error obteniendo categoría:', error);
      throw error;
    }
  }

  /**
   * Actualiza los alérgenos de un plato
   * @param {number} platoId - ID del plato
   * @param {string[]} alergenos - Lista de alérgenos
   * @returns {Promise<{exito: boolean, mensaje: string}>}
   */
  async actualizarAlergenos(platoId, alergenos) {
    try {
      const response = await apiClient.patch(
        `/admin/menu/plato/${platoId}/alergenos`,
        { alergenos }
      );
      return response;
    } catch (error) {
      console.error('Error actualizando alérgenos:', error);
      throw error;
    }
  }

  /**
   * Reordena las categorías del menú
   * @param {Array<{id: number, orden: number}>} ordenCategorias - Nuevo orden
   * @returns {Promise<{exito: boolean, mensaje: string}>}
   */
  async reordenarCategorias(ordenCategorias) {
    try {
      const response = await apiClient.post('/admin/menu/reordenar-categorias', {
        categorias: ordenCategorias
      });
      return response;
    } catch (error) {
      console.error('Error reordenando categorías:', error);
      throw error;
    }
  }

  /**
   * Obtiene el menú del día (platos especiales)
   * @param {string} [fecha] - Fecha específica (por defecto hoy)
   * @returns {Promise<{exito: boolean, menu_del_dia: Array}>}
   */
  async obtenerMenuDelDia(fecha) {
    try {
      const params = fecha ? { fecha } : {};
      const response = await apiClient.get('/menu-del-dia', params);
      return response;
    } catch (error) {
      console.error('Error obteniendo menú del día:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
const menuService = new MenuService();
export default menuService;