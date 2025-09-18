import { getApiConfig } from '../../config/features';

const apiConfig = getApiConfig();
const API_URL = apiConfig.BASE_URL;

class OrderService {
  /**
   * Obtener todos los pedidos con filtros opcionales
   * @param {string} fecha - Fecha en formato YYYY-MM-DD (opcional)
   * @param {string} estado - Estado del pedido (pendiente, en_preparacion, entregado, cancelado)
   * @returns {Promise<Object>} Lista de pedidos
   */
  async obtenerPedidos(fecha = null, estado = null) {
    try {
      let url = `${API_URL}/admin/pedidos`;
      const params = new URLSearchParams();

      if (fecha) {
        params.append('fecha', fecha);
      }

      if (estado) {
        params.append('estado', estado);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo pedidos:', error);
      throw error;
    }
  }

  /**
   * Obtener un pedido específico por su ID único
   * @param {string} idUnicoPedido - ID único del pedido
   * @returns {Promise<Object>} Datos del pedido
   */
  async obtenerPedido(idUnicoPedido) {
    try {
      const response = await fetch(`${API_URL}/pedidos/${idUnicoPedido}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo pedido:', error);
      throw error;
    }
  }

  /**
   * Crear un nuevo pedido
   * @param {Object} datosPedido - Datos del pedido a crear
   * @returns {Promise<Object>} Pedido creado
   */
  async crearPedido(datosPedido) {
    try {
      const response = await fetch(`${API_URL}/crear-pedido`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...datosPedido,
          origen: 'dashboard' // Indicar que se creó desde el dashboard
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creando pedido:', error);
      throw error;
    }
  }

  /**
   * Actualizar el estado de un pedido
   * @param {number} pedidoId - ID del pedido
   * @param {string} nuevoEstado - Nuevo estado (pendiente, en_preparacion, entregado, cancelado)
   * @returns {Promise<Object>} Pedido actualizado
   */
  async actualizarEstadoPedido(pedidoId, nuevoEstado) {
    try {
      const response = await fetch(`${API_URL}/admin/pedidos/${pedidoId}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          estado: nuevoEstado
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error actualizando estado del pedido:', error);
      throw error;
    }
  }

  /**
   * Cancelar un pedido
   * @param {number} pedidoId - ID del pedido
   * @param {string} motivo - Motivo de la cancelación
   * @returns {Promise<Object>} Resultado de la cancelación
   */
  async cancelarPedido(pedidoId, motivo = 'Cancelado desde dashboard') {
    try {
      const response = await fetch(`${API_URL}/admin/pedidos/${pedidoId}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          estado: 'cancelado',
          motivo_cancelacion: motivo
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error cancelando pedido:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de pedidos por fecha
   * @param {string} fechaInicio - Fecha de inicio (YYYY-MM-DD)
   * @param {string} fechaFin - Fecha de fin (YYYY-MM-DD)
   * @returns {Promise<Object>} Estadísticas de pedidos
   */
  async obtenerEstadisticas(fechaInicio, fechaFin) {
    try {
      const params = new URLSearchParams({
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin
      });

      const response = await fetch(`${API_URL}/admin/pedidos/estadisticas?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  /**
   * Buscar pedidos por cliente
   * @param {string} busqueda - Término de búsqueda (nombre o teléfono)
   * @returns {Promise<Object>} Lista de pedidos encontrados
   */
  async buscarPorCliente(busqueda) {
    try {
      const params = new URLSearchParams({
        cliente: busqueda
      });

      const response = await fetch(`${API_URL}/admin/pedidos/buscar?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error buscando pedidos:', error);
      throw error;
    }
  }

  /**
   * Actualizar tiempo estimado de entrega
   * @param {number} pedidoId - ID del pedido
   * @param {string} tiempoEstimado - Tiempo estimado en formato ISO
   * @returns {Promise<Object>} Pedido actualizado
   */
  async actualizarTiempoEntrega(pedidoId, tiempoEstimado) {
    try {
      const response = await fetch(`${API_URL}/admin/pedidos/${pedidoId}/tiempo-entrega`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hora_estimada_entrega: tiempoEstimado
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error actualizando tiempo de entrega:', error);
      throw error;
    }
  }
}

export const orderService = new OrderService();