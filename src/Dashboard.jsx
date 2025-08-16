import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, Users, Menu, Settings, AlertCircle, CheckCircle, RefreshCw, Home, Coffee, Plus, X, Save, Eye, EyeOff, Building, Edit2 } from 'lucide-react';

import InfoGeneralTab from './components/restaurant/InfoGeneralTab';
const API_URL = process.env.REACT_APP_API_URL || 'https://backend-2-production-227a.up.railway.app/api';

// Log para debug (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Configuración API:');
  console.log('- API_URL:', API_URL);
  console.log('- REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
  console.log('- NODE_ENV:', process.env.NODE_ENV);
}

function GastroBotDashboard() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [estadoSistema, setEstadoSistema] = useState(null);
  const [archivoEspejo, setArchivoEspejo] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [menu, setMenu] = useState({ categorias: [] });
  const [politicas, setPoliticas] = useState({});
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [modalReserva, setModalReserva] = useState(false);
  const [modalPlato, setModalPlato] = useState(false);
  const [nuevaReserva, setNuevaReserva] = useState({
    nombre: '',
    telefono: '',
    fecha: new Date().toISOString().split('T')[0],
    hora: '13:00',
    personas: 2,
    notas: ''
  });
  const [nuevoPlato, setNuevoPlato] = useState({
    categoria_id: 1,
    nombre: '',
    descripcion: '',
    precio: '',
    disponible: true
  });
  const [modoEdicionInfo, setModoEdicionInfo] = useState(false);
  const [infoEditada, setInfoEditada] = useState({});

  // Cargar estado del sistema
  const cargarEstadoSistema = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/admin/estado-sistema`);
      const data = await response.json();
      if (data.exito) {
        setEstadoSistema(data.estadisticas);
      }
    } catch (error) {
      console.error('Error cargando estado:', error);
    }
  }, []);

  // Cargar archivo espejo
  const cargarArchivoEspejo = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/espejo`);
      const data = await response.json();
      if (data.exito) {
        setArchivoEspejo(data.datos);
        setReservas(data.datos.reservas || []);
        setMesas(data.datos.mesas || []);
        setMenu(data.datos.menu || { categorias: [] });
        setPoliticas(data.datos.politicas || {});
      }
    } catch (error) {
      console.error('Error cargando archivo espejo:', error);
    }
  }, []);

  // Actualizar datos cada 15 segundos
  useEffect(() => {
    cargarEstadoSistema();
    cargarArchivoEspejo();
    
    const interval = setInterval(() => {
      cargarEstadoSistema();
      cargarArchivoEspejo();
    }, 15000);
    
    return () => clearInterval(interval);
  }, [cargarEstadoSistema, cargarArchivoEspejo]);

  // Mostrar mensaje temporal
  const mostrarMensaje = (texto, tipo = 'success') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 3000);
  };

  // Crear nueva reserva
  const crearReserva = async () => {
    setLoading(true);
    try {
      // Primero buscar mesa disponible
      const busquedaResponse = await fetch(`${API_URL}/buscar-mesa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fecha: nuevaReserva.fecha,
          hora: nuevaReserva.hora,
          personas: nuevaReserva.personas
        })
      });
      
      const busquedaData = await busquedaResponse.json();
      
      if (busquedaData.exito && busquedaData.mesa_disponible) {
        // Crear la reserva con la mesa encontrada
        const response = await fetch(`${API_URL}/crear-reserva`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...nuevaReserva,
            mesa_id: busquedaData.mesa_disponible.id
          })
        });
        
        const data = await response.json();
        
        if (data.exito) {
          mostrarMensaje(data.mensaje);
          setModalReserva(false);
          setNuevaReserva({
            nombre: '',
            telefono: '',
            fecha: new Date().toISOString().split('T')[0],
            hora: '13:00',
            personas: 2,
            notas: ''
          });
          cargarArchivoEspejo();
        } else {
          mostrarMensaje(data.mensaje, 'error');
        }
      } else {
        mostrarMensaje('No hay mesas disponibles para esa hora', 'error');
      }
    } catch (error) {
      mostrarMensaje('Error al crear reserva', 'error');
    }
    setLoading(false);
  };

  // Cancelar reserva
  const cancelarReserva = async (id) => {
    if (!window.confirm('¿Seguro que quieres cancelar esta reserva?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/cancelar-reserva/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo: 'Cancelado desde dashboard' })
      });
      
      const data = await response.json();
      
      if (data.exito) {
        mostrarMensaje(data.mensaje);
        cargarArchivoEspejo();
      } else {
        mostrarMensaje(data.mensaje, 'error');
      }
    } catch (error) {
      mostrarMensaje('Error al cancelar reserva', 'error');
    }
    setLoading(false);
  };

  // Crear nuevo plato
  const crearPlato = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/menu/plato`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoPlato)
      });
      
      const data = await response.json();
      
      if (data.exito) {
        mostrarMensaje('Plato creado correctamente');
        setModalPlato(false);
        setNuevoPlato({
          categoria_id: 1,
          nombre: '',
          descripcion: '',
          precio: '',
          disponible: true
        });
        cargarArchivoEspejo();
      } else {
        mostrarMensaje(data.mensaje, 'error');
      }
    } catch (error) {
      mostrarMensaje('Error al crear plato', 'error');
    }
    setLoading(false);
  };

  // Guardar información del restaurante
  const guardarInfoRestaurante = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/restaurante`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(infoEditada)
      });
      
      const data = await response.json();
      
      if (data.exito) {
        mostrarMensaje('Información actualizada correctamente');
        setModoEdicionInfo(false);
        // Actualizar el archivo espejo
        await cargarArchivoEspejo();
      } else {
        mostrarMensaje(data.mensaje || 'Error al actualizar', 'error');
      }
    } catch (error) {
      console.error('Error guardando información:', error);
      mostrarMensaje('Error al guardar los cambios', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Cambiar disponibilidad de plato
  const toggleDisponibilidadPlato = async (platoId, disponibleActual) => {
    try {
      const response = await fetch(`${API_URL}/admin/menu/plato/${platoId}/disponibilidad`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disponible: !disponibleActual })
      });
      
      const data = await response.json();
      
      if (data.exito) {
        mostrarMensaje('Disponibilidad actualizada');
        cargarArchivoEspejo();
      }
    } catch (error) {
      mostrarMensaje('Error al actualizar disponibilidad', 'error');
    }
  };

  // Componente de Estado del Sistema
  const EstadoSistema = () => {
    if (!estadoSistema) return null;
    
    const espejoFresco = estadoSistema.espejo?.edad_segundos <= 30;
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <AlertCircle className="mr-2" />
            Estado del Sistema
          </h2>
          <button
            onClick={() => {
              cargarEstadoSistema();
              cargarArchivoEspejo();
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${espejoFresco ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Archivo Espejo</span>
              {espejoFresco ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
            <p className="text-2xl font-bold mt-2">
              {estadoSistema.espejo?.edad_segundos}s
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {espejoFresco ? 'Datos frescos' : 'Actualización necesaria'}
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-blue-50">
            <span className="text-sm text-gray-600">Reservas Hoy</span>
            <p className="text-2xl font-bold mt-2">{estadoSistema.reservas_hoy}</p>
            <p className="text-xs text-gray-500 mt-1">
              {estadoSistema.mesas_ocupadas}/{estadoSistema.mesas_totales} mesas ocupadas
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-purple-50">
            <span className="text-sm text-gray-600">Ocupación</span>
            <p className="text-2xl font-bold mt-2">
              {Math.round((estadoSistema.mesas_ocupadas / estadoSistema.mesas_totales) * 100)}%
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${(estadoSistema.mesas_ocupadas / estadoSistema.mesas_totales) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Componente de Reservas
  const TabReservas = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Reservas del Día</h2>
          <button
            onClick={() => setModalReserva(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Reserva
          </button>
        </div>
        
        {reservas.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay reservas para hoy</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Hora</th>
                  <th className="text-left py-2">Nombre</th>
                  <th className="text-left py-2">Personas</th>
                  <th className="text-left py-2">Mesa</th>
                  <th className="text-left py-2">Estado</th>
                  <th className="text-left py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map((reserva) => (
                  <tr key={reserva.id} className="border-b hover:bg-gray-50">
                    <td className="py-3">{reserva.hora?.substring(0, 5)}</td>
                    <td className="py-3">
                      <div>
                        <p className="font-medium">{reserva.nombre}</p>
                        <p className="text-sm text-gray-500">{reserva.telefono}</p>
                      </div>
                    </td>
                    <td className="py-3">{reserva.personas}</td>
                    <td className="py-3">Mesa {reserva.mesa_id}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        reserva.estado === 'confirmada' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {reserva.estado}
                      </span>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => cancelarReserva(reserva.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        disabled={loading}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  // Componente del Menú
  const TabMenu = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Gestión del Menú</h2>
          <button
            onClick={() => setModalPlato(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Plato
          </button>
        </div>
        
        {menu.categorias.map((categoria) => (
          <div key={categoria.id} className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">{categoria.nombre}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoria.platos?.map((plato) => (
                <div key={plato.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">{plato.nombre}</h4>
                      <p className="text-sm text-gray-600 mt-1">{plato.descripcion}</p>
                      <div className="flex items-center mt-2">
                        <span className="font-bold text-lg">{plato.precio}€</span>
                        {plato.alergenos?.length > 0 && (
                          <span className="ml-4 text-xs text-gray-500">
                            Alérgenos: {plato.alergenos.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleDisponibilidadPlato(plato.id, plato.disponible)}
                      className={`ml-4 p-2 rounded-lg transition-colors ${
                        plato.disponible
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                    >
                      {plato.disponible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Componente de Mesas
  const TabMesas = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-6">Estado de Mesas</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {mesas.map((mesa) => (
            <div
              key={mesa.id}
              className={`p-4 rounded-lg text-center transition-all ${
                mesa.estado === 'ocupada'
                  ? 'bg-red-100 border-2 border-red-300'
                  : 'bg-green-100 border-2 border-green-300'
              }`}
            >
              <p className="font-bold text-lg">Mesa {mesa.numero_mesa}</p>
              <p className="text-sm mt-1">
                <Users className="w-4 h-4 inline mr-1" />
                {mesa.capacidad} personas
              </p>
              <p className="text-xs mt-2 font-medium">
                {mesa.estado === 'ocupada' ? 'OCUPADA' : 'LIBRE'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Componente de Políticas
  const TabPoliticas = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-6">Políticas del Restaurante</h2>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b">
            <span className="font-medium">Cancelación anticipada</span>
            <span className="text-gray-600">{politicas.cancelacion_horas || 24} horas</span>
          </div>
          
          <div className="flex justify-between items-center py-3 border-b">
            <span className="font-medium">Tiempo de mesa</span>
            <span className="text-gray-600">{politicas.tiempo_mesa_minutos || 120} minutos</span>
          </div>
          
          <div className="flex justify-between items-center py-3 border-b">
            <span className="font-medium">Niños permitidos</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              politicas.niños_permitidos !== false
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {politicas.niños_permitidos !== false ? 'SÍ' : 'NO'}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-3 border-b">
            <span className="font-medium">Mascotas permitidas</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              politicas.mascotas_permitidas
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {politicas.mascotas_permitidas ? 'SÍ' : 'NO'}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-3 border-b">
            <span className="font-medium">Anticipo requerido</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              politicas.anticipo_requerido
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {politicas.anticipo_requerido ? `SÍ - ${politicas.anticipo_cantidad}€` : 'NO'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // Componente de Archivo Espejo
  const TabArchivoEspejo = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Archivo Espejo (Vista Técnica)</h2>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm ${
              archivoEspejo?.edad_segundos <= 30
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {archivoEspejo?.edad_segundos}s de antigüedad
            </span>
            <button
              onClick={cargarArchivoEspejo}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-96">
          <pre className="text-xs font-mono">
            {JSON.stringify(archivoEspejo, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Coffee className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">GastroBot Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {new Date().toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            
              {[
      { id: 'inicio', icon: Home, label: 'Inicio' },
      { id: 'info', icon: Building, label: 'Información' },
      { id: 'reservas', icon: Calendar, label: 'Reservas' },
      { id: 'mesas', icon: Users, label: 'Mesas' },
      { id: 'menu', icon: Menu, label: 'Menú' },
      { id: 'politicas', icon: Settings, label: 'Políticas' },
      { id: 'espejo', icon: Eye, label: 'Archivo Espejo' }

            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === item.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mensajes */}
        {mensaje && (
          <div className={`mb-4 p-4 rounded-lg flex items-center ${
            mensaje.tipo === 'success' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {mensaje.tipo === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            {mensaje.texto}
          </div>
        )}

        {/* Contenido por Tab */}
        {/* Contenido por Tab */}
        {activeTab === 'inicio' && (
          <div className="space-y-6">
            <EstadoSistema />
            
            {/* Próximas Reservas */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Próximas Reservas</h2>
              {estadoSistema?.proximas_reservas?.length > 0 ? (
                <div className="space-y-3">
                  {estadoSistema.proximas_reservas.map((reserva, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-3 text-gray-500" />
                        <div>
                          <p className="font-medium">{reserva.nombre}</p>
                          <p className="text-sm text-gray-500">
                            {reserva.fecha} - {reserva.hora?.substring(0, 5)} - {reserva.personas} personas
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-blue-600">
                        Mesa {reserva.mesa_id}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No hay reservas próximas</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'info' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Header con botón de editar/guardar */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Información General del Restaurante</h2>
                <div className="flex space-x-2">
                  {modoEdicionInfo ? (
                    <>
                      <button
                        onClick={() => {
                          setInfoEditada(archivoEspejo?.restaurante || {});
                          setModoEdicionInfo(false);
                        }}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 inline mr-2" />
                        Cancelar
                      </button>
                      <button
                        onClick={guardarInfoRestaurante}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Guardar Cambios
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setModoEdicionInfo(true);
                        setInfoEditada(archivoEspejo?.restaurante || {});
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit2 className="w-4 h-4 inline mr-2" />
                      Editar Información
                    </button>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Datos Básicos</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Restaurante
                      </label>
                      {modoEdicionInfo ? (
                        <input
                          type="text"
                          value={infoEditada.nombre || ''}
                          onChange={(e) => setInfoEditada({...infoEditada, nombre: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nombre del restaurante"
                        />
                      ) : (
                        <p className="py-2 px-3 bg-gray-50 rounded-lg">
                          {archivoEspejo?.restaurante?.nombre || 'No especificado'}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Cocina
                      </label>
                      {modoEdicionInfo ? (
                        <input
                          type="text"
                          value={infoEditada.tipo_cocina || ''}
                          onChange={(e) => setInfoEditada({...infoEditada, tipo_cocina: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ej: Mediterránea, Italiana, Fusión..."
                        />
                      ) : (
                        <p className="py-2 px-3 bg-gray-50 rounded-lg">
                          {archivoEspejo?.restaurante?.tipo_cocina || 'No especificado'}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dirección Completa
                      </label>
                      {modoEdicionInfo ? (
                        <input
                          type="text"
                          value={infoEditada.direccion || ''}
                          onChange={(e) => setInfoEditada({...infoEditada, direccion: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Calle, número, ciudad"
                        />
                      ) : (
                        <p className="py-2 px-3 bg-gray-50 rounded-lg">
                          {archivoEspejo?.restaurante?.direccion || 'No especificado'}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono de Contacto
                      </label>
                      {modoEdicionInfo ? (
                        <input
                          type="tel"
                          value={infoEditada.telefono || ''}
                          onChange={(e) => setInfoEditada({...infoEditada, telefono: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="+34 900 000 000"
                        />
                      ) : (
                        <p className="py-2 px-3 bg-gray-50 rounded-lg">
                          {archivoEspejo?.restaurante?.telefono || 'No especificado'}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email de Contacto
                      </label>
                      {modoEdicionInfo ? (
                        <input
                          type="email"
                          value={infoEditada.email || ''}
                          onChange={(e) => setInfoEditada({...infoEditada, email: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="info@restaurante.com"
                        />
                      ) : (
                        <p className="py-2 px-3 bg-gray-50 rounded-lg">
                          {archivoEspejo?.restaurante?.email || 'No especificado'}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sitio Web Oficial
                      </label>
                      {modoEdicionInfo ? (
                        <input
                          type="url"
                          value={infoEditada.web || ''}
                          onChange={(e) => setInfoEditada({...infoEditada, web: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="www.restaurante.com"
                        />
                      ) : (
                        <p className="py-2 px-3 bg-gray-50 rounded-lg">
                          {archivoEspejo?.restaurante?.web || 'No especificado'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Redes Sociales</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Facebook
                      </label>
                      {modoEdicionInfo ? (
                        <div className="flex">
                          <span className="px-3 py-2 bg-gray-100 border border-r-0 rounded-l-lg text-gray-500">
                            facebook.com/
                          </span>
                          <input
                            type="text"
                            value={infoEditada.facebook || ''}
                            onChange={(e) => setInfoEditada({...infoEditada, facebook: e.target.value})}
                            className="flex-1 px-3 py-2 border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="mirestaurante"
                          />
                        </div>
                      ) : (
                        <p className="py-2 px-3 bg-gray-50 rounded-lg">
                          {archivoEspejo?.restaurante?.facebook ? 
                            `facebook.com/${archivoEspejo.restaurante.facebook}` : 
                            'No especificado'}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Instagram
                      </label>
                      {modoEdicionInfo ? (
                        <div className="flex">
                          <span className="px-3 py-2 bg-gray-100 border border-r-0 rounded-l-lg text-gray-500">
                            @
                          </span>
                          <input
                            type="text"
                            value={infoEditada.instagram || ''}
                            onChange={(e) => setInfoEditada({...infoEditada, instagram: e.target.value})}
                            className="flex-1 px-3 py-2 border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="mirestaurante"
                          />
                        </div>
                      ) : (
                        <p className="py-2 px-3 bg-gray-50 rounded-lg">
                          {archivoEspejo?.restaurante?.instagram ? 
                            `@${archivoEspejo.restaurante.instagram}` : 
                            'No especificado'}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Twitter / X
                      </label>
                      {modoEdicionInfo ? (
                        <div className="flex">
                          <span className="px-3 py-2 bg-gray-100 border border-r-0 rounded-l-lg text-gray-500">
                            @
                          </span>
                          <input
                            type="text"
                            value={infoEditada.twitter || ''}
                            onChange={(e) => setInfoEditada({...infoEditada, twitter: e.target.value})}
                            className="flex-1 px-3 py-2 border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="mirestaurante"
                          />
                        </div>
                      ) : (
                        <p className="py-2 px-3 bg-gray-50 rounded-lg">
                          {archivoEspejo?.restaurante?.twitter ? 
                            `@${archivoEspejo.restaurante.twitter}` : 
                            'No especificado'}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        TripAdvisor
                      </label>
                      {modoEdicionInfo ? (
                        <input
                          type="url"
                          value={infoEditada.tripadvisor || ''}
                          onChange={(e) => setInfoEditada({...infoEditada, tripadvisor: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="URL del perfil en TripAdvisor"
                        />
                      ) : (
                        <p className="py-2 px-3 bg-gray-50 rounded-lg">
                          {archivoEspejo?.restaurante?.tripadvisor || 'No especificado'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Descripción del Restaurante</h3>
                {modoEdicionInfo ? (
                  <textarea
                    value={infoEditada.descripcion || ''}
                    onChange={(e) => setInfoEditada({...infoEditada, descripcion: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    placeholder="Describe tu restaurante, el tipo de cocina, el ambiente..."
                  />
                ) : (
                  <p className="py-3 px-3 bg-gray-50 rounded-lg">
                    {archivoEspejo?.restaurante?.descripcion || 'No hay descripción disponible'}
                  </p>
                )}
              </div>
              
              {/* Vista previa */}
              {!modoEdicionInfo && archivoEspejo?.restaurante && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">
                    Vista previa en el Bot:
                  </h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>📍 <strong>{archivoEspejo.restaurante.nombre}</strong></p>
                    {archivoEspejo.restaurante.tipo_cocina && <p>🍴 {archivoEspejo.restaurante.tipo_cocina}</p>}
                    {archivoEspejo.restaurante.direccion && <p>📍 {archivoEspejo.restaurante.direccion}</p>}
                    {archivoEspejo.restaurante.telefono && <p>📞 {archivoEspejo.restaurante.telefono}</p>}
                    {archivoEspejo.restaurante.email && <p>📧 {archivoEspejo.restaurante.email}</p>}
                    {archivoEspejo.restaurante.web && <p>🌐 {archivoEspejo.restaurante.web}</p>}
                    {archivoEspejo.restaurante.instagram && <p>📸 Instagram: @{archivoEspejo.restaurante.instagram}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reservas' && <TabReservas />}
        {activeTab === 'mesas' && <TabMesas />}
        {activeTab === 'menu' && <TabMenu />}
        {activeTab === 'politicas' && <TabPoliticas />}
        {activeTab === 'espejo' && <TabArchivoEspejo />}
   </main>

      {/* Modal Nueva Reserva */}
      {modalReserva && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Nueva Reserva</h3>
              <button
                onClick={() => setModalReserva(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  value={nuevaReserva.nombre}
                  onChange={(e) => setNuevaReserva({...nuevaReserva, nombre: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre del cliente"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={nuevaReserva.telefono}
                  onChange={(e) => setNuevaReserva({...nuevaReserva, telefono: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+34 600 000 000"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha</label>
                  <input
                    type="date"
                    value={nuevaReserva.fecha}
                    onChange={(e) => setNuevaReserva({...nuevaReserva, fecha: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Hora</label>
                  <input
                    type="time"
                    value={nuevaReserva.hora}
                    onChange={(e) => setNuevaReserva({...nuevaReserva, hora: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Personas</label>
                <select
                  value={nuevaReserva.personas}
                  onChange={(e) => setNuevaReserva({...nuevaReserva, personas: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Notas (opcional)</label>
                <textarea
                  value={nuevaReserva.notas}
                  onChange={(e) => setNuevaReserva({...nuevaReserva, notas: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Alergias, celebraciones, preferencias..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setModalReserva(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={crearReserva}
                disabled={loading || !nuevaReserva.nombre || !nuevaReserva.telefono}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Crear Reserva
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Plato */}
      {modalPlato && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Nuevo Plato</h3>
              <button
                onClick={() => setModalPlato(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Categoría</label>
                <select
                  value={nuevoPlato.categoria_id}
                  onChange={(e) => setNuevoPlato({...nuevoPlato, categoria_id: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {menu.categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del Plato</label>
                <input
                  type="text"
                  value={nuevoPlato.nombre}
                  onChange={(e) => setNuevoPlato({...nuevoPlato, nombre: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ej: Paella Valenciana"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  value={nuevoPlato.descripcion}
                  onChange={(e) => setNuevoPlato({...nuevoPlato, descripcion: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                  placeholder="Descripción breve del plato..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Precio (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={nuevoPlato.precio}
                  onChange={(e) => setNuevoPlato({...nuevoPlato, precio: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="12.50"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="disponible"
                  checked={nuevoPlato.disponible}
                  onChange={(e) => setNuevoPlato({...nuevoPlato, disponible: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="disponible" className="text-sm font-medium">
                  Disponible inmediatamente
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setModalPlato(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={crearPlato}
                disabled={loading || !nuevoPlato.nombre || !nuevoPlato.precio}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Crear Plato
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GastroBotDashboard;