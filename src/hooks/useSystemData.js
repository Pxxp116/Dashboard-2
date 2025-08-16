/**
 * @fileoverview Custom hooks para gestionar datos del sistema
 * Encapsula la lógica de estado y actualización de datos
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import systemService from '../services/api/systemService';
import reservationService from '../services/api/reservationService';
import menuService from '../services/api/menuService';
import { UPDATE_INTERVALS, TIPOS_MENSAJE } from '../services/utils/constants';

/**
 * Hook para gestionar el estado del sistema y archivo espejo
 * @returns {Object} Estado del sistema y funciones de actualización
 */
export function useSystemData() {
  const [estadoSistema, setEstadoSistema] = useState(null);
  const [archivoEspejo, setArchivoEspejo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Usar refs para los intervalos
  const intervalRef = useRef(null);

  /**
   * Carga el estado del sistema
   */
  const cargarEstadoSistema = useCallback(async () => {
    try {
      const response = await systemService.obtenerEstadoSistema();
      if (response.exito) {
        setEstadoSistema(response.estadisticas);
        setError(null);
      }
    } catch (error) {
      console.error('Error cargando estado:', error);
      setError('Error al cargar el estado del sistema');
    }
  }, []);

  /**
   * Carga el archivo espejo completo
   */
  const cargarArchivoEspejo = useCallback(async () => {
    try {
      const response = await systemService.obtenerArchivoEspejo();
      if (response.exito) {
        setArchivoEspejo(response.datos);
        setError(null);
      }
    } catch (error) {
      console.error('Error cargando archivo espejo:', error);
      setError('Error al cargar el archivo espejo');
    }
  }, []);

  /**
   * Actualiza todos los datos
   */
  const actualizarDatos = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      cargarEstadoSistema(),
      cargarArchivoEspejo()
    ]);
    setLoading(false);
  }, [cargarEstadoSistema, cargarArchivoEspejo]);

  /**
   * Inicia la actualización automática
   */
  const iniciarActualizacionAutomatica = useCallback(() => {
    // Limpiar intervalo existente si existe
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Configurar nuevo intervalo
    intervalRef.current = setInterval(() => {
      actualizarDatos();
    }, UPDATE_INTERVALS.SYSTEM_STATUS);
  }, [actualizarDatos]);

  /**
   * Detiene la actualización automática
   */
  const detenerActualizacionAutomatica = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Efecto para cargar datos iniciales y configurar actualización
  useEffect(() => {
    actualizarDatos();
    iniciarActualizacionAutomatica();
    
    // Cleanup al desmontar
    return () => {
      detenerActualizacionAutomatica();
    };
  }, [actualizarDatos, iniciarActualizacionAutomatica, detenerActualizacionAutomatica]);

  return {
    estadoSistema,
    archivoEspejo,
    loading,
    error,
    actualizarDatos,
    cargarEstadoSistema,
    cargarArchivoEspejo,
    iniciarActualizacionAutomatica,
    detenerActualizacionAutomatica
  };
}

/**
 * Hook para gestionar reservas
 * @returns {Object} Estado de reservas y funciones
 */
export function useReservations() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Crea una nueva reserva
   * @param {Object} datosReserva - Datos de la reserva
   * @returns {Promise<{exito: boolean, mensaje: string}>}
   */
  const crearReserva = useCallback(async (datosReserva) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await reservationService.crearReservaCompleta(datosReserva);
      setLoading(false);
      return response;
    } catch (error) {
      setLoading(false);
      setError(error.message);
      return { exito: false, mensaje: error.message };
    }
  }, []);

  /**
   * Cancela una reserva
   * @param {number} reservaId - ID de la reserva
   * @param {string} motivo - Motivo de cancelación
   * @returns {Promise<{exito: boolean, mensaje: string}>}
   */
  const cancelarReserva = useCallback(async (reservaId, motivo) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await reservationService.cancelarReserva(reservaId, motivo);
      setLoading(false);
      return response;
    } catch (error) {
      setLoading(false);
      setError(error.message);
      return { exito: false, mensaje: error.message };
    }
  }, []);

  /**
   * Actualiza la lista de reservas
   * @param {Array} nuevasReservas - Nueva lista de reservas
   */
  const actualizarReservas = useCallback((nuevasReservas) => {
    setReservas(nuevasReservas);
  }, []);

  return {
    reservas,
    loading,
    error,
    crearReserva,
    cancelarReserva,
    actualizarReservas
  };
}

/**
 * Hook para gestionar el menú
 * @returns {Object} Estado del menú y funciones
 */
export function useMenu() {
  const [menu, setMenu] = useState({ categorias: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Crea un nuevo plato
   * @param {Object} datosPlato - Datos del plato
   * @returns {Promise<{exito: boolean, mensaje: string}>}
   */
  const crearPlato = useCallback(async (datosPlato) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await menuService.crearPlato(datosPlato);
      setLoading(false);
      return response;
    } catch (error) {
      setLoading(false);
      setError(error.message);
      return { exito: false, mensaje: error.message };
    }
  }, []);

  /**
   * Cambia la disponibilidad de un plato
   * @param {number} platoId - ID del plato
   * @param {boolean} disponible - Nueva disponibilidad
   * @returns {Promise<{exito: boolean, mensaje: string}>}
   */
  const cambiarDisponibilidadPlato = useCallback(async (platoId, disponible) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await menuService.cambiarDisponibilidadPlato(platoId, disponible);
      setLoading(false);
      return response;
    } catch (error) {
      setLoading(false);
      setError(error.message);
      return { exito: false, mensaje: error.message };
    }
  }, []);

  /**
   * Actualiza el menú completo
   * @param {Object} nuevoMenu - Nuevo menú
   */
  const actualizarMenu = useCallback((nuevoMenu) => {
    setMenu(nuevoMenu);
  }, []);

  return {
    menu,
    loading,
    error,
    crearPlato,
    cambiarDisponibilidadPlato,
    actualizarMenu
  };
}

/**
 * Hook para gestionar mensajes de notificación
 * @param {number} duration - Duración del mensaje en ms
 * @returns {Object} Estado del mensaje y funciones
 */
export function useMessage(duration = 3000) {
  const [mensaje, setMensaje] = useState(null);
  const timeoutRef = useRef(null);

  /**
   * Muestra un mensaje temporal
   * @param {string} texto - Texto del mensaje
   * @param {string} tipo - Tipo de mensaje (success, error, warning, info)
   */
  const mostrarMensaje = useCallback((texto, tipo = TIPOS_MENSAJE.SUCCESS) => {
    // Limpiar timeout anterior si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Establecer nuevo mensaje
    setMensaje({ texto, tipo });
    
    // Configurar timeout para ocultar mensaje
    timeoutRef.current = setTimeout(() => {
      setMensaje(null);
      timeoutRef.current = null;
    }, duration);
  }, [duration]);

  /**
   * Oculta el mensaje actual
   */
  const ocultarMensaje = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setMensaje(null);
  }, []);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    mensaje,
    mostrarMensaje,
    ocultarMensaje
  };
}