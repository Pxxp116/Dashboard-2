/**
 * @fileoverview Utilidades para formateo de fechas y horas
 * Centraliza toda la lógica de formateo temporal
 */

import { DATE_FORMATS } from './constants';

/**
 * Formatea una fecha para mostrar
 * @param {Date|string} fecha - Fecha a formatear
 * @param {Object} opciones - Opciones de formato
 * @returns {string} Fecha formateada
 */
export function formatearFecha(fecha, opciones = DATE_FORMATS.DISPLAY_DATE) {
  if (!fecha) return '';
  
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  
  if (isNaN(fechaObj.getTime())) {
    return 'Fecha inválida';
  }
  
  return fechaObj.toLocaleDateString('es-ES', opciones);
}

/**
 * Formatea una hora en formato HH:MM
 * @param {string} hora - Hora en formato HH:MM:SS
 * @returns {string} Hora formateada
 */
export function formatearHora(hora) {
  if (!hora) return '';
  return hora.substring(0, 5);
}

/**
 * Formatea fecha y hora juntas
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @param {string} hora - Hora en formato HH:MM:SS
 * @returns {string} Fecha y hora formateadas
 */
export function formatearFechaHora(fecha, hora) {
  const fechaFormateada = formatearFecha(fecha, {
    day: 'numeric',
    month: 'short'
  });
  const horaFormateada = formatearHora(hora);
  
  return `${fechaFormateada} a las ${horaFormateada}`;
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 * @returns {string} Fecha actual
 */
export function obtenerFechaActual() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Obtiene la hora actual en formato HH:MM
 * @returns {string} Hora actual
 */
export function obtenerHoraActual() {
  const ahora = new Date();
  const horas = String(ahora.getHours()).padStart(2, '0');
  const minutos = String(ahora.getMinutes()).padStart(2, '0');
  return `${horas}:${minutos}`;
}

/**
 * Calcula el tiempo transcurrido desde una fecha
 * @param {Date|string} fecha - Fecha de referencia
 * @returns {string} Tiempo transcurrido
 */
export function tiempoTranscurrido(fecha) {
  const ahora = new Date();
  const fechaRef = typeof fecha === 'string' ? new Date(fecha) : fecha;
  const diferencia = ahora - fechaRef;
  
  const segundos = Math.floor(diferencia / 1000);
  const minutos = Math.floor(segundos / 60);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);
  
  if (dias > 0) return `hace ${dias} día${dias > 1 ? 's' : ''}`;
  if (horas > 0) return `hace ${horas} hora${horas > 1 ? 's' : ''}`;
  if (minutos > 0) return `hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
  return `hace ${segundos} segundo${segundos > 1 ? 's' : ''}`;
}

/**
 * Valida si una fecha es futura
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {boolean} True si es futura
 */
export function esFechaFutura(fecha) {
  const fechaObj = new Date(fecha);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  return fechaObj >= hoy;
}

/**
 * Valida si una fecha y hora son futuras
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @param {string} hora - Hora en formato HH:MM
 * @returns {boolean} True si es futuro
 */
export function esFechaHoraFutura(fecha, hora) {
  const fechaHora = new Date(`${fecha}T${hora}`);
  const ahora = new Date();
  
  return fechaHora > ahora;
}

/**
 * Añade días a una fecha
 * @param {Date|string} fecha - Fecha base
 * @param {number} dias - Días a añadir
 * @returns {string} Nueva fecha en formato YYYY-MM-DD
 */
export function añadirDias(fecha, dias) {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  const nuevaFecha = new Date(fechaObj);
  nuevaFecha.setDate(nuevaFecha.getDate() + dias);
  
  return nuevaFecha.toISOString().split('T')[0];
}

/**
 * Obtiene el día de la semana
 * @param {Date|string} fecha - Fecha
 * @returns {string} Nombre del día
 */
export function obtenerDiaSemana(fecha) {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  
  return dias[fechaObj.getDay()];
}

/**
 * Formatea duración en minutos a texto legible
 * @param {number} minutos - Duración en minutos
 * @returns {string} Duración formateada
 */
export function formatearDuracion(minutos) {
  if (!minutos || minutos < 0) return '0 min';
  
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  
  if (horas === 0) return `${mins} min`;
  if (mins === 0) return `${horas}h`;
  return `${horas}h ${mins}min`;
}

/**
 * Parsea una fecha y hora del formato de la API
 * @param {string} fechaHoraAPI - Fecha y hora del API
 * @returns {Object} Objeto con fecha y hora separadas
 */
export function parsearFechaHoraAPI(fechaHoraAPI) {
  if (!fechaHoraAPI) return { fecha: '', hora: '' };
  
  const [fecha, horaCompleta] = fechaHoraAPI.split('T');
  const hora = horaCompleta ? horaCompleta.substring(0, 5) : '';
  
  return { fecha, hora };
}

export default {
  formatearFecha,
  formatearHora,
  formatearFechaHora,
  obtenerFechaActual,
  obtenerHoraActual,
  tiempoTranscurrido,
  esFechaFutura,
  esFechaHoraFutura,
  añadirDias,
  obtenerDiaSemana,
  formatearDuracion,
  parsearFechaHoraAPI
};