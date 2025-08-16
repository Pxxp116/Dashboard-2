/**
 * @fileoverview Cliente HTTP base para todas las llamadas a la API
 * Maneja configuración común, headers, errores y reintentos
 */

import { API_CONFIG } from '../utils/constants';

/**
 * Clase para manejar errores de la API
 */
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Cliente HTTP base con configuración común
 */
class ApiClient {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
    this.retryDelay = API_CONFIG.RETRY_DELAY;
    
    // Log de configuración en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 API Client configurado:', {
        baseURL: this.baseURL,
        timeout: this.timeout
      });
    }
  }

  /**
   * Headers por defecto para todas las peticiones
   * @returns {Object} Headers
   */
  getDefaultHeaders() {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * Implementa lógica de reintento con backoff exponencial
   * @param {Function} fn - Función a ejecutar
   * @param {number} attempts - Intentos restantes
   * @returns {Promise<any>}
   */
  async withRetry(fn, attempts = this.retryAttempts) {
    try {
      return await fn();
    } catch (error) {
      if (attempts <= 1) throw error;
      
      // No reintentar en errores de cliente (4xx)
      if (error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      // Esperar antes de reintentar (backoff exponencial)
      const delay = this.retryDelay * Math.pow(2, this.retryAttempts - attempts);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return this.withRetry(fn, attempts - 1);
    }
  }

  /**
   * Realiza una petición HTTP
   * @param {string} endpoint - Endpoint relativo a la base URL
   * @param {Object} options - Opciones de fetch
   * @returns {Promise<any>} Respuesta parseada
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Configurar timeout con AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    const config = {
      ...options,
      headers: {
        ...this.getDefaultHeaders(),
        ...options.headers
      },
      signal: controller.signal
    };

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      // Parsear respuesta
      const data = await this.parseResponse(response);
      
      // Manejar errores HTTP
      if (!response.ok) {
        throw new ApiError(
          data.mensaje || `Error HTTP ${response.status}`,
          response.status,
          data
        );
      }
      
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Manejar timeout
      if (error.name === 'AbortError') {
        throw new ApiError('Timeout de la petición', 0, null);
      }
      
      // Manejar errores de red
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new ApiError('Error de conexión', 0, null);
      }
      
      throw error;
    }
  }

  /**
   * Parsea la respuesta según el content-type
   * @param {Response} response - Respuesta de fetch
   * @returns {Promise<any>}
   */
  async parseResponse(response) {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    
    return response.text();
  }

  /**
   * GET request
   * @param {string} endpoint - Endpoint
   * @param {Object} params - Query parameters
   * @returns {Promise<any>}
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.withRetry(() => 
      this.request(url, { method: 'GET' })
    );
  }

  /**
   * POST request
   * @param {string} endpoint - Endpoint
   * @param {any} data - Body data
   * @returns {Promise<any>}
   */
  async post(endpoint, data) {
    return this.withRetry(() =>
      this.request(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
      })
    );
  }

  /**
   * PUT request
   * @param {string} endpoint - Endpoint
   * @param {any} data - Body data
   * @returns {Promise<any>}
   */
  async put(endpoint, data) {
    return this.withRetry(() =>
      this.request(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data)
      })
    );
  }

  /**
   * PATCH request
   * @param {string} endpoint - Endpoint
   * @param {any} data - Body data
   * @returns {Promise<any>}
   */
  async patch(endpoint, data) {
    return this.withRetry(() =>
      this.request(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(data)
      })
    );
  }

  /**
   * DELETE request
   * @param {string} endpoint - Endpoint
   * @param {any} data - Body data opcional
   * @returns {Promise<any>}
   */
  async delete(endpoint, data = null) {
    const options = { method: 'DELETE' };
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    return this.withRetry(() =>
      this.request(endpoint, options)
    );
  }
}

// Exportar instancia singleton
const apiClient = new ApiClient();
export default apiClient;