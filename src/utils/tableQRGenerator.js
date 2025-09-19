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
    paymentMethods = ['card', 'cash', 'bizum']
  } = config;

  // ACTUALIZADO: Usar URL del servicio de pagos independiente
  const paymentBaseUrl = process.env.REACT_APP_PAYMENT_URL || baseUrl;
  const tablePaymentUrl = `${paymentBaseUrl}/mesa/${mesa.id}/pago`;

  const qrData = {
    type: 'table_payment',
    mesa_id: mesa.id,
    mesa_numero: mesa.numero,
    restaurante,
    url: tablePaymentUrl,
    split_enabled: enableSplitPayment,
    payment_methods: paymentMethods,
    timestamp: new Date().toISOString()
  };

  return {
    id: generateQRId(),
    mesa_id: mesa.id,
    mesa_numero: mesa.numero,
    name: `Mesa ${mesa.numero} - Pago`,
    description: `Código QR para pagos en Mesa ${mesa.numero} - ${mesa.capacidad} personas`,
    type: 'table_payment',
    data: JSON.stringify(qrData),
    url: generateQRUrl(tablePaymentUrl),
    publicUrl: tablePaymentUrl,
    paymentUrl: tablePaymentUrl,
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
 * Genera datos de ejemplo para demostración
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
  generateDemoPaymentData,
  validateSplitPaymentData,
  formatCurrency,
  calculateTablePaymentStats,
  exportPaymentDataToCSV
};