/**
 * @fileoverview Hook personalizado para gestión de reservas
 * Maneja el estado y operaciones relacionadas con reservas
 */

import { useState, useCallback } from 'react';
import reservationService from '../services/api/reservationService';

/**
 * Hook para gestionar reservas
 * @returns {Object} Estado y funciones para manejar reservas
 */
export function useReservations() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);

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
      
      if (response.exito && response.reserva) {
        // Añadir la nueva reserva a la lista
        setReservas(prev => [...prev, response.reserva]);
      }
      
      setLoading(false);
      return response;
    } catch (error) {
      setLoading(false);
      setError(error.message);
      return { exito: false, mensaje: error.message };
    }
  }, []);

  /**
   * Cancela una reserva existente
   * @param {number} reservaId - ID de la reserva
   * @param {string} [motivo] - Motivo de cancelación
   * @returns {Promise<{exito: boolean, mensaje: string}>}
   */
  const cancelarReserva = useCallback(async (reservaId, motivo = 'Cancelado desde dashboard') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await reservationService.cancelarReserva(reservaId, motivo);
      
      if (response.exito) {
        // Actualizar el estado de la reserva en la lista
        setReservas(prev => prev.map(r => 
          r.id === reservaId 
            ? { ...r, estado: 'cancelada' }
            : r
        ));
      }
      
      setLoading(false);
      return response;
    } catch (error) {
      setLoading(false);
      setError(error.message);
      return { exito: false, mensaje: error.message };
    }
  }, []);

  /**
   * Modifica una reserva existente
   * @param {number} reservaId - ID de la reserva
   * @param {Object} cambios - Cambios a aplicar
   * @returns {Promise<{exito: boolean, mensaje: string}>}
   */
  const modificarReserva = useCallback(async (reservaId, cambios) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await reservationService.modificarReserva(reservaId, cambios);
      
      if (response.exito && response.reserva) {
        // Actualizar la reserva en la lista
        setReservas(prev => prev.map(r => 
          r.id === reservaId ? response.reserva : r
        ));
      }
      
      setLoading(false);
      return response;
    } catch (error) {
      setLoading(false);
      setError(error.message);
      return { exito: false, mensaje: error.message };
    }
  }, []);

  /**
   * Confirma una reserva pendiente
   * @param {number} reservaId - ID de la reserva
   * @returns {Promise<{exito: boolean, mensaje: string}>}
   */
  const confirmarReserva = useCallback(async (reservaId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await reservationService.confirmarReserva(reservaId);
      
      if (response.exito) {
        // Actualizar el estado de la reserva
        setReservas(prev => prev.map(r => 
          r.id === reservaId 
            ? { ...r, estado: 'confirmada' }
            : r
        ));
      }
      
      setLoading(false);
      return response;
    } catch (error) {
      setLoading(false);
      setError(error.message);
      return { exito: false, mensaje: error.message };
    }
  }, []);

  /**
   * Carga las reservas de una fecha específica
   * @param {string} fecha - Fecha en formato YYYY-MM-DD
   */
  const cargarReservasPorFecha = useCallback(async (fecha) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await reservationService.obtenerReservasPorFecha(fecha);
      
      if (response.exito) {
        setReservas(response.reservas);
      }
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  }, []);

  /**
   * Actualiza la lista de reservas
   * @param {Array} nuevasReservas - Nueva lista de reservas
   */
  const actualizarReservas = useCallback((nuevasReservas) => {
    setReservas(nuevasReservas);
  }, []);

  /**
   * Selecciona una reserva
   * @param {Object} reserva - Reserva a seleccionar
   */
  const seleccionarReserva = useCallback((reserva) => {
    setReservaSeleccionada(reserva);
  }, []);

  /**
   * Limpia el error actual
   */
  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Filtra reservas por estado
   * @param {string} estado - Estado a filtrar
   * @returns {Array} Reservas filtradas
   */
  const filtrarPorEstado = useCallback((estado) => {
    if (!estado || estado === 'todas') return reservas;
    return reservas.filter(r => r.estado === estado);
  }, [reservas]);

  /**
   * Obtiene estadísticas de las reservas
   * @returns {Object} Estadísticas
   */
  const obtenerEstadisticas = useCallback(() => {
    const total = reservas.length;
    const confirmadas = reservas.filter(r => r.estado === 'confirmada').length;
    const pendientes = reservas.filter(r => r.estado === 'pendiente').length;
    const canceladas = reservas.filter(r => r.estado === 'cancelada').length;
    const totalPersonas = reservas.reduce((sum, r) => sum + (r.personas || 0), 0);
    
    return {
      total,
      confirmadas,
      pendientes,
      canceladas,
      totalPersonas,
      porcentajeOcupacion: total > 0 ? Math.round((confirmadas / total) * 100) : 0
    };
  }, [reservas]);

  return {
    // Estado
    reservas,
    loading,
    error,
    reservaSeleccionada,
    
    // Acciones
    crearReserva,
    cancelarReserva,
    modificarReserva,
    confirmarReserva,
    cargarReservasPorFecha,
    actualizarReservas,
    seleccionarReserva,
    limpiarError,
    
    // Utilidades
    filtrarPorEstado,
    obtenerEstadisticas
  };
}

export default useReservations;