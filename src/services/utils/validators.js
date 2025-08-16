/**
 * @fileoverview Funciones de validación para formularios y datos
 * Centraliza toda la lógica de validación
 */

import { VALIDATION_RULES } from './constants';

/**
 * Valida un número de teléfono
 * @param {string} telefono - Número de teléfono
 * @returns {Object} Resultado de validación
 */
export function validarTelefono(telefono) {
  if (!telefono) {
    return { valido: false, mensaje: 'El teléfono es requerido' };
  }
  
  if (!VALIDATION_RULES.PHONE_REGEX.test(telefono)) {
    return { valido: false, mensaje: 'Formato de teléfono inválido' };
  }
  
  // Eliminar espacios y guiones para contar dígitos
  const digitosLimpios = telefono.replace(/[\s-()]/g, '');
  
  if (digitosLimpios.length < 9) {
    return { valido: false, mensaje: 'El teléfono debe tener al menos 9 dígitos' };
  }
  
  return { valido: true };
}

/**
 * Valida un nombre
 * @param {string} nombre - Nombre a validar
 * @returns {Object} Resultado de validación
 */
export function validarNombre(nombre) {
  if (!nombre || nombre.trim().length === 0) {
    return { valido: false, mensaje: 'El nombre es requerido' };
  }
  
  if (nombre.length < VALIDATION_RULES.MIN_NAME_LENGTH) {
    return { valido: false, mensaje: `El nombre debe tener al menos ${VALIDATION_RULES.MIN_NAME_LENGTH} caracteres` };
  }
  
  if (nombre.length > VALIDATION_RULES.MAX_NAME_LENGTH) {
    return { valido: false, mensaje: `El nombre no puede exceder ${VALIDATION_RULES.MAX_NAME_LENGTH} caracteres` };
  }
  
  return { valido: true };
}

/**
 * Valida un precio
 * @param {number|string} precio - Precio a validar
 * @returns {Object} Resultado de validación
 */
export function validarPrecio(precio) {
  const precioNum = parseFloat(precio);
  
  if (isNaN(precioNum)) {
    return { valido: false, mensaje: 'El precio debe ser un número válido' };
  }
  
  if (precioNum < VALIDATION_RULES.MIN_PRICE) {
    return { valido: false, mensaje: `El precio mínimo es ${VALIDATION_RULES.MIN_PRICE}€` };
  }
  
  if (precioNum > VALIDATION_RULES.MAX_PRICE) {
    return { valido: false, mensaje: `El precio máximo es ${VALIDATION_RULES.MAX_PRICE}€` };
  }
  
  return { valido: true };
}

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {Object} Resultado de validación
 */
export function validarEmail(email) {
  if (!email) {
    return { valido: false, mensaje: 'El email es requerido' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { valido: false, mensaje: 'Formato de email inválido' };
  }
  
  return { valido: true };
}

/**
 * Valida datos de reserva
 * @param {Object} reserva - Datos de la reserva
 * @returns {Object} Resultado de validación con errores por campo
 */
export function validarReserva(reserva) {
  const errores = {};
  
  // Validar nombre
  const resultadoNombre = validarNombre(reserva.nombre);
  if (!resultadoNombre.valido) {
    errores.nombre = resultadoNombre.mensaje;
  }
  
  // Validar teléfono
  const resultadoTelefono = validarTelefono(reserva.telefono);
  if (!resultadoTelefono.valido) {
    errores.telefono = resultadoTelefono.mensaje;
  }
  
  // Validar fecha
  if (!reserva.fecha) {
    errores.fecha = 'La fecha es requerida';
  } else {
    const fechaReserva = new Date(reserva.fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaReserva < hoy) {
      errores.fecha = 'La fecha no puede ser pasada';
    }
  }
  
  // Validar hora
  if (!reserva.hora) {
    errores.hora = 'La hora es requerida';
  }
  
  // Validar número de personas
  if (!reserva.personas || reserva.personas < 1) {
    errores.personas = 'Debe especificar al menos 1 persona';
  } else if (reserva.personas > 20) {
    errores.personas = 'Para grupos mayores a 20 personas, contacte directamente';
  }
  
  // Validar notas (opcional pero con límite)
  if (reserva.notas && reserva.notas.length > VALIDATION_RULES.MAX_NOTES_LENGTH) {
    errores.notas = `Las notas no pueden exceder ${VALIDATION_RULES.MAX_NOTES_LENGTH} caracteres`;
  }
  
  return {
    valido: Object.keys(errores).length === 0,
    errores
  };
}

/**
 * Valida datos de un plato
 * @param {Object} plato - Datos del plato
 * @returns {Object} Resultado de validación con errores por campo
 */
export function validarPlato(plato) {
  const errores = {};
  
  // Validar nombre
  if (!plato.nombre || plato.nombre.trim().length === 0) {
    errores.nombre = 'El nombre del plato es requerido';
  }
  
  // Validar descripción
  if (!plato.descripcion || plato.descripcion.trim().length === 0) {
    errores.descripcion = 'La descripción es requerida';
  }
  
  // Validar precio
  const resultadoPrecio = validarPrecio(plato.precio);
  if (!resultadoPrecio.valido) {
    errores.precio = resultadoPrecio.mensaje;
  }
  
  // Validar categoría
  if (!plato.categoria_id) {
    errores.categoria_id = 'Debe seleccionar una categoría';
  }
  
  return {
    valido: Object.keys(errores).length === 0,
    errores
  };
}

/**
 * Sanitiza texto para evitar XSS
 * @param {string} texto - Texto a sanitizar
 * @returns {string} Texto sanitizado
 */
export function sanitizarTexto(texto) {
  if (!texto) return '';
  
  return texto
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Valida si un horario es válido
 * @param {string} hora - Hora en formato HH:MM
 * @returns {boolean} True si es válido
 */
export function validarHorario(hora) {
  if (!hora) return false;
  
  const partes = hora.split(':');
  if (partes.length !== 2) return false;
  
  const horas = parseInt(partes[0]);
  const minutos = parseInt(partes[1]);
  
  return horas >= 0 && horas <= 23 && minutos >= 0 && minutos <= 59;
}

/**
 * Valida capacidad de mesa
 * @param {number} capacidad - Capacidad de la mesa
 * @returns {Object} Resultado de validación
 */
export function validarCapacidadMesa(capacidad) {
  if (!capacidad || capacidad < 1) {
    return { valido: false, mensaje: 'La capacidad mínima es 1 persona' };
  }
  
  if (capacidad > 20) {
    return { valido: false, mensaje: 'La capacidad máxima es 20 personas' };
  }
  
  return { valido: true };
}

export default {
  validarTelefono,
  validarNombre,
  validarPrecio,
  validarEmail,
  validarReserva,
  validarPlato,
  sanitizarTexto,
  validarHorario,
  validarCapacidadMesa
};