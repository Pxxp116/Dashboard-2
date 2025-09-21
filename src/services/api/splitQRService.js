/**
 * @fileoverview Servicio API para funcionalidades de SplitQR
 * Maneja toda la comunicación con el backend para cuentas por mesa y QR
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://backend-2-production-227a.up.railway.app/api';

class SplitQRService {
  /**
   * Obtener estado de todas las mesas y cuentas activas
   */
  async obtenerEstadoMesas() {
    try {
      const response = await fetch(`${API_BASE_URL}/splitqr/estado-mesas`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo estado de mesas:', error);
      throw error;
    }
  }

  /**
   * Abrir nueva cuenta para una mesa
   * @param {number} mesaId - ID de la mesa
   * @param {string} notas - Notas adicionales (opcional)
   */
  async abrirCuentaMesa(mesaId, notas = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/splitqr/mesa/${mesaId}/abrir-cuenta`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notas })
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error abriendo cuenta:', error);
      throw error;
    }
  }

  /**
   * Obtener cuenta activa de una mesa
   * @param {number} mesaId - ID de la mesa
   */
  async obtenerCuentaMesa(mesaId) {
    try {
      const response = await fetch(`${API_BASE_URL}/splitqr/mesa/${mesaId}/cuenta`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo cuenta:', error);
      throw error;
    }
  }

  /**
   * Agregar producto a una cuenta
   * @param {number} cuentaId - ID de la cuenta
   * @param {Object} producto - Datos del producto
   */
  async agregarProducto(cuentaId, producto) {
    try {
      const response = await fetch(`${API_BASE_URL}/splitqr/cuenta/${cuentaId}/item`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          producto_nombre: producto.nombre,
          producto_descripcion: producto.descripcion || '',
          categoria_nombre: producto.categoria || 'Otros',
          precio_unitario: producto.precio,
          cantidad: producto.cantidad || 1,
          agregado_por: 'dashboard'
        })
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error agregando producto:', error);
      throw error;
    }
  }

  /**
   * Regenerar QR para una cuenta
   * @param {number} cuentaId - ID de la cuenta
   */
  async regenerarQR(cuentaId) {
    try {
      const response = await fetch(`${API_BASE_URL}/splitqr/cuenta/${cuentaId}/regenerar-qr`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error regenerando QR:', error);
      throw error;
    }
  }

  /**
   * Obtener URL del QR para una cuenta
   * @param {number} cuentaId - ID de la cuenta
   */
  async obtenerURLQR(cuentaId) {
    try {
      const response = await fetch(`${API_BASE_URL}/splitqr/cuenta/${cuentaId}/qr-url`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo URL QR:', error);
      throw error;
    }
  }

  /**
   * Descargar imagen QR para una cuenta
   * @param {number} cuentaId - ID de la cuenta
   * @param {string} formato - Formato de imagen ('png' o 'svg')
   * @param {number} tamaño - Tamaño de la imagen en píxeles
   */
  async descargarImagenQR(cuentaId, formato = 'png', tamaño = 256) {
    try {
      const response = await fetch(`${API_BASE_URL}/splitqr/cuenta/${cuentaId}/qr-imagen?formato=${formato}&tamaño=${tamaño}`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      // Obtener el blob de la imagen
      const blob = await response.blob();

      // Crear URL para descarga
      const url = window.URL.createObjectURL(blob);

      // Crear elemento de descarga temporal
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-mesa-${cuentaId}.${formato}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Limpiar URL objeto
      window.URL.revokeObjectURL(url);

      return { exito: true, mensaje: 'QR descargado correctamente' };
    } catch (error) {
      console.error('Error descargando imagen QR:', error);
      throw error;
    }
  }

  /**
   * Cerrar cuenta
   * @param {number} cuentaId - ID de la cuenta
   */
  async cerrarCuenta(cuentaId) {
    try {
      const response = await fetch(`${API_BASE_URL}/splitqr/cuenta/${cuentaId}/cerrar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error cerrando cuenta:', error);
      throw error;
    }
  }

  /**
   * Obtener información de cuenta por QR ID (para testing)
   * @param {string} qrId - ID del QR
   */
  async obtenerCuentaPorQR(qrId) {
    try {
      const response = await fetch(`${API_BASE_URL}/splitqr/qr/${qrId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo cuenta por QR:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
const splitQRService = new SplitQRService();
export default splitQRService;