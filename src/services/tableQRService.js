/**
 * @fileoverview Servicio para gestión de códigos QR de mesas con funcionalidad de pago fraccionado
 * Maneja la lógica de negocio y comunicación con el backend
 */

import {
  generateTableQR,
  generateMultipleTableQRs,
  updateTablePaymentStatus,
  PAYMENT_STATUS,
  calculateTablePaymentStats,
  exportPaymentDataToCSV
} from '../utils/tableQRGenerator';

/**
 * Configuración de la API
 */
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

/**
 * Clase de servicio para gestión de QR de mesas
 */
class TableQRService {
  constructor() {
    this.tableQRs = new Map(); // Cache local de QRs de mesa
    this.eventListeners = new Map(); // Listeners para cambios en tiempo real
  }

  /**
   * Obtiene todos los QRs de mesa
   * @returns {Promise<Array>} Array de QRs de mesa
   */
  async getAllTableQRs() {
    try {
      const response = await fetch(`${API_BASE_URL}/table-qr`);
      if (!response.ok) throw new Error('Error al obtener QRs de mesa');

      const data = await response.json();

      // Actualizar cache local
      data.forEach(qr => this.tableQRs.set(qr.mesa_id, qr));

      return data;
    } catch (error) {
      console.error('Error fetching table QRs:', error);
      // Retornar datos del cache si hay error de red
      return Array.from(this.tableQRs.values());
    }
  }

  /**
   * Obtiene QR específico de una mesa
   * @param {number} mesaId - ID de la mesa
   * @returns {Promise<Object|null>} QR de mesa o null si no existe
   */
  async getTableQR(mesaId) {
    try {
      // Primero verificar cache local
      if (this.tableQRs.has(mesaId)) {
        return this.tableQRs.get(mesaId);
      }

      const response = await fetch(`${API_BASE_URL}/table-qr/${mesaId}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Error al obtener QR de mesa');
      }

      const qr = await response.json();
      this.tableQRs.set(mesaId, qr);

      return qr;
    } catch (error) {
      console.error(`Error fetching table QR for mesa ${mesaId}:`, error);
      return this.tableQRs.get(mesaId) || null;
    }
  }

  /**
   * Crea QR para una mesa específica
   * @param {Object} mesa - Objeto mesa
   * @param {Object} config - Configuración adicional
   * @returns {Promise<Object>} QR creado
   */
  async createTableQR(mesa, config = {}) {
    try {
      const qrData = generateTableQR(mesa, config);

      const response = await fetch(`${API_BASE_URL}/table-qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(qrData)
      });

      if (!response.ok) throw new Error('Error al crear QR de mesa');

      const createdQR = await response.json();
      this.tableQRs.set(mesa.id, createdQR);

      // Notificar a listeners
      this.notifyListeners('qr_created', createdQR);

      return createdQR;
    } catch (error) {
      console.error('Error creating table QR:', error);
      // En caso de error, devolver QR generado localmente
      const localQR = generateTableQR(mesa, config);
      this.tableQRs.set(mesa.id, localQR);
      return localQR;
    }
  }

  /**
   * Crea QRs para múltiples mesas
   * @param {Array} mesas - Array de mesas
   * @param {Object} config - Configuración base
   * @returns {Promise<Array>} Array de QRs creados
   */
  async createMultipleTableQRs(mesas, config = {}) {
    try {
      const qrsData = generateMultipleTableQRs(mesas, config);

      const response = await fetch(`${API_BASE_URL}/table-qr/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrs: qrsData })
      });

      if (!response.ok) throw new Error('Error al crear QRs de mesas');

      const createdQRs = await response.json();

      // Actualizar cache
      createdQRs.forEach(qr => this.tableQRs.set(qr.mesa_id, qr));

      // Notificar a listeners
      this.notifyListeners('qrs_created', createdQRs);

      return createdQRs;
    } catch (error) {
      console.error('Error creating multiple table QRs:', error);
      // En caso de error, devolver QRs generados localmente
      const localQRs = generateMultipleTableQRs(mesas, config);
      localQRs.forEach(qr => this.tableQRs.set(qr.mesa_id, qr));
      return localQRs;
    }
  }

  /**
   * Actualiza el estado de pago de una mesa
   * @param {number} mesaId - ID de la mesa
   * @param {Object} paymentData - Datos de pago
   * @returns {Promise<Object>} QR actualizado
   */
  async updatePaymentStatus(mesaId, paymentData) {
    try {
      const currentQR = await this.getTableQR(mesaId);
      if (!currentQR) throw new Error('QR de mesa no encontrado');

      const updatedQR = updateTablePaymentStatus(currentQR, paymentData);

      const response = await fetch(`${API_BASE_URL}/table-qr/${mesaId}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) throw new Error('Error al actualizar estado de pago');

      const savedQR = await response.json();
      this.tableQRs.set(mesaId, savedQR);

      // Notificar a listeners
      this.notifyListeners('payment_updated', savedQR);

      return savedQR;
    } catch (error) {
      console.error('Error updating payment status:', error);
      // En caso de error, actualizar solo localmente
      const currentQR = this.tableQRs.get(mesaId);
      if (currentQR) {
        const updatedQR = updateTablePaymentStatus(currentQR, paymentData);
        this.tableQRs.set(mesaId, updatedQR);
        return updatedQR;
      }
      throw error;
    }
  }

  /**
   * Regenera QR para una mesa
   * @param {number} mesaId - ID de la mesa
   * @param {Object} mesa - Objeto mesa actualizado
   * @returns {Promise<Object>} Nuevo QR generado
   */
  async regenerateTableQR(mesaId, mesa) {
    try {
      const response = await fetch(`${API_BASE_URL}/table-qr/${mesaId}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mesa })
      });

      if (!response.ok) throw new Error('Error al regenerar QR');

      const newQR = await response.json();
      this.tableQRs.set(mesaId, newQR);

      // Notificar a listeners
      this.notifyListeners('qr_regenerated', newQR);

      return newQR;
    } catch (error) {
      console.error('Error regenerating table QR:', error);
      // Generar nuevo QR localmente
      const newQR = generateTableQR(mesa);
      this.tableQRs.set(mesaId, newQR);
      return newQR;
    }
  }

  /**
   * Elimina QR de una mesa
   * @param {number} mesaId - ID de la mesa
   * @returns {Promise<boolean>} True si se eliminó correctamente
   */
  async deleteTableQR(mesaId) {
    try {
      const response = await fetch(`${API_BASE_URL}/table-qr/${mesaId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Error al eliminar QR');

      this.tableQRs.delete(mesaId);

      // Notificar a listeners
      this.notifyListeners('qr_deleted', { mesaId });

      return true;
    } catch (error) {
      console.error('Error deleting table QR:', error);
      // Eliminar del cache local de todos modos
      this.tableQRs.delete(mesaId);
      return false;
    }
  }

  /**
   * Obtiene estadísticas de pagos de mesas
   * @returns {Promise<Object>} Estadísticas calculadas
   */
  async getPaymentStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/table-qr/stats`);
      if (!response.ok) throw new Error('Error al obtener estadísticas');

      return await response.json();
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      // Calcular estadísticas localmente
      const localQRs = Array.from(this.tableQRs.values());
      return calculateTablePaymentStats(localQRs);
    }
  }

  /**
   * Exporta datos de pagos
   * @param {string} format - Formato de exportación ('csv', 'json')
   * @returns {Promise<string>} Datos exportados
   */
  async exportPaymentData(format = 'csv') {
    try {
      const response = await fetch(`${API_BASE_URL}/table-qr/export?format=${format}`);
      if (!response.ok) throw new Error('Error al exportar datos');

      if (format === 'csv') {
        return await response.text();
      } else {
        return await response.json();
      }
    } catch (error) {
      console.error('Error exporting payment data:', error);
      // Exportar datos locales
      const localQRs = Array.from(this.tableQRs.values());
      if (format === 'csv') {
        return exportPaymentDataToCSV(localQRs);
      } else {
        return localQRs;
      }
    }
  }

  /**
   * Registra escaneo de QR de mesa
   * @param {number} mesaId - ID de la mesa
   * @param {Object} scanData - Datos del escaneo
   * @returns {Promise<Object>} QR actualizado
   */
  async registerScan(mesaId, scanData = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/table-qr/${mesaId}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          ...scanData
        })
      });

      if (!response.ok) throw new Error('Error al registrar escaneo');

      const updatedQR = await response.json();
      this.tableQRs.set(mesaId, updatedQR);

      // Notificar a listeners
      this.notifyListeners('qr_scanned', updatedQR);

      return updatedQR;
    } catch (error) {
      console.error('Error registering scan:', error);
      // Actualizar localmente
      const currentQR = this.tableQRs.get(mesaId);
      if (currentQR) {
        const updatedQR = {
          ...currentQR,
          scanCount: (currentQR.scanCount || 0) + 1,
          lastScanned: new Date().toISOString()
        };
        this.tableQRs.set(mesaId, updatedQR);
        return updatedQR;
      }
      throw error;
    }
  }

  /**
   * Busca QRs por criterios
   * @param {Object} criteria - Criterios de búsqueda
   * @returns {Promise<Array>} QRs que coinciden
   */
  async searchTableQRs(criteria = {}) {
    const {
      paymentStatus,
      mesaNumero,
      dateFrom,
      dateTo,
      minAmount,
      maxAmount
    } = criteria;

    const allQRs = Array.from(this.tableQRs.values());

    return allQRs.filter(qr => {
      if (paymentStatus && qr.paymentStatus !== paymentStatus) return false;
      if (mesaNumero && qr.mesa_numero !== mesaNumero) return false;
      if (dateFrom && new Date(qr.created) < new Date(dateFrom)) return false;
      if (dateTo && new Date(qr.created) > new Date(dateTo)) return false;
      if (minAmount && (qr.totalAmount || 0) < minAmount) return false;
      if (maxAmount && (qr.totalAmount || 0) > maxAmount) return false;

      return true;
    });
  }

  /**
   * Configura listener para eventos en tiempo real
   * @param {string} event - Tipo de evento
   * @param {Function} callback - Función callback
   */
  addEventListener(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  /**
   * Remueve listener de eventos
   * @param {string} event - Tipo de evento
   * @param {Function} callback - Función callback
   */
  removeEventListener(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Notifica a listeners sobre eventos
   * @param {string} event - Tipo de evento
   * @param {*} data - Datos del evento
   */
  notifyListeners(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Limpia cache local
   */
  clearCache() {
    this.tableQRs.clear();
  }

  /**
   * Sincroniza datos con el servidor
   */
  async syncWithServer() {
    try {
      await this.getAllTableQRs();
      return true;
    } catch (error) {
      console.error('Error syncing with server:', error);
      return false;
    }
  }
}

// Crear instancia singleton
const tableQRService = new TableQRService();

export default tableQRService;