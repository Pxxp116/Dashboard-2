/**
 * @fileoverview Servicio para gestionar la información del restaurante
 * Maneja todas las operaciones relacionadas con los datos generales del restaurante
 */

import apiClient from './apiClient';

/**
 * Servicio de gestión de información del restaurante
 */
class RestaurantService {
  /**
   * Obtiene la información completa del restaurante
   * @returns {Promise<{exito: boolean, restaurante: Object}>}
   */
  async obtenerInformacion() {
    try {
      const response = await apiClient.get('/admin/restaurante');
      return response;
    } catch (error) {
      console.error('Error obteniendo información del restaurante:', error);
      throw error;
    }
  }

  /**
   * Actualiza la información del restaurante
   * @param {Object} datos - Datos a actualizar
   * @param {string} [datos.nombre] - Nombre del restaurante
   * @param {string} [datos.tipo_cocina] - Tipo de cocina
   * @param {string} [datos.direccion] - Dirección completa
   * @param {string} [datos.telefono] - Teléfono de contacto
   * @param {string} [datos.email] - Email de contacto
   * @param {string} [datos.web] - Sitio web
   * @param {string} [datos.descripcion] - Descripción del restaurante
   * @param {string} [datos.facebook] - Perfil de Facebook
   * @param {string} [datos.instagram] - Perfil de Instagram
   * @param {string} [datos.twitter] - Perfil de Twitter
   * @param {string} [datos.tripadvisor] - Perfil de TripAdvisor
   * @returns {Promise<{exito: boolean, restaurante: Object, mensaje: string}>}
   */
  async actualizarInformacion(datos) {
    try {
      const response = await apiClient.put('/admin/restaurante', datos);
      return response;
    } catch (error) {
      console.error('Error actualizando información del restaurante:', error);
      throw error;
    }
  }

  /**
   * Valida los datos del restaurante antes de enviar
   * @param {Object} datos - Datos a validar
   * @returns {Object} Resultado de validación con errores
   */
  validarDatos(datos) {
    const errores = {};
    
    // Validar nombre
    if (datos.nombre && datos.nombre.trim().length === 0) {
      errores.nombre = 'El nombre del restaurante es requerido';
    }
    
    // Validar teléfono
    if (datos.telefono) {
      const telefonoRegex = /^\+?[0-9\s-()]+$/;
      if (!telefonoRegex.test(datos.telefono)) {
        errores.telefono = 'Formato de teléfono inválido';
      }
    }
    
    // Validar email
    if (datos.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(datos.email)) {
        errores.email = 'Formato de email inválido';
      }
    }
    
    // Validar URL del sitio web
    if (datos.web) {
      try {
        // Añadir protocolo si no lo tiene
        const url = datos.web.startsWith('http') ? datos.web : `https://${datos.web}`;
        new URL(url);
      } catch {
        errores.web = 'URL del sitio web inválida';
      }
    }
    
    // Validar redes sociales
    if (datos.instagram && !datos.instagram.match(/^@?[a-zA-Z0-9_.]+$/)) {
      errores.instagram = 'Formato de Instagram inválido';
    }
    
    if (datos.twitter && !datos.twitter.match(/^@?[a-zA-Z0-9_]+$/)) {
      errores.twitter = 'Formato de Twitter inválido';
    }
    
    return {
      valido: Object.keys(errores).length === 0,
      errores
    };
  }

  /**
   * Formatea los datos para mostrar en el bot
   * @param {Object} restaurante - Datos del restaurante
   * @returns {string} Texto formateado para WhatsApp/Bot
   */
  formatearParaBot(restaurante) {
    let mensaje = `📍 *${restaurante.nombre}*\n`;
    
    if (restaurante.tipo_cocina) {
      mensaje += `🍴 ${restaurante.tipo_cocina}\n`;
    }
    
    mensaje += `\n📍 *Ubicación:*\n${restaurante.direccion}\n`;
    mensaje += `\n📞 *Contacto:*\n`;
    mensaje += `Teléfono: ${restaurante.telefono}\n`;
    
    if (restaurante.email) {
      mensaje += `Email: ${restaurante.email}\n`;
    }
    
    if (restaurante.web) {
      mensaje += `Web: ${restaurante.web}\n`;
    }
    
    if (restaurante.instagram || restaurante.facebook || restaurante.twitter) {
      mensaje += `\n📱 *Redes Sociales:*\n`;
      
      if (restaurante.instagram) {
        mensaje += `Instagram: @${restaurante.instagram.replace('@', '')}\n`;
      }
      
      if (restaurante.facebook) {
        mensaje += `Facebook: facebook.com/${restaurante.facebook}\n`;
      }
      
      if (restaurante.twitter) {
        mensaje += `Twitter: @${restaurante.twitter.replace('@', '')}\n`;
      }
    }
    
    if (restaurante.descripcion) {
      mensaje += `\n📝 *Sobre nosotros:*\n${restaurante.descripcion}`;
    }
    
    return mensaje;
  }

  /**
   * Genera un objeto de metadatos para SEO
   * @param {Object} restaurante - Datos del restaurante
   * @returns {Object} Metadatos para SEO
   */
  generarMetadatos(restaurante) {
    return {
      title: restaurante.nombre,
      description: restaurante.descripcion || `${restaurante.tipo_cocina} en ${restaurante.direccion}`,
      keywords: [
        restaurante.nombre,
        restaurante.tipo_cocina,
        'restaurante',
        'reservas',
        restaurante.direccion?.split(',')[1]?.trim() // Ciudad
      ].filter(Boolean).join(', '),
      openGraph: {
        title: restaurante.nombre,
        description: restaurante.descripcion,
        type: 'restaurant',
        locale: 'es_ES',
        site_name: restaurante.nombre,
        url: restaurante.web
      },
      social: {
        facebook: restaurante.facebook,
        instagram: restaurante.instagram,
        twitter: restaurante.twitter,
        tripadvisor: restaurante.tripadvisor
      }
    };
  }
}

// Exportar instancia singleton
const restaurantService = new RestaurantService();
export default restaurantService;