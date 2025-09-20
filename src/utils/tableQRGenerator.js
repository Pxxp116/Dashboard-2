/**
 * @fileoverview Utilidades específicas para generar códigos QR de mesas con funcionalidad de pago fraccionado
 * Extiende las funcionalidades base de qrGenerator.js para casos específicos de mesas
 */

import { generateQRId, generateQRUrl, isValidUrl } from './qrGenerator';

/**
 * Estados posibles de pago de mesa
 */
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PARTIAL: 'partial',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

/**
 * Modos de división de pago
 */
export const SPLIT_MODES = {
  EQUAL: 'equal',        // División igualitaria
  BY_ITEMS: 'by_items'   // Cada persona selecciona sus ítems
};

/**
 * Genera un ID único para sesiones de pago de mesa
 * @returns {string} ID único de sesión
 */
export const generatePaymentSessionId = () => {
  return `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Genera un código QR específico para una mesa con funcionalidad de pago
 * @param {Object} mesa - Objeto mesa
 * @param {Object} config - Configuración adicional
 * @returns {Object} Objeto QR generado para la mesa
 */
export const generateTableQR = (mesa, config = {}) => {
  const {
    baseUrl = 'https://gastrobot.com',
    restaurante = 'GastroBot Restaurant',
    enableSplitPayment = true,
    paymentMethods = ['card', 'cash', 'bizum'],
    restaurantInfo = null, // Nueva información del restaurante
    menuAvailable = false // Indica si hay menú disponible
  } = config;

  // CRÍTICO: Validación estricta del ID único de la mesa
  // La estructura real de BD es: { id: number, numero_mesa: string, capacidad: number, zona: string, ... }

  // Debug: Mostrar estructura real de la mesa
  console.log(`🔍 [DEBUG] Estructura de mesa recibida:`, {
    id: mesa.id,
    numero_mesa: mesa.numero_mesa,
    numero: mesa.numero,
    capacidad: mesa.capacidad,
    zona: mesa.zona,
    todas_las_propiedades: Object.keys(mesa)
  });

  // ELIMINADO: Fallback problemático que generaba IDs duplicados
  // ANTERIOR: const mesaId = mesa.id || `mesa_${mesa.numero_mesa || 'unknown'}`;

  // NUEVO: Validación estricta - la mesa DEBE tener un ID único válido
  if (!mesa.id) {
    console.error('❌ ERROR CRÍTICO: Mesa sin ID válido:', mesa);
    throw new Error(`Mesa ${mesa.numero_mesa || 'desconocida'} no tiene ID válido de base de datos. Todas las mesas deben tener un ID único.`);
  }

  const mesaId = mesa.id;
  const mesaNumero = mesa.numero_mesa || mesa.numero || mesaId;

  // Validación adicional del tipo de ID
  if (typeof mesaId !== 'number' && typeof mesaId !== 'string') {
    console.error('❌ ERROR: ID de mesa tiene tipo inválido:', typeof mesaId, mesaId);
    throw new Error(`Mesa ${mesaNumero}: ID debe ser número o string, recibido: ${typeof mesaId}`);
  }

  // Log para debugging con información detallada
  console.log(`🎯 Generando QR para Mesa ${mesaNumero} (ID: ${mesaId})`, {
    mesa_id_original: mesa.id,
    mesa_numero_mesa: mesa.numero_mesa,
    mesa_id_usado: mesaId,
    mesa_numero_usado: mesaNumero,
    tipo_id: typeof mesaId,
    id_es_unico: true // Se asume único al pasar validación
  });

  // Usar URL del servicio de pagos con ID validado
  const paymentBaseUrl = process.env.REACT_APP_PAYMENT_URL || baseUrl;
  const tablePaymentUrl = `${paymentBaseUrl}/mesa/${mesaId}/pago`;

  // Validar formato de URL generada
  const urlPattern = /\/mesa\/[^\/]+\/pago$/;
  if (!urlPattern.test(tablePaymentUrl)) {
    console.error('❌ ERROR: URL generada tiene formato inválido:', tablePaymentUrl);
    throw new Error(`URL generada para Mesa ${mesaNumero} tiene formato inválido: ${tablePaymentUrl}`);
  }

  console.log(`✅ URL única generada para Mesa ${mesaNumero}: ${tablePaymentUrl}`);

  const qrData = {
    type: 'table_payment',
    mesa_id: mesaId,
    mesa_numero: mesaNumero,
    restaurante,
    url: tablePaymentUrl,
    split_enabled: enableSplitPayment,
    payment_methods: paymentMethods,
    restaurant_info: restaurantInfo ? {
      nombre: restaurantInfo.nombre || restaurante,
      tipo_cocina: restaurantInfo.tipo_cocina,
      direccion: restaurantInfo.direccion,
      telefono: restaurantInfo.telefono,
      web: restaurantInfo.web
    } : null,
    menu_available: menuAvailable,
    mesa_info: {
      capacidad: mesa.capacidad || 4,
      zona: mesa.zona || 'interior',
      ubicacion: mesa.ubicacion
    },
    timestamp: new Date().toISOString()
  };

  return {
    id: generateQRId(),
    mesa_id: mesaId,
    mesa_numero: mesaNumero,
    name: `Mesa ${mesaNumero} - ${restaurantInfo?.nombre || restaurante}`,
    description: `Código QR para pagos en Mesa ${mesaNumero} - ${restaurantInfo?.nombre || restaurante} (${mesa.capacidad || 4} personas)`,
    type: 'table_payment',
    data: JSON.stringify(qrData),
    url: generateQRUrl(tablePaymentUrl),
    publicUrl: tablePaymentUrl,
    paymentUrl: tablePaymentUrl,
    restaurant_context: restaurantInfo ? {
      nombre: restaurantInfo.nombre,
      tipo_cocina: restaurantInfo.tipo_cocina,
      direccion: restaurantInfo.direccion,
      telefono: restaurantInfo.telefono
    } : null,
    menu_available: menuAvailable,
    created: new Date().toISOString(),
    scanCount: 0,
    active: true,
    lastScanned: null,
    paymentStatus: PAYMENT_STATUS.PENDING,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    splitMode: null,
    participants: [],
    items: []
  };
};

/**
 * Genera códigos QR para múltiples mesas
 * @param {Array} mesas - Array de mesas
 * @param {Object} config - Configuración base
 * @returns {Array} Array de objetos QR generados
 */
export const generateMultipleTableQRs = (mesas, config = {}) => {
  return mesas.map(mesa => generateTableQR(mesa, config));
};

// Validación estricta de QRs generados
export const validateTableQRs = (qrs) => {
  console.group('🔍 VALIDACIÓN ESTRICTA DE QRs GENERADOS');

  const urls = qrs.map(qr => qr.paymentUrl);
  const mesaIds = qrs.map(qr => qr.mesa_id);
  const uniqueUrls = [...new Set(urls)];
  const uniqueMesaIds = [...new Set(mesaIds)];

  // Validación 1: URLs únicas
  console.log(`📊 URLs: ${urls.length} generadas, ${uniqueUrls.length} únicas`);
  if (urls.length !== uniqueUrls.length) {
    console.error('❌ ERROR CRÍTICO: URLs duplicadas detectadas');

    // Encontrar y reportar duplicados específicos
    const urlCount = {};
    urls.forEach((url, index) => {
      if (!urlCount[url]) urlCount[url] = [];
      urlCount[url].push({ index, mesa_id: qrs[index].mesa_id, mesa_numero: qrs[index].mesa_numero });
    });

    Object.entries(urlCount)
      .filter(([url, ocurrencias]) => ocurrencias.length > 1)
      .forEach(([url, ocurrencias]) => {
        console.error(`   🔴 URL duplicada: ${url}`);
        console.error(`   📋 Mesas afectadas:`, ocurrencias.map(o => `Mesa ${o.mesa_numero} (ID: ${o.mesa_id})`));
      });

    console.groupEnd();
    return false;
  }

  // Validación 2: Mesa IDs únicos
  console.log(`📊 Mesa IDs: ${mesaIds.length} generados, ${uniqueMesaIds.length} únicos`);
  if (mesaIds.length !== uniqueMesaIds.length) {
    console.error('❌ ERROR CRÍTICO: Mesa IDs duplicados detectados');
    const duplicateMesaIds = mesaIds.filter((id, index) => mesaIds.indexOf(id) !== index);
    console.error('Mesa IDs duplicados:', [...new Set(duplicateMesaIds)]);
    console.groupEnd();
    return false;
  }

  // Validación 3: Formato de URLs
  const invalidUrls = urls.filter(url => !/\/mesa\/[^\/]+\/pago$/.test(url));
  if (invalidUrls.length > 0) {
    console.error('❌ ERROR: URLs con formato inválido detectadas:', invalidUrls);
    console.groupEnd();
    return false;
  }

  // Validación 4: Verificar que mesa_id esté en la URL
  const missingMesaIdInUrl = qrs.filter(qr => !qr.paymentUrl.includes(qr.mesa_id));
  if (missingMesaIdInUrl.length > 0) {
    console.error('❌ ERROR: URLs que no contienen el mesa_id correspondiente:',
      missingMesaIdInUrl.map(qr => ({ mesa_id: qr.mesa_id, url: qr.paymentUrl })));
    console.groupEnd();
    return false;
  }

  console.log('✅ VALIDACIÓN COMPLETA: Todos los QR son válidos y únicos');
  console.log(`✅ ${qrs.length} QRs generados correctamente con URLs únicas`);
  console.groupEnd();
  return true;
};

/**
 * Genera un QR con contexto completo del restaurante
 * @param {Object} mesa - Objeto mesa
 * @param {Object} restaurantData - Datos completos del restaurante
 * @returns {Object} QR generado con contexto del restaurante
 */
export const generateEnhancedTableQR = (mesa, restaurantData = {}) => {
  const { restaurante, menu, config = {} } = restaurantData;

  // Validación estricta de mesa antes de procesar
  console.log(`🔍 [ENHANCED] Validando estructura de mesa:`, {
    mesa_recibida: mesa,
    tiene_id: !!mesa.id,
    tiene_numero_mesa: !!mesa.numero_mesa,
    tipo_id: typeof mesa.id,
    valor_numero_mesa: mesa.numero_mesa
  });

  // Aplicar la misma validación estricta que en generateTableQR
  if (!mesa.id) {
    console.error('❌ ERROR CRÍTICO en Enhanced QR: Mesa sin ID válido:', mesa);
    throw new Error(`Enhanced QR: Mesa ${mesa.numero_mesa || 'desconocida'} no tiene ID válido de base de datos`);
  }

  if (typeof mesa.id !== 'number' && typeof mesa.id !== 'string') {
    console.error('❌ ERROR en Enhanced QR: ID de mesa tiene tipo inválido:', typeof mesa.id, mesa.id);
    throw new Error(`Enhanced QR: Mesa ${mesa.numero_mesa}: ID debe ser número o string, recibido: ${typeof mesa.id}`);
  }

  const enhancedConfig = {
    baseUrl: config.baseUrl || 'https://gastrobot.com',
    restaurante: restaurante?.nombre || 'GastroBot Restaurant',
    enableSplitPayment: config.enableSplitPayment !== false,
    paymentMethods: config.paymentMethods || ['card', 'cash', 'bizum'],
    restaurantInfo: restaurante,
    menuAvailable: menu?.categorias?.length > 0
  };

  // Usar numero_mesa como referencia principal
  const mesaRef = mesa.numero_mesa || mesa.numero || mesa.id || 'unknown';
  console.log(`🎯 Generando QR mejorado para Mesa ${mesaRef} de ${enhancedConfig.restaurante}`);

  const qr = generateTableQR(mesa, enhancedConfig);

  // Validar que la URL generada es única
  console.log(`🔗 [ENHANCED] URL generada: ${qr.paymentUrl}`);

  // Agregar metadatos adicionales
  qr.enhanced = true;
  qr.restaurant_metadata = {
    has_menu: enhancedConfig.menuAvailable,
    menu_categories: menu?.categorias?.length || 0,
    menu_items: menu?.categorias?.reduce((total, cat) =>
      total + (cat.platos?.length || 0), 0) || 0,
    last_updated: new Date().toISOString(),
    mesa_source_structure: {
      original_id: mesa.id,
      original_numero_mesa: mesa.numero_mesa,
      used_id: qr.mesa_id,
      used_numero: qr.mesa_numero
    }
  };

  return qr;
};

/**
 * Genera múltiples QRs mejorados con contexto del restaurante
 * @param {Array} mesas - Array de mesas
 * @param {Object} restaurantData - Datos completos del restaurante
 * @returns {Array} Array de QRs generados con contexto
 */
export const generateEnhancedMultipleTableQRs = (mesas, restaurantData = {}) => {
  console.log(`🏪 Generando ${mesas.length} QRs mejorados para ${restaurantData.restaurante?.nombre || 'GastroBot Restaurant'}`);

  return mesas.map(mesa => generateEnhancedTableQR(mesa, restaurantData));
};

/**
 * Actualiza el estado de pago de un QR de mesa
 * @param {Object} tableQR - QR de mesa
 * @param {Object} paymentData - Datos de pago
 * @returns {Object} QR actualizado
 */
export const updateTablePaymentStatus = (tableQR, paymentData) => {
  const {
    totalAmount = 0,
    paidAmount = 0,
    participants = [],
    items = [],
    splitMode = null
  } = paymentData;

  const pendingAmount = totalAmount - paidAmount;
  let status = PAYMENT_STATUS.PENDING;

  if (paidAmount === 0) {
    status = PAYMENT_STATUS.PENDING;
  } else if (paidAmount >= totalAmount) {
    status = PAYMENT_STATUS.COMPLETED;
  } else if (paidAmount > 0) {
    status = PAYMENT_STATUS.PARTIAL;
  }

  return {
    ...tableQR,
    paymentStatus: status,
    totalAmount,
    paidAmount,
    pendingAmount,
    participants,
    items,
    splitMode,
    lastUpdated: new Date().toISOString()
  };
};

/**
 * Calcula la división igualitaria de una cuenta
 * @param {number} totalAmount - Monto total
 * @param {number} numParticipants - Número de participantes
 * @returns {Object} Datos de división
 */
export const calculateEqualSplit = (totalAmount, numParticipants) => {
  if (numParticipants === 0) return { perPerson: 0, remainder: 0 };

  const perPerson = Math.floor((totalAmount * 100) / numParticipants) / 100;
  const remainder = totalAmount - (perPerson * numParticipants);

  return {
    perPerson,
    remainder,
    totalDistributed: perPerson * numParticipants,
    distribution: Array(numParticipants).fill(perPerson)
  };
};

/**
 * Calcula la división por ítems seleccionados
 * @param {Array} items - Items del pedido
 * @param {Array} participants - Participantes con sus ítems seleccionados
 * @returns {Object} Datos de división por ítems
 */
export const calculateItemBasedSplit = (items, participants) => {
  const itemsMap = items.reduce((map, item) => {
    map[item.id] = item;
    return map;
  }, {});

  const participantAmounts = participants.map(participant => {
    const participantTotal = participant.selectedItems.reduce((total, itemId) => {
      const item = itemsMap[itemId];
      if (item) {
        // Si el item es compartido, dividir el precio entre los que lo seleccionaron
        const sharedBy = participants.filter(p => p.selectedItems.includes(itemId)).length;
        return total + (item.price / sharedBy);
      }
      return total;
    }, 0);

    return {
      ...participant,
      amount: Math.round(participantTotal * 100) / 100
    };
  });

  const totalAssigned = participantAmounts.reduce((sum, p) => sum + p.amount, 0);
  const totalBill = items.reduce((sum, item) => sum + item.price, 0);
  const unassignedAmount = totalBill - totalAssigned;

  return {
    participants: participantAmounts,
    totalAssigned,
    totalBill,
    unassignedAmount: Math.round(unassignedAmount * 100) / 100
  };
};

/**
 * Genera configuración inicial vacía para una mesa
 * @param {number} mesaId - ID de la mesa
 * @returns {Object} Configuración inicial vacía
 */
export const generateEmptyPaymentData = (mesaId) => {
  return {
    totalAmount: 0,
    items: [],
    participants: []
  };
};

/**
 * Genera datos de ejemplo para demostración (OPCIONAL - solo para pruebas)
 * @param {number} mesaId - ID de la mesa
 * @returns {Object} Datos de ejemplo
 */
export const generateDemoPaymentData = (mesaId) => {
  return {
    totalAmount: 89.50,
    items: [
      { id: 1, name: 'Paella Valenciana', price: 24.50, category: 'Principales' },
      { id: 2, name: 'Gazpacho', price: 8.90, category: 'Entrantes' },
      { id: 3, name: 'Sangría 1L', price: 18.00, category: 'Bebidas' },
      { id: 4, name: 'Crema Catalana', price: 6.50, category: 'Postres' },
      { id: 5, name: 'Jamón Ibérico', price: 22.60, category: 'Entrantes' },
      { id: 6, name: 'Agua con Gas', price: 3.50, category: 'Bebidas' },
      { id: 7, name: 'Pan con Tomate', price: 5.50, category: 'Entrantes' }
    ],
    participants: [
      { id: 1, name: 'Ana García', phone: '+34 600 111 222', selectedItems: [1, 2, 3], amount: 0 },
      { id: 2, name: 'Carlos López', phone: '+34 600 333 444', selectedItems: [1, 5, 6], amount: 0 },
      { id: 3, name: 'María Ruiz', phone: '+34 600 555 666', selectedItems: [4, 7, 3], amount: 0 }
    ]
  };
};

/**
 * Valida datos de pago fraccionado
 * @param {Object} paymentData - Datos de pago a validar
 * @returns {Object} Resultado de validación
 */
export const validateSplitPaymentData = (paymentData) => {
  const errors = [];
  const warnings = [];

  const { totalAmount, participants, items, splitMode } = paymentData;

  // Validaciones básicas
  if (!totalAmount || totalAmount <= 0) {
    errors.push('El monto total debe ser mayor a 0');
  }

  if (!participants || participants.length === 0) {
    errors.push('Debe haber al menos un participante');
  }

  if (!items || items.length === 0) {
    errors.push('Debe haber al menos un ítem en la cuenta');
  }

  // Validaciones específicas por modo
  if (splitMode === SPLIT_MODES.BY_ITEMS) {
    const allSelectedItems = participants.flatMap(p => p.selectedItems || []);
    const uniqueItems = [...new Set(allSelectedItems)];
    const totalItems = items.map(i => i.id);

    const unselectedItems = totalItems.filter(id => !uniqueItems.includes(id));
    if (unselectedItems.length > 0) {
      warnings.push(`Hay ${unselectedItems.length} ítems sin asignar a ningún participante`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Formatea el monto para mostrar
 * @param {number} amount - Monto a formatear
 * @returns {string} Monto formateado
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

/**
 * Calcula estadísticas de pagos de mesas
 * @param {Array} tableQRs - Array de QRs de mesa
 * @returns {Object} Estadísticas calculadas
 */
export const calculateTablePaymentStats = (tableQRs) => {
  const total = tableQRs.length;
  const pending = tableQRs.filter(qr => qr.paymentStatus === PAYMENT_STATUS.PENDING).length;
  const partial = tableQRs.filter(qr => qr.paymentStatus === PAYMENT_STATUS.PARTIAL).length;
  const completed = tableQRs.filter(qr => qr.paymentStatus === PAYMENT_STATUS.COMPLETED).length;

  const totalAmount = tableQRs.reduce((sum, qr) => sum + (qr.totalAmount || 0), 0);
  const paidAmount = tableQRs.reduce((sum, qr) => sum + (qr.paidAmount || 0), 0);
  const pendingAmount = totalAmount - paidAmount;

  const mostActiveTable = tableQRs.reduce((max, qr) =>
    qr.scanCount > (max?.scanCount || 0) ? qr : max, null
  );

  return {
    total,
    pending,
    partial,
    completed,
    totalAmount,
    paidAmount,
    pendingAmount,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    averageAmount: total > 0 ? Math.round((totalAmount / total) * 100) / 100 : 0,
    mostActiveTable
  };
};

/**
 * Exporta datos de pagos en formato CSV
 * @param {Array} tableQRs - Array de QRs de mesa
 * @returns {string} Datos en formato CSV
 */
export const exportPaymentDataToCSV = (tableQRs) => {
  const headers = [
    'Mesa',
    'Estado',
    'Total',
    'Pagado',
    'Pendiente',
    'Participantes',
    'Modo División',
    'Última Actualización'
  ];

  const rows = tableQRs.map(qr => [
    qr.mesa_numero,
    qr.paymentStatus,
    formatCurrency(qr.totalAmount || 0),
    formatCurrency(qr.paidAmount || 0),
    formatCurrency(qr.pendingAmount || 0),
    qr.participants?.length || 0,
    qr.splitMode || 'No definido',
    new Date(qr.lastUpdated || qr.created).toLocaleString('es-ES')
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  return csvContent;
};

export default {
  PAYMENT_STATUS,
  SPLIT_MODES,
  generatePaymentSessionId,
  generateTableQR,
  generateMultipleTableQRs,
  updateTablePaymentStatus,
  calculateEqualSplit,
  calculateItemBasedSplit,
  generateEmptyPaymentData,
  generateDemoPaymentData,
  validateSplitPaymentData,
  formatCurrency,
  calculateTablePaymentStats,
  exportPaymentDataToCSV
};