/**
 * @fileoverview Definición de tipos y estructuras de datos para GastroBot Dashboard
 * Este archivo centraliza todas las estructuras de datos utilizadas en la aplicación
 */

/**
 * @typedef {Object} Reserva
 * @property {number} id - ID único de la reserva
 * @property {string} nombre - Nombre del cliente
 * @property {string} telefono - Teléfono del cliente
 * @property {string} fecha - Fecha de la reserva (YYYY-MM-DD)
 * @property {string} hora - Hora de la reserva (HH:MM)
 * @property {number} personas - Número de personas
 * @property {number} mesa_id - ID de la mesa asignada
 * @property {string} estado - Estado de la reserva (confirmada, pendiente, cancelada)
 * @property {string} [notas] - Notas adicionales
 */

/**
 * @typedef {Object} Mesa
 * @property {number} id - ID único de la mesa
 * @property {number} numero_mesa - Número de la mesa
 * @property {number} capacidad - Capacidad máxima de personas
 * @property {string} estado - Estado actual (libre, ocupada)
 * @property {string} [zona] - Zona del restaurante
 */

/**
 * @typedef {Object} Plato
 * @property {number} id - ID único del plato
 * @property {string} nombre - Nombre del plato
 * @property {string} descripcion - Descripción del plato
 * @property {number} precio - Precio en euros
 * @property {boolean} disponible - Si está disponible
 * @property {string[]} [alergenos] - Lista de alérgenos
 * @property {number} categoria_id - ID de la categoría
 */

/**
 * @typedef {Object} Categoria
 * @property {number} id - ID único de la categoría
 * @property {string} nombre - Nombre de la categoría
 * @property {Plato[]} platos - Lista de platos en la categoría
 */

/**
 * @typedef {Object} Menu
 * @property {Categoria[]} categorias - Lista de categorías del menú
 */

/**
 * @typedef {Object} Politicas
 * @property {number} cancelacion_horas - Horas de anticipación para cancelar
 * @property {number} tiempo_mesa_minutos - Tiempo máximo de mesa en minutos
 * @property {boolean} niños_permitidos - Si se permiten niños
 * @property {boolean} mascotas_permitidas - Si se permiten mascotas
 * @property {boolean} anticipo_requerido - Si se requiere anticipo
 * @property {number} [anticipo_cantidad] - Cantidad del anticipo si aplica
 */

/**
 * @typedef {Object} EstadoSistema
 * @property {Object} espejo - Estado del archivo espejo
 * @property {number} espejo.edad_segundos - Antigüedad en segundos
 * @property {number} reservas_hoy - Número de reservas para hoy
 * @property {number} mesas_ocupadas - Número de mesas ocupadas
 * @property {number} mesas_totales - Número total de mesas
 * @property {Reserva[]} proximas_reservas - Lista de próximas reservas
 */

/**
 * @typedef {Object} ArchivoEspejo
 * @property {Reserva[]} reservas - Lista de reservas
 * @property {Mesa[]} mesas - Lista de mesas
 * @property {Menu} menu - Menú del restaurante
 * @property {Politicas} politicas - Políticas del restaurante
 * @property {number} edad_segundos - Antigüedad del archivo
 * @property {string} ultima_actualizacion - Timestamp de última actualización
 */

/**
 * @typedef {Object} Mensaje
 * @property {string} texto - Texto del mensaje
 * @property {'success'|'error'|'warning'|'info'} tipo - Tipo de mensaje
 */

/**
 * @typedef {Object} NuevaReserva
 * @property {string} nombre - Nombre del cliente
 * @property {string} telefono - Teléfono del cliente
 * @property {string} fecha - Fecha deseada
 * @property {string} hora - Hora deseada
 * @property {number} personas - Número de personas
 * @property {string} [notas] - Notas adicionales
 */

/**
 * @typedef {Object} NuevoPlato
 * @property {number} categoria_id - ID de la categoría
 * @property {string} nombre - Nombre del plato
 * @property {string} descripcion - Descripción
 * @property {string} precio - Precio como string para validación
 * @property {boolean} disponible - Disponibilidad inicial
 */

// Exportar constantes de estado
export const ESTADOS_RESERVA = {
  CONFIRMADA: 'confirmada',
  PENDIENTE: 'pendiente',
  CANCELADA: 'cancelada'
};

export const ESTADOS_MESA = {
  LIBRE: 'libre',
  OCUPADA: 'ocupada'
};

export const TIPOS_MENSAJE = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Valores por defecto
export const DEFAULT_NUEVA_RESERVA = {
  nombre: '',
  telefono: '',
  fecha: new Date().toISOString().split('T')[0],
  hora: '13:00',
  personas: 2,
  notas: ''
};

export const DEFAULT_NUEVO_PLATO = {
  categoria_id: 1,
  nombre: '',
  descripcion: '',
  precio: '',
  disponible: true
};