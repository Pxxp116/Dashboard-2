/**
 * @fileoverview Context global de la aplicación
 * Provee estado y funciones compartidas a todos los componentes
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import systemService from '../services/api/systemService';
import mirrorService from '../services/api/mirrorService';
import { UPDATE_INTERVALS } from '../services/utils/constants';

/**
 * Context de la aplicación
 */
const AppContext = createContext(null);

/**
 * Hook para usar el context de la aplicación
 * @returns {Object} Contexto de la aplicación
 */
export function useAppContext() {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useAppContext debe ser usado dentro de AppProvider');
  }
  
  return context;
}

/**
 * Provider del contexto de la aplicación
 * @param {Object} props - Props del componente
 * @param {React.ReactNode} props.children - Componentes hijos
 * @returns {JSX.Element} Provider con el contexto
 */
export function AppProvider({ children }) {
  // Estado global
  const [usuario, setUsuario] = useState(null);
  const [configuracion, setConfiguracion] = useState({
    tema: 'light',
    idioma: 'es',
    notificaciones: true,
    actualizacionAutomatica: true
  });
  const [estadoGlobal, setEstadoGlobal] = useState({
    cargando: false,
    error: null,
    ultimaActualizacion: null
  });
  const [datosEspejo, setDatosEspejo] = useState(null);

  /**
   * Actualiza los datos del espejo
   */
  const actualizarDatosEspejo = useCallback(async () => {
    try {
      setEstadoGlobal(prev => ({ ...prev, cargando: true }));
      
      const response = await mirrorService.obtenerArchivoEspejo();
      
      if (response.exito) {
        setDatosEspejo(response.datos);
        setEstadoGlobal(prev => ({
          ...prev,
          cargando: false,
          error: null,
          ultimaActualizacion: new Date()
        }));
      }
    } catch (error) {
      setEstadoGlobal(prev => ({
        ...prev,
        cargando: false,
        error: error.message
      }));
    }
  }, []);

  /**
   * Cambia la configuración
   * @param {string} clave - Clave de configuración
   * @param {any} valor - Nuevo valor
   */
  const cambiarConfiguracion = useCallback((clave, valor) => {
    setConfiguracion(prev => ({
      ...prev,
      [clave]: valor
    }));
    
    // Guardar en localStorage
    const nuevaConfig = { ...configuracion, [clave]: valor };
    localStorage.setItem('gastrobot_config', JSON.stringify(nuevaConfig));
  }, [configuracion]);

  /**
   * Inicia sesión del usuario
   * @param {Object} datosUsuario - Datos del usuario
   */
  const iniciarSesion = useCallback((datosUsuario) => {
    setUsuario(datosUsuario);
    localStorage.setItem('gastrobot_usuario', JSON.stringify(datosUsuario));
  }, []);

  /**
   * Cierra la sesión del usuario
   */
  const cerrarSesion = useCallback(() => {
    setUsuario(null);
    localStorage.removeItem('gastrobot_usuario');
  }, []);

  /**
   * Resetea el estado de error
   */
  const limpiarError = useCallback(() => {
    setEstadoGlobal(prev => ({ ...prev, error: null }));
  }, []);

  // Cargar configuración inicial
  useEffect(() => {
    // Cargar configuración de localStorage
    const configGuardada = localStorage.getItem('gastrobot_config');
    if (configGuardada) {
      try {
        setConfiguracion(JSON.parse(configGuardada));
      } catch (error) {
        console.error('Error cargando configuración:', error);
      }
    }

    // Cargar usuario de localStorage
    const usuarioGuardado = localStorage.getItem('gastrobot_usuario');
    if (usuarioGuardado) {
      try {
        setUsuario(JSON.parse(usuarioGuardado));
      } catch (error) {
        console.error('Error cargando usuario:', error);
      }
    }

    // Cargar datos iniciales
    actualizarDatosEspejo();
  }, [actualizarDatosEspejo]);

  // Configurar actualización automática
  useEffect(() => {
    if (!configuracion.actualizacionAutomatica) return;

    const intervalo = setInterval(() => {
      actualizarDatosEspejo();
    }, UPDATE_INTERVALS.SYSTEM_STATUS);

    return () => clearInterval(intervalo);
  }, [configuracion.actualizacionAutomatica, actualizarDatosEspejo]);

  // Valor del contexto
  const contextValue = {
    // Estado
    usuario,
    configuracion,
    estadoGlobal,
    datosEspejo,
    
    // Acciones
    iniciarSesion,
    cerrarSesion,
    cambiarConfiguracion,
    actualizarDatosEspejo,
    limpiarError,
    
    // Utilidades
    estaAutenticado: !!usuario,
    espejoFresco: datosEspejo?.edad_segundos <= UPDATE_INTERVALS.MAX_MIRROR_AGE
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export default AppContext;