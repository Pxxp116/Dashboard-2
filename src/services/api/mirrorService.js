/**
 * @fileoverview Servicio para gestionar el estado del sistema y archivo espejo
 * Maneja estadísticas, políticas y sincronización con el backend
 */

import apiClient from './apiClient';

/**
 * Servicio de gestión del sistema
 */
class SystemService {
  /**
   * Obtiene el estado actual del sistema
   * @returns {Promise<{exito: boolean, estadisticas: Object}>}
   */
  async obtenerEstadoSistema() {
    try {
      const response = await apiClient.get('/admin/estado-sistema');
      return response;
    } catch (error) {
      console.error('Error obteniendo estado del sistema:', error);
      throw error;
    }
  }

  /**
   * Obtiene el archivo espejo completo
   * @returns {Promise<{exito: boolean, datos: Object}>}
   */
  async obtenerArchivoEspejo() {
    try {
      const response = await apiClient.get('/espejo');
      return response;
    } catch (error) {
      console.error('Error obteniendo archivo espejo:', error);
      throw error;
    }
  }

  /**
   * Verifica si el archivo espejo está fresco (< 30 segundos)
   * @param {number} edadSegundos - Edad del archivo en segundos
   * @returns {boolean} True si está fresco
   */
  esArchivoEspejoFresco(edadSegundos) {
    return edadSegundos <= 30;
  }

  /**
   * Obtiene las políticas del restaurante
   * @returns {Promise<{exito: boolean, politicas: Object}>}
   */
  async obtenerPoliticas() {
    try {
      const response = await apiClient.get('/politicas');
      return response;
    } catch (error) {
      console.error('Error obteniendo políticas:', error);
      throw error;
    }
  }

  /**
   * Actualiza las políticas del restaurante
   * @param {Object} politicas - Nuevas políticas
   * @returns {Promise<{exito: boolean, mensaje: string}>}
   */
  async actualizarPoliticas(politicas) {
    try {
      const response = await apiClient.patch('/admin/politicas', politicas);
      return response;
    } catch (error) {
      console.error('Error actualizando políticas:', error);
      throw error;
    }
  }

  /**
   * Obtiene el estado de todas las mesas
   * @returns {Promise<{exito: boolean, mesas: Array}>}
   */
  async obtenerEstadoMesas() {
    try {
      const response = await apiClient.get('/mesas/estado');
      return response;
    } catch (error) {
      console.error('Error obteniendo estado de mesas:', error);
      throw error;
    }
  }

  /**
   * Actualiza el estado de una mesa
   * @param {number} mesaId - ID de la mesa
   * @param {string} estado - Nuevo estado (libre/ocupada)
   * @returns {Promise<{exito: boolean, mensaje: string}>}
   */
  async actualizarEstadoMesa(mesaId, estado) {
    try {
      const response = await apiClient.patch(`/admin/mesa/${mesaId}/estado`, { estado });
      return response;
    } catch (error) {
      console.error('Error actualizando estado de mesa:', error);
      throw error;
    }
  }

  /**
   * Crea una nueva mesa
   * @param {Object} mesaData - Datos de la mesa
   * @param {number} mesaData.numero_mesa - Número de la mesa
   * @param {number} mesaData.capacidad - Capacidad de personas
   * @param {string} [mesaData.zona] - Zona del restaurante
   * @returns {Promise<{exito: boolean, mensaje: string, mesa?: Object}>}
   */
  async crearMesa(mesaData) {
    try {
      const response = await apiClient.post('/admin/mesa', mesaData);
      return response;
    } catch (error) {
      console.error('Error creando mesa:', error);
      throw error;
    }
  }

  /**
   * Elimina una mesa
   * @param {number} mesaId - ID de la mesa
   * @returns {Promise<{exito: boolean, mensaje: string}>}
   */
  async eliminarMesa(mesaId) {
    try {
      const response = await apiClient.delete(`/admin/mesa/${mesaId}`);
      return response;
    } catch (error) {
      console.error('Error eliminando mesa:', error);
      throw error;
    }
  }

  /**
   * Obtiene las estadísticas del día
   * @param {string} [fecha] - Fecha específica (por defecto hoy)
   * @returns {Promise<{exito: boolean, estadisticas: Object}>}
   */
  async obtenerEstadisticasDia(fecha) {
    try {
      const params = fecha ? { fecha } : {};
      const response = await apiClient.get('/admin/estadisticas/dia', params);
      return response;
    } catch (error) {
      console.error('Error obteniendo estadísticas del día:', error);
      throw error;
    }
  }

  /**
   * Obtiene el historial de cambios recientes
   * @param {number} [limite=50] - Número de registros a obtener
   * @returns {Promise<{exito: boolean, historial: Array}>}
   */
  async obtenerHistorialCambios(limite = 50) {
    try {
      const response = await apiClient.get('/admin/historial', { limite });
      return response;
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      throw error;
    }
  }

  /**
   * Fuerza una actualización del archivo espejo
   * @returns {Promise<{exito: boolean, mensaje: string}>}
   */
  async forzarActualizacionEspejo() {
    try {
      const response = await apiClient.post('/admin/actualizar-espejo');
      return response;
    } catch (error) {
      console.error('Error forzando actualización:', error);
      throw error;
    }
  }

  /**
   * Verifica la salud del sistema
   * @returns {Promise<{exito: boolean, salud: Object}>}
   */
  async verificarSaludSistema() {
    try {
      const response = await apiClient.get('/health');
      return response;
    } catch (error) {
      console.error('Error verificando salud del sistema:', error);
      throw error;
    }
  }

  /**
   * Obtiene métricas de rendimiento
   * @returns {Promise<{exito: boolean, metricas: Object}>}
   */
  async obtenerMetricas() {
    try {
      const response = await apiClient.get('/admin/metricas');
      return response;
    } catch (error) {
      console.error('Error obteniendo métricas:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
const systemService = new SystemService();
export default systemService;