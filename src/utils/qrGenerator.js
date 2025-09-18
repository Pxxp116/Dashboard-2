/**
 * @fileoverview Utilidades para generar y gestionar códigos QR
 * Incluye funcionalidades de SplitQR para dividir códigos en fragmentos
 */

/**
 * Genera un ID único para los códigos QR
 * @returns {string} ID único
 */
export const generateQRId = () => {
  return `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Genera URL de código QR usando una API pública
 * @param {string} data - Datos para codificar en el QR
 * @param {number} size - Tamaño del QR (default: 300)
 * @returns {string} URL del código QR
 */
export const generateQRUrl = (data, size = 300) => {
  const encodedData = encodeURIComponent(data);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}&format=png&ecc=M`;
};

/**
 * Genera múltiples QR codes para la funcionalidad SplitQR
 * @param {Object} baseData - Datos base del restaurante
 * @param {Array} sections - Secciones para dividir (ej: ['bebidas', 'postres', 'menu-del-dia'])
 * @returns {Array} Array de objetos QR
 */
export const generateSplitQR = (baseData, sections) => {
  const baseUrl = baseData.baseUrl || 'https://gastrobot.com';

  return sections.map(section => {
    const qrData = {
      restaurante: baseData.restaurante,
      seccion: section.id,
      url: `${baseUrl}/menu/${section.id}`,
      timestamp: new Date().toISOString()
    };

    return {
      id: generateQRId(),
      name: section.name,
      description: section.description,
      data: JSON.stringify(qrData),
      url: generateQRUrl(qrData.url),
      publicUrl: qrData.url,
      section: section.id,
      created: new Date().toISOString(),
      scanCount: 0,
      active: true
    };
  });
};

/**
 * Tipos de códigos QR predefinidos
 */
export const QR_TYPES = {
  MENU_COMPLETO: {
    id: 'menu-completo',
    name: 'Menú Completo',
    description: 'Acceso a todo el menú del restaurante',
    icon: 'Menu'
  },
  MENU_BEBIDAS: {
    id: 'bebidas',
    name: 'Carta de Bebidas',
    description: 'Solo bebidas y cócteles',
    icon: 'Coffee'
  },
  MENU_POSTRES: {
    id: 'postres',
    name: 'Carta de Postres',
    description: 'Dulces y postres especiales',
    icon: 'Cake'
  },
  MENU_DIA: {
    id: 'menu-del-dia',
    name: 'Menú del Día',
    description: 'Especiales y platos del día',
    icon: 'Calendar'
  },
  PROMOCIONES: {
    id: 'promociones',
    name: 'Promociones',
    description: 'Ofertas y descuentos especiales',
    icon: 'Tag'
  },
  RESERVAS: {
    id: 'reservas',
    name: 'Reservas',
    description: 'Sistema de reservas online',
    icon: 'BookOpen'
  }
};

/**
 * Genera un código QR personalizado
 * @param {Object} config - Configuración del QR
 * @returns {Object} Objeto QR generado
 */
export const generateCustomQR = (config) => {
  const {
    name,
    description,
    type,
    customUrl,
    restaurante = 'GastroBot Restaurant'
  } = config;

  const qrData = {
    restaurante,
    tipo: type,
    url: customUrl || `https://gastrobot.com/${type}`,
    timestamp: new Date().toISOString()
  };

  return {
    id: generateQRId(),
    name,
    description,
    type,
    data: JSON.stringify(qrData),
    url: generateQRUrl(qrData.url),
    publicUrl: qrData.url,
    created: new Date().toISOString(),
    scanCount: 0,
    active: true,
    lastScanned: null
  };
};

/**
 * Descarga un código QR como imagen
 * @param {string} qrUrl - URL del código QR
 * @param {string} filename - Nombre del archivo
 */
export const downloadQR = (qrUrl, filename) => {
  const link = document.createElement('a');
  link.href = qrUrl;
  link.download = `${filename}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Copia la URL pública al portapapeles
 * @param {string} url - URL a copiar
 * @returns {Promise<boolean>} True si se copió exitosamente
 */
export const copyToClipboard = async (url) => {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch (err) {
    // Fallback para navegadores que no soportan clipboard API
    const textArea = document.createElement('textarea');
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackErr) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

/**
 * Valida si una URL es válida
 * @param {string} url - URL a validar
 * @returns {boolean} True si la URL es válida
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Formatea la fecha de creación
 * @param {string} dateString - Fecha en formato ISO
 * @returns {string} Fecha formateada
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Calcula estadísticas de un conjunto de QRs
 * @param {Array} qrs - Array de códigos QR
 * @returns {Object} Estadísticas calculadas
 */
export const calculateQRStats = (qrs) => {
  const total = qrs.length;
  const active = qrs.filter(qr => qr.active).length;
  const totalScans = qrs.reduce((sum, qr) => sum + qr.scanCount, 0);
  const mostScanned = qrs.reduce((max, qr) =>
    qr.scanCount > (max?.scanCount || 0) ? qr : max, null
  );

  return {
    total,
    active,
    inactive: total - active,
    totalScans,
    averageScans: total > 0 ? Math.round(totalScans / total) : 0,
    mostScanned
  };
};