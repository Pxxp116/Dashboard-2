/**
 * @fileoverview Constantes y configuración global del sistema GastroBot
 */

// Configuración de la API
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'https://backend-2-production-227a.up.railway.app/api',
  TIMEOUT: 10000, // 10 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 segundo
};

// Intervalos de actualización
export const UPDATE_INTERVALS = {
  SYSTEM_STATUS: 15000, // 15 segundos
  MIRROR_FILE: 15000, // 15 segundos
  MAX_MIRROR_AGE: 30 // 30 segundos máximo de antigüedad
};

// Configuración de UI
export const UI_CONFIG = {
  MESSAGE_DURATION: 3000, // 3 segundos
  MAX_PERSONAS: 10,
  DEFAULT_HORA_INICIO: '13:00',
  DEFAULT_HORA_FIN: '23:00'
};

// Tabs de navegación
export const NAVIGATION_TABS = [
  { id: 'inicio', icon: 'Home', label: 'Inicio' },
  { id: 'reservas', icon: 'Calendar', label: 'Reservas' },
  { id: 'mesas', icon: 'Users', label: 'Mesas' },
  { id: 'menu', icon: 'Menu', label: 'Menú' },
  { id: 'politicas', icon: 'Settings', label: 'Políticas' },
  { id: 'espejo', icon: 'Eye', label: 'Archivo Espejo' }
];

// Colores del tema
export const THEME_COLORS = {
  primary: 'blue-600',
  success: 'green-600',
  danger: 'red-600',
  warning: 'yellow-600',
  info: 'blue-600'
};

// Mensajes del sistema
export const SYSTEM_MESSAGES = {
  RESERVATION_CREATED: 'Reserva creada correctamente',
  RESERVATION_CANCELLED: 'Reserva cancelada correctamente',
  DISH_CREATED: 'Plato creado correctamente',
  DISH_UPDATED: 'Plato actualizado correctamente',
  NO_TABLES_AVAILABLE: 'No hay mesas disponibles para esa hora',
  ERROR_GENERIC: 'Ha ocurrido un error. Por favor, intenta de nuevo.',
  ERROR_NETWORK: 'Error de conexión. Verifica tu conexión a internet.',
  ERROR_VALIDATION: 'Por favor, completa todos los campos requeridos',
  CONFIRM_CANCEL: '¿Seguro que quieres cancelar esta reserva?',
  LOADING: 'Cargando...',
  NO_DATA: 'No hay datos disponibles',
  DATA_FRESH: 'Datos frescos',
  DATA_STALE: 'Actualización necesaria'
};

// Formatos de fecha y hora
export const DATE_FORMATS = {
  DISPLAY_DATE: {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  },
  INPUT_DATE: 'YYYY-MM-DD',
  DISPLAY_TIME: 'HH:mm',
  API_DATETIME: 'YYYY-MM-DD HH:mm:ss'
};

// Validaciones
export const VALIDATION_RULES = {
  PHONE_REGEX: /^\+?[0-9\s-()]+$/,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MIN_PRICE: 0.01,
  MAX_PRICE: 9999.99,
  MAX_NOTES_LENGTH: 500
};