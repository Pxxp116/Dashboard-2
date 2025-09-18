/**
 * @fileoverview Servicio para gestión de pagos fraccionados
 * Maneja la lógica de procesamiento, validación y seguimiento de pagos
 */

import {
  PAYMENT_STATUS,
  SPLIT_MODES,
  formatCurrency,
  validateSplitPaymentData
} from '../utils/tableQRGenerator';

/**
 * Configuración de la API
 */
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

/**
 * Configuración de métodos de pago disponibles
 */
export const PAYMENT_METHODS = {
  CARD: 'card',
  BIZUM: 'bizum',
  CASH: 'cash',
  PAYPAL: 'paypal'
};

/**
 * Configuración de gateways de pago
 */
const PAYMENT_GATEWAYS = {
  [PAYMENT_METHODS.CARD]: {
    name: 'Stripe',
    endpoint: '/payments/stripe',
    supportedCurrencies: ['EUR', 'USD'],
    fees: 0.029 // 2.9%
  },
  [PAYMENT_METHODS.BIZUM]: {
    name: 'Bizum',
    endpoint: '/payments/bizum',
    supportedCurrencies: ['EUR'],
    fees: 0.01 // 1%
  },
  [PAYMENT_METHODS.PAYPAL]: {
    name: 'PayPal',
    endpoint: '/payments/paypal',
    supportedCurrencies: ['EUR', 'USD'],
    fees: 0.034 // 3.4%
  }
};

/**
 * Clase de servicio para gestión de pagos
 */
class PaymentService {
  constructor() {
    this.activePayments = new Map(); // Cache de pagos activos
    this.paymentListeners = new Map(); // Listeners para eventos de pago
  }

  /**
   * Inicia un proceso de pago fraccionado para una mesa
   * @param {number} mesaId - ID de la mesa
   * @param {Object} paymentConfig - Configuración del pago
   * @returns {Promise<Object>} Datos del pago iniciado
   */
  async initiateSplitPayment(mesaId, paymentConfig) {
    try {
      const validation = validateSplitPaymentData(paymentConfig);
      if (!validation.valid) {
        throw new Error(`Configuración inválida: ${validation.errors.join(', ')}`);
      }

      const paymentData = {
        mesa_id: mesaId,
        session_id: this.generateSessionId(),
        total_amount: paymentConfig.totalAmount,
        split_mode: paymentConfig.splitMode,
        participants: paymentConfig.participants,
        items: paymentConfig.items || [],
        status: PAYMENT_STATUS.PENDING,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
        payments: [],
        metadata: {
          restaurant_id: paymentConfig.restaurantId,
          table_number: paymentConfig.tableNumber
        }
      };

      const response = await fetch(`${API_BASE_URL}/payments/split/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) throw new Error('Error al iniciar el pago');

      const result = await response.json();
      this.activePayments.set(mesaId, result);

      // Notificar a listeners
      this.notifyListeners('payment_initiated', result);

      return result;
    } catch (error) {
      console.error('Error initiating split payment:', error);
      throw error;
    }
  }

  /**
   * Procesa un pago individual de un participante
   * @param {string} sessionId - ID de la sesión de pago
   * @param {string} participantId - ID del participante
   * @param {Object} paymentData - Datos del pago
   * @returns {Promise<Object>} Resultado del pago
   */
  async processParticipantPayment(sessionId, participantId, paymentData) {
    try {
      const {
        amount,
        paymentMethod,
        paymentToken,
        customerInfo
      } = paymentData;

      // Validar método de pago
      if (!PAYMENT_GATEWAYS[paymentMethod]) {
        throw new Error('Método de pago no soportado');
      }

      const gateway = PAYMENT_GATEWAYS[paymentMethod];
      const fees = amount * gateway.fees;
      const finalAmount = amount + fees;

      const paymentRequest = {
        session_id: sessionId,
        participant_id: participantId,
        amount: finalAmount,
        original_amount: amount,
        fees,
        payment_method: paymentMethod,
        payment_token: paymentToken,
        customer_info: customerInfo,
        gateway: gateway.name,
        timestamp: new Date().toISOString()
      };

      const response = await fetch(`${API_BASE_URL}${gateway.endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentRequest)
      });

      if (!response.ok) throw new Error('Error al procesar el pago');

      const result = await response.json();

      // Actualizar estado del pago
      await this.updatePaymentStatus(sessionId, participantId, result);

      return result;
    } catch (error) {
      console.error('Error processing participant payment:', error);
      throw error;
    }
  }

  /**
   * Obtiene el estado actual de un pago fraccionado
   * @param {string} sessionId - ID de la sesión de pago
   * @returns {Promise<Object>} Estado del pago
   */
  async getPaymentStatus(sessionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/split/${sessionId}/status`);
      if (!response.ok) throw new Error('Error al obtener estado del pago');

      const status = await response.json();

      // Actualizar cache local
      if (status.mesa_id) {
        this.activePayments.set(status.mesa_id, status);
      }

      return status;
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }

  /**
   * Actualiza el estado de un participante en el pago
   * @param {string} sessionId - ID de la sesión
   * @param {string} participantId - ID del participante
   * @param {Object} paymentResult - Resultado del pago
   * @returns {Promise<Object>} Estado actualizado
   */
  async updatePaymentStatus(sessionId, participantId, paymentResult) {
    try {
      const updateData = {
        participant_id: participantId,
        payment_status: paymentResult.success ? 'completed' : 'failed',
        payment_id: paymentResult.payment_id,
        transaction_id: paymentResult.transaction_id,
        amount_paid: paymentResult.amount,
        timestamp: new Date().toISOString(),
        error_message: paymentResult.error_message || null
      };

      const response = await fetch(`${API_BASE_URL}/payments/split/${sessionId}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) throw new Error('Error al actualizar estado del pago');

      const updatedStatus = await response.json();

      // Notificar cambios
      this.notifyListeners('payment_updated', updatedStatus);

      // Verificar si el pago está completo
      if (updatedStatus.status === PAYMENT_STATUS.COMPLETED) {
        this.notifyListeners('payment_completed', updatedStatus);
      }

      return updatedStatus;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  /**
   * Cancela un pago fraccionado
   * @param {string} sessionId - ID de la sesión
   * @param {string} reason - Motivo de cancelación
   * @returns {Promise<boolean>} True si se canceló correctamente
   */
  async cancelSplitPayment(sessionId, reason = 'Usuario canceló') {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/split/${sessionId}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, timestamp: new Date().toISOString() })
      });

      if (!response.ok) throw new Error('Error al cancelar el pago');

      const result = await response.json();

      // Notificar cancelación
      this.notifyListeners('payment_cancelled', result);

      return true;
    } catch (error) {
      console.error('Error cancelling payment:', error);
      return false;
    }
  }

  /**
   * Envía recordatorio de pago a un participante
   * @param {string} sessionId - ID de la sesión
   * @param {string} participantId - ID del participante
   * @param {string} method - Método de recordatorio ('sms', 'email', 'push')
   * @returns {Promise<boolean>} True si se envió correctamente
   */
  async sendPaymentReminder(sessionId, participantId, method = 'sms') {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/split/${sessionId}/reminder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant_id: participantId,
          method,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Error al enviar recordatorio');

      this.notifyListeners('reminder_sent', { sessionId, participantId, method });

      return true;
    } catch (error) {
      console.error('Error sending payment reminder:', error);
      return false;
    }
  }

  /**
   * Reembolsa un pago específico
   * @param {string} paymentId - ID del pago
   * @param {number} amount - Monto a reembolsar (opcional, total por defecto)
   * @param {string} reason - Motivo del reembolso
   * @returns {Promise<Object>} Resultado del reembolso
   */
  async refundPayment(paymentId, amount = null, reason = 'Reembolso solicitado') {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          reason,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Error al procesar reembolso');

      const result = await response.json();

      this.notifyListeners('payment_refunded', result);

      return result;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }

  /**
   * Obtiene historial de pagos de una mesa
   * @param {number} mesaId - ID de la mesa
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Historial de pagos
   */
  async getPaymentHistory(mesaId, filters = {}) {
    try {
      const params = new URLSearchParams({
        mesa_id: mesaId,
        ...filters
      });

      const response = await fetch(`${API_BASE_URL}/payments/history?${params}`);
      if (!response.ok) throw new Error('Error al obtener historial');

      return await response.json();
    } catch (error) {
      console.error('Error getting payment history:', error);
      return [];
    }
  }

  /**
   * Calcula comisiones y fees para un pago
   * @param {number} amount - Monto base
   * @param {string} paymentMethod - Método de pago
   * @returns {Object} Desglose de fees
   */
  calculatePaymentFees(amount, paymentMethod) {
    const gateway = PAYMENT_GATEWAYS[paymentMethod];
    if (!gateway) {
      return { amount, fees: 0, total: amount };
    }

    const fees = Math.round(amount * gateway.fees * 100) / 100;
    const total = amount + fees;

    return {
      amount,
      fees,
      total,
      gateway: gateway.name,
      fee_percentage: gateway.fees * 100
    };
  }

  /**
   * Valida datos de tarjeta de crédito
   * @param {Object} cardData - Datos de la tarjeta
   * @returns {Object} Resultado de validación
   */
  validateCardData(cardData) {
    const { number, expiry, cvc, name } = cardData;
    const errors = [];

    // Validar número de tarjeta (algoritmo de Luhn simplificado)
    if (!number || number.replace(/\s/g, '').length < 13) {
      errors.push('Número de tarjeta inválido');
    }

    // Validar fecha de expiración
    if (!expiry || !expiry.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
      errors.push('Fecha de expiración inválida');
    }

    // Validar CVC
    if (!cvc || cvc.length < 3) {
      errors.push('CVC inválido');
    }

    // Validar nombre
    if (!name || name.trim().length < 2) {
      errors.push('Nombre inválido');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Genera un ID único para sesiones de pago
   * @returns {string} ID de sesión
   */
  generateSessionId() {
    return `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Configura listener para eventos de pago
   * @param {string} event - Tipo de evento
   * @param {Function} callback - Función callback
   */
  addEventListener(event, callback) {
    if (!this.paymentListeners.has(event)) {
      this.paymentListeners.set(event, []);
    }
    this.paymentListeners.get(event).push(callback);
  }

  /**
   * Remueve listener de eventos
   * @param {string} event - Tipo de evento
   * @param {Function} callback - Función callback
   */
  removeEventListener(event, callback) {
    if (this.paymentListeners.has(event)) {
      const listeners = this.paymentListeners.get(event);
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
    if (this.paymentListeners.has(event)) {
      this.paymentListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in payment event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Limpia cache de pagos
   */
  clearCache() {
    this.activePayments.clear();
  }

  /**
   * Obtiene estadísticas de pagos
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Object>} Estadísticas
   */
  async getPaymentStats(filters = {}) {
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`${API_BASE_URL}/payments/stats?${params}`);
      if (!response.ok) throw new Error('Error al obtener estadísticas');

      return await response.json();
    } catch (error) {
      console.error('Error getting payment stats:', error);
      return {
        total_payments: 0,
        total_amount: 0,
        average_amount: 0,
        success_rate: 0,
        top_payment_method: null
      };
    }
  }
}

// Crear instancia singleton
const paymentService = new PaymentService();

export default paymentService;
export { PAYMENT_METHODS, PAYMENT_GATEWAYS };