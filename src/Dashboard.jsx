/**
 * @fileoverview Componente principal del Dashboard de GastroBot
 * Orquesta todos los componentes y servicios de la aplicación
 */

import React, { useState, useEffect } from 'react';
import { useSystemData, useReservations, useMenu, useMessage } from './hooks/useSystemData';
import { NAVIGATION_TABS, UI_CONFIG, SYSTEM_MESSAGES, TIPOS_MENSAJE } from './services/utils/constants';
import { DEFAULT_NUEVA_RESERVA, DEFAULT_NUEVO_PLATO } from './types';

// Componentes de UI
import Header from './components/common/Header';
import Navigation from './components/common/Navigation';
import Message from './components/common/Message';

// Componentes de tabs
import InicioTab from './components/dashboard/InicioTab';
import ReservasTab from './components/reservations/ReservasTab';
import MesasTab from './components/tables/MesasTab';
import MenuTab from './components/menu/MenuTab';
import PoliticasTab from './components/policies/PoliticasTab';
import ArchivoEspejoTab from './components/mirror/ArchivoEspejoTab';

// Modales
import ReservaModal from './components/reservations/ReservaModal';
import PlatoModal from './components/menu/PlatoModal';

/**
 * Componente principal del Dashboard
 * @returns {JSX.Element} Dashboard completo
 */
function GastroBotDashboard() {
  // Estado de navegación
  const [activeTab, setActiveTab] = useState('inicio');
  
  // Estado de modales
  const [modalReserva, setModalReserva] = useState(false);
  const [modalPlato, setModalPlato] = useState(false);
  
  // Estado de formularios
  const [nuevaReserva, setNuevaReserva] = useState(DEFAULT_NUEVA_RESERVA);
  const [nuevoPlato, setNuevoPlato] = useState(DEFAULT_NUEVO_PLATO);
  
  // Custom hooks para datos
  const {
    estadoSistema,
    archivoEspejo,
    actualizarDatos,
    cargarArchivoEspejo
  } = useSystemData();
  
  const {
    reservas,
    loading: loadingReservas,
    crearReserva,
    cancelarReserva,
    actualizarReservas
  } = useReservations();
  
  const {
    menu,
    loading: loadingMenu,
    crearPlato,
    cambiarDisponibilidadPlato,
    actualizarMenu
  } = useMenu();
  
  const { mensaje, mostrarMensaje } = useMessage(UI_CONFIG.MESSAGE_DURATION);
  
  // Estado derivado
  const [mesas, setMesas] = useState([]);
  const [politicas, setPoliticas] = useState({});
  const loading = loadingReservas || loadingMenu;
  
  // Actualizar datos derivados cuando cambia el archivo espejo
  useEffect(() => {
    if (archivoEspejo) {
      actualizarReservas(archivoEspejo.reservas || []);
      setMesas(archivoEspejo.mesas || []);
      actualizarMenu(archivoEspejo.menu || { categorias: [] });
      setPoliticas(archivoEspejo.politicas || {});
    }
  }, [archivoEspejo, actualizarReservas, actualizarMenu]);
  
  /**
   * Maneja la creación de una nueva reserva
   */
  const handleCrearReserva = async () => {
    const resultado = await crearReserva(nuevaReserva);
    
    if (resultado.exito) {
      mostrarMensaje(resultado.mensaje || SYSTEM_MESSAGES.RESERVATION_CREATED);
      setModalReserva(false);
      setNuevaReserva(DEFAULT_NUEVA_RESERVA);
      await cargarArchivoEspejo();
    } else {
      mostrarMensaje(
        resultado.mensaje || SYSTEM_MESSAGES.NO_TABLES_AVAILABLE,
        TIPOS_MENSAJE.ERROR
      );
    }
  };
  
  /**
   * Maneja la cancelación de una reserva
   * @param {number} id - ID de la reserva
   */
  const handleCancelarReserva = async (id) => {
    if (!window.confirm(SYSTEM_MESSAGES.CONFIRM_CANCEL)) return;
    
    const resultado = await cancelarReserva(id, 'Cancelado desde dashboard');
    
    if (resultado.exito) {
      mostrarMensaje(resultado.mensaje || SYSTEM_MESSAGES.RESERVATION_CANCELLED);
      await cargarArchivoEspejo();
    } else {
      mostrarMensaje(resultado.mensaje, TIPOS_MENSAJE.ERROR);
    }
  };
  
  /**
   * Maneja la creación de un nuevo plato
   */
  const handleCrearPlato = async () => {
    const resultado = await crearPlato(nuevoPlato);
    
    if (resultado.exito) {
      mostrarMensaje(SYSTEM_MESSAGES.DISH_CREATED);
      setModalPlato(false);
      setNuevoPlato(DEFAULT_NUEVO_PLATO);
      await cargarArchivoEspejo();
    } else {
      mostrarMensaje(resultado.mensaje, TIPOS_MENSAJE.ERROR);
    }
  };
  
  /**
   * Maneja el cambio de disponibilidad de un plato
   * @param {number} platoId - ID del plato
   * @param {boolean} disponibleActual - Disponibilidad actual
   */
  const handleToggleDisponibilidadPlato = async (platoId, disponibleActual) => {
    const resultado = await cambiarDisponibilidadPlato(platoId, !disponibleActual);
    
    if (resultado.exito) {
      mostrarMensaje(SYSTEM_MESSAGES.DISH_UPDATED);
      await cargarArchivoEspejo();
    } else {
      mostrarMensaje(resultado.mensaje, TIPOS_MENSAJE.ERROR);
    }
  };
  
  /**
   * Renderiza el contenido del tab activo
   * @returns {JSX.Element} Contenido del tab
   */
  const renderTabContent = () => {
    switch (activeTab) {
      case 'inicio':
        return (
          <InicioTab
            estadoSistema={estadoSistema}
            onRefresh={actualizarDatos}
          />
        );
      
      case 'reservas':
        return (
          <ReservasTab
            reservas={reservas}
            loading={loading}
            onNuevaReserva={() => setModalReserva(true)}
            onCancelarReserva={handleCancelarReserva}
          />
        );
      
      case 'mesas':
        return <MesasTab mesas={mesas} />;
      
      case 'menu':
        return (
          <MenuTab
            menu={menu}
            onNuevoPlato={() => setModalPlato(true)}
            onToggleDisponibilidad={handleToggleDisponibilidadPlato}
          />
        );
      
      case 'politicas':
        return <PoliticasTab politicas={politicas} />;
      
      case 'espejo':
        return (
          <ArchivoEspejoTab
            archivoEspejo={archivoEspejo}
            onRefresh={cargarArchivoEspejo}
          />
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header />
      
      {/* Navigation */}
      <Navigation
        tabs={NAVIGATION_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mensajes */}
        {mensaje && (
          <Message
            texto={mensaje.texto}
            tipo={mensaje.tipo}
            onClose={() => mostrarMensaje(null)}
          />
        )}
        
        {/* Contenido del Tab Activo */}
        {renderTabContent()}
      </main>
      
      {/* Modal Nueva Reserva */}
      {modalReserva && (
        <ReservaModal
          reserva={nuevaReserva}
          onChange={setNuevaReserva}
          onConfirm={handleCrearReserva}
          onCancel={() => {
            setModalReserva(false);
            setNuevaReserva(DEFAULT_NUEVA_RESERVA);
          }}
          loading={loading}
        />
      )}
      
      {/* Modal Nuevo Plato */}
      {modalPlato && (
        <PlatoModal
          plato={nuevoPlato}
          categorias={menu.categorias}
          onChange={setNuevoPlato}
          onConfirm={handleCrearPlato}
          onCancel={() => {
            setModalPlato(false);
            setNuevoPlato(DEFAULT_NUEVO_PLATO);
          }}
          loading={loading}
        />
      )}
    </div>
  );
}

export default GastroBotDashboard;