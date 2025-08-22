/**
 * @fileoverview Servicio para gestionar operaciones de reservas
 * Encapsula toda la lógica de comunicación con la API para reservas
 */

import apiClient from './apiClient';

/**
 * Servicio de gestión de reservas
 */
class ReservationService {
  /**
   * Busca una mesa disponible para los parámetros dados
   * @param {Object} params - Parámetros de búsqueda
   * @param {string} params.fecha - Fecha de la reserva
   * @param {string} params.hora - Hora de la reserva
   * @param {number} params.personas - Número de personas
   * @returns {Promise<{exito: boolean, mesa_disponible: Object|null, mensaje: string}>}
   */
  async buscarMesaDisponible({ fecha, hora, personas }) {
    try {
      const response = await apiClient.post('/buscar-mesa', {
        fecha,
        hora,
        personas
      });
      return response;
    } catch (error) {
      console.error('Error buscando mesa disponible:', error);
      throw error;
    }
  }

  /**
   * Crea una nueva reserva
   * @param {Object} reservaData - Datos de la reserva
   * @param {string} reservaData.nombre - Nombre del cliente
   * @param {string} reservaData.telefono - Teléfono del cliente
   * @param {string} reservaData.fecha - Fecha de la reserva
   * @param {string} reservaData.hora - Hora de la reserva
   * @param {number} reservaData.personas - Número de personas
   * @param {number} reservaData.mesa_id - ID de la mesa asignada
   * @param {string} [reservaData.notas] - Notas adicionales
   * @returns {Promise<{exito: boolean, mensaje: string, reserva?: Object}>}
   */
  async crearReserva(reservaData) {
    try {
      // Asegurar que las reservas del dashboard se identifiquen correctamente
      const datosConOrigen = {
        ...reservaData,
        origen: reservaData.origen || 'dashboard'
      };
      const response = await apiClient.post('/crear-reserva', datosConOrigen);
      return response;
    } catch (error) {
      console.error('Error creando reserva:', error);
      throw error;
    }
  }

  /**
   * Crea una reserva completa (busca mesa y crea reserva)
   * @param {Object} datosReserva - Datos para crear la reserva
   * @returns {Promise<{exito: boolean, mensaje: string, reserva?: Object}>}
   */
  async crearReservaCompleta(datosReserva) {
    try {
      // Primero buscar mesa disponible
      const busquedaResponse = await this.buscarMesaDisponible({
        fecha: datosReserva.fecha,
        hora: datosReserva.hora,
        personas: datosReserva.personas
      });
      
      if (!busquedaResponse.exito || !busquedaResponse.mesa_disponible) {
        return {
          exito: false,
          mensaje: busquedaResponse.mensaje || 'No hay mesas disponibles para esa hora'
        };
      }
      
      // Crear la reserva con la mesa encontrada
      const reservaResponse = await this.crearReserva({
        ...datosReserva,
        mesa_id: busquedaResponse.mesa_disponible.id
      });
      
      return reservaResponse;
    } catch (error) {
      console.error('Error en proceso completo de reserva:', error);
      throw error;
    }
  }

  /**
   * Cancela una reserva existente
   * @param {number} reservaId - ID de la reserva a cancelar
   * @param {string} [motivo='Cancelado desde dashboard'] - Motivo de la cancelación
   * @returns {Promise<{exito: boolean, mensaje: string}>}
   */
  async cancelarReserva(reservaId, motivo = 'Cancelado desde dashboard') {
    try {
      const response = await apiClient.delete(`/cancelar-reserva/${reservaId}`, {
        motivo
      });
      return response;
    } catch (error) {
      console.error('Error cancelando reserva:', error);
      throw error;
    }
  }

  /**
   * Modifica una reserva existente
   * @param {number} reservaId - ID de la reserva
   * @param {Object} cambios - Cambios a aplicar
   * @returns {Promise<{exito: boolean, mensaje: string, reserva?: Object}>}
   */
  async modificarReserva(reservaId, cambios) {
    try {
      const response = await apiClient.patch(`/modificar-reserva/${reservaId}`, cambios);
      return response;
    } catch (error) {
      console.error('Error modificando reserva:', error);
      throw error;
    }
  }

  /**
   * Obtiene el detalle de una reserva específica
   * @param {number} reservaId - ID de la reserva
   * @returns {Promise<{exito: boolean, reserva?: Object}>}
   */
  async obtenerReserva(reservaId) {
    try {
      const response = await apiClient.get(`/reserva/${reservaId}`);
      return response;
    } catch (error) {
      console.error('Error obteniendo reserva:', error);
      throw error;
    }
  }

  /**
   * Obtiene las reservas de un día específico
   * @param {string} fecha - Fecha en formato YYYY-MM-DD
   * @returns {Promise<{exito: boolean, reservas: Array}>}
   */
  async obtenerReservasPorFecha(fecha) {
    try {
      const response = await apiClient.get('/reservas', { fecha });
      return response;
    } catch (error) {
      console.error('Error obteniendo reservas por fecha:', error);
      throw error;
    }
  }

  /**
   * Confirma una reserva pendiente
   * @param {number} reservaId - ID de la reserva
   * @returns {Promise<{exito: boolean, mensaje: string}>}
   */
  async confirmarReserva(reservaId) {
    try {
      const response = await apiClient.post(`/confirmar-reserva/${reservaId}`);
      return response;
    } catch (error) {
      console.error('Error confirmando reserva:', error);
      throw error;
    }
  }

  /**
   * Añade a un cliente a la lista de espera
   * @param {Object} datosEspera - Datos para la lista de espera
   * @returns {Promise<{exito: boolean, mensaje: string}>}
   */
  async añadirListaEspera(datosEspera) {
    try {
      const response = await apiClient.post('/lista-espera', datosEspera);
      return response;
    } catch (error) {
      console.error('Error añadiendo a lista de espera:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
const reservationService = new ReservationService();
export default reservationService;