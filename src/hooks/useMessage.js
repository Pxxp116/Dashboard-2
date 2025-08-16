/**
 * @fileoverview Hook personalizado para sistema de mensajes
 * Gestiona notificaciones y mensajes temporales en la UI
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { TIPOS_MENSAJE, UI_CONFIG } from '../services/utils/constants';

/**
 * Hook para gestionar mensajes de notificación
 * @param {number} [duracionDefault=3000] - Duración por defecto de los mensajes
 * @returns {Object} Estado y funciones para manejar mensajes
 */
export function useMessage(duracionDefault = UI_CONFIG.MESSAGE_DURATION) {
  const [mensaje, setMensaje] = useState(null);
  const [cola, setCola] = useState([]);
  const timeoutRef = useRef(null);
  const procesandoCola = useRef(false);

  /**
   * Muestra un mensaje temporal
   * @param {string} texto - Texto del mensaje
   * @param {string} [tipo=TIPOS_MENSAJE.SUCCESS] - Tipo de mensaje
   * @param {number} [duracion] - Duración específica para este mensaje
   */
  const mostrarMensaje = useCallback((texto, tipo = TIPOS_MENSAJE.SUCCESS, duracion) => {
    const nuevoMensaje = {
      id: Date.now(),
      texto,
      tipo,
      duracion: duracion || duracionDefault,
      timestamp: new Date()
    };

    // Si hay un mensaje activo, añadir a la cola
    if (mensaje && !procesandoCola.current) {
      setCola(prev => [...prev, nuevoMensaje]);
      return;
    }

    // Limpiar timeout anterior si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Establecer nuevo mensaje
    setMensaje(nuevoMensaje);

    // Configurar timeout para ocultar mensaje
    timeoutRef.current = setTimeout(() => {
      setMensaje(null);
      timeoutRef.current = null;
    }, nuevoMensaje.duracion);
  }, [mensaje, duracionDefault]);

  /**
   * Muestra un mensaje de éxito
   * @param {string} texto - Texto del mensaje
   * @param {number} [duracion] - Duración del mensaje
   */
  const mostrarExito = useCallback((texto, duracion) => {
    mostrarMensaje(texto, TIPOS_MENSAJE.SUCCESS, duracion);
  }, [mostrarMensaje]);

  /**
   * Muestra un mensaje de error
   * @param {string} texto - Texto del mensaje
   * @param {number} [duracion] - Duración del mensaje
   */
  const mostrarError = useCallback((texto, duracion) => {
    mostrarMensaje(texto, TIPOS_MENSAJE.ERROR, duracion);
  }, [mostrarMensaje]);

  /**
   * Muestra un mensaje de advertencia
   * @param {string} texto - Texto del mensaje
   * @param {number} [duracion] - Duración del mensaje
   */
  const mostrarAdvertencia = useCallback((texto, duracion) => {
    mostrarMensaje(texto, TIPOS_MENSAJE.WARNING, duracion);
  }, [mostrarMensaje]);

  /**
   * Muestra un mensaje informativo
   * @param {string} texto - Texto del mensaje
   * @param {number} [duracion] - Duración del mensaje
   */
  const mostrarInfo = useCallback((texto, duracion) => {
    mostrarMensaje(texto, TIPOS_MENSAJE.INFO, duracion);
  }, [mostrarMensaje]);

  /**
   * Oculta el mensaje actual inmediatamente
   */
  const ocultarMensaje = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setMensaje(null);
  }, []);

  /**
   * Limpia toda la cola de mensajes
   */
  const limpiarCola = useCallback(() => {
    setCola([]);
    procesandoCola.current = false;
  }, []);

  /**
   * Procesa el siguiente mensaje en la cola
   */
  const procesarCola = useCallback(() => {
    if (cola.length === 0) {
      procesandoCola.current = false;
      return;
    }

    procesandoCola.current = true;
    const [siguiente, ...resto] = cola;
    setCola(resto);

    // Mostrar el siguiente mensaje
    mostrarMensaje(siguiente.texto, siguiente.tipo, siguiente.duracion);
  }, [cola, mostrarMensaje]);

  // Procesar cola cuando no hay mensaje activo
  useEffect(() => {
    if (!mensaje && cola.length > 0 && !procesandoCola.current) {
      // Pequeño delay para evitar transiciones bruscas
      const timer = setTimeout(() => {
        procesarCola();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [mensaje, cola, procesarCola]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  /**
   * Obtiene estadísticas de mensajes
   * @returns {Object} Estadísticas
   */
  const obtenerEstadisticas = useCallback(() => {
    return {
      mensajeActivo: !!mensaje,
      mensajesEnCola: cola.length,
      procesandoCola: procesandoCola.current
    };
  }, [mensaje, cola]);

  return {
    // Estado
    mensaje,
    cola,
    
    // Acciones principales
    mostrarMensaje,
    ocultarMensaje,
    
    // Acciones por tipo
    mostrarExito,
    mostrarError,
    mostrarAdvertencia,
    mostrarInfo,
    
    // Gestión de cola
    limpiarCola,
    procesarCola,
    
    // Utilidades
    obtenerEstadisticas
  };
}

export default useMessage;