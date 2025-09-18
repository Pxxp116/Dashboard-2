import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Menu,
  Settings,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Home,
  Coffee,
  Plus,
  X,
  Save,
  Eye,
  EyeOff,
  Building,
  Edit2,
  ShoppingBag,
  BarChart3,
  Bell,
  User
} from 'lucide-react';

// Componentes de la UI moderna
import ThemeSwitcher from './components/theme/ThemeSwitcher';
import { useTheme } from './context/ThemeContext';
import DashboardLayout from './components/layout/DashboardLayout';
import Inicio from './pages/Inicio';

// Componentes de las páginas
import MesasTab from './components/tables/MesasTab';
import PoliciesTab from './components/policies/PoliciesTab';
import MenuTab from './components/menu/MenuTab';
import HorariosTab from './components/schedules/HorariosTab';
import ReservasTab from './components/reservations/ReservasTab';
import PedidosTab from './components/orders/PedidosTab';
import { useAppContext } from './context/AppContext';

// Importar configuración dinámica y features
import { getApiConfig, useFeatures, logFeatureConfig } from './config/features';

// Configuración dinámica de API
const apiConfig = getApiConfig();
const API_URL = apiConfig.BASE_URL;

// Log para debug (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  logFeatureConfig();
}

function GastroBotDashboard() {
  const { datosEspejo, actualizarDatosEspejo } = useAppContext();
  const { features } = useFeatures();
  const [activeTab, setActiveTab] = useState('inicio');
  const [estadoSistema, setEstadoSistema] = useState(null);
  // Obtener datos del contexto
  const reservas = datosEspejo?.reservas || [];
  const mesas = datosEspejo?.mesas || [];
  const menu = datosEspejo?.menu || { categorias: [] };
  const politicas = datosEspejo?.politicas || {};
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
      if (process.env.NODE_ENV === 'development') {
        console.error('Error cargando estado:', error);
      }
    }
  }, []);


  // Actualizar datos cada 15 segundos
  useEffect(() => {
    cargarEstadoSistema();
    actualizarDatosEspejo(); // Actualizar datos del contexto
    
    const interval = setInterval(() => {
      cargarEstadoSistema();
      actualizarDatosEspejo(); // Actualizar datos del contexto
    }, 15000);
    
    return () => clearInterval(interval);
  }, [cargarEstadoSistema, actualizarDatosEspejo]);

  // Mostrar mensaje temporal
  const mostrarMensaje = (texto, tipo = 'success') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 3000);
  };

  // Crear nueva reserva
  const crearReserva = async () => {
    setLoading(true);
    try {
      // CRÍTICO: Obtener duración actual de políticas antes de buscar mesa
      const duracionResponse = await fetch(`${API_URL}/admin/datos-completos`);
      const datosCompletos = await duracionResponse.json();
      const duracionActual = datosCompletos?.politicas?.tiempo_mesa_minutos || 120;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`📊 [DASHBOARD] Usando duración actualizada: ${duracionActual} minutos`);
      }
      
      // Primero buscar mesa disponible con duración específica
      const busquedaResponse = await fetch(`${API_URL}/buscar-mesa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fecha: nuevaReserva.fecha,
          hora: nuevaReserva.hora,
          personas: nuevaReserva.personas,
          duracion: duracionActual
        })
      });
      
      const busquedaData = await busquedaResponse.json();
      
      if (busquedaData.exito && busquedaData.mesa_disponible) {
        // Crear la reserva con la mesa encontrada y duración específica
        const response = await fetch(`${API_URL}/crear-reserva`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...nuevaReserva,
            mesa_id: busquedaData.mesa_disponible.id,
            duracion: duracionActual
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
          actualizarDatosEspejo();
        } else {
          mostrarMensaje(data.mensaje, 'error');
        }
      } else {
        // Mostrar alternativas si están disponibles
        let mensaje = 'No hay mesas disponibles para esa hora';
        if (busquedaData.alternativas && busquedaData.alternativas.length > 0) {
          const primeraAlternativa = busquedaData.alternativas[0];
          mensaje += `. Horarios disponibles: ${primeraAlternativa.hora}`;
          if (busquedaData.alternativas.length > 1) {
            mensaje += `, ${busquedaData.alternativas[1].hora}`;
          }
        }
        mostrarMensaje(mensaje, 'error');
      }
    } catch (error) {
      mostrarMensaje('Error al crear reserva', 'error');
    }
    setLoading(false);
  };

  // Cancelar reserva (cambiar estado a cancelada)
  const cancelarReserva = async (id) => {
    if (!window.confirm('¿Seguro que quieres cancelar esta reserva?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/cancelar-reserva/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo: 'Cancelado desde dashboard' })
      });
      
      const data = await response.json();
      
      if (data.exito) {
        mostrarMensaje(data.mensaje);
        actualizarDatosEspejo();
      } else {
        mostrarMensaje(data.mensaje, 'error');
      }
    } catch (error) {
      mostrarMensaje('Error al cancelar reserva', 'error');
    }
    setLoading(false);
  };

  // Eliminar reserva completamente
  const eliminarReserva = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/cancelar-reserva/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo: 'Eliminado desde dashboard' })
      });
      
      const data = await response.json();
      
      if (data.exito) {
        mostrarMensaje(data.mensaje);
        actualizarDatosEspejo();
      } else {
        mostrarMensaje(data.mensaje, 'error');
      }
    } catch (error) {
      mostrarMensaje('Error al eliminar reserva', 'error');
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
        actualizarDatosEspejo();
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
        await actualizarDatosEspejo();
      } else {
        mostrarMensaje(data.mensaje || 'Error al actualizar', 'error');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error guardando información:', error);
      }
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
        actualizarDatosEspejo();
      }
    } catch (error) {
      mostrarMensaje('Error al actualizar disponibilidad', 'error');
    }
  };

  // Componente de Estado del Sistema con glassmorphism moderno
  const EstadoSistema = () => {
    if (!estadoSistema) return (
      <div className="grid-stats">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="loading-skeleton h-32"></div>
        ))}
      </div>
    );

    const estadisticas = [
      {
        title: 'Reservas Hoy',
        value: estadoSistema.reservas_hoy || 0,
        subtitle: `${estadoSistema.mesas_ocupadas || 0}/${estadoSistema.mesas_totales || 0} mesas ocupadas`,
        icon: Calendar,
        trend: estadoSistema.reservas_hoy > (estadoSistema.reservas_ayer || 0) ? 'positive' : 'neutral',
        change: estadoSistema.reservas_ayer ? `+${estadoSistema.reservas_hoy - (estadoSistema.reservas_ayer || 0)}` : null
      },
      {
        title: 'Ocupación Actual',
        value: `${Math.round((estadoSistema.mesas_ocupadas / estadoSistema.mesas_totales) * 100) || 0}%`,
        subtitle: 'Capacidad utilizada',
        icon: Users,
        trend: (estadoSistema.mesas_ocupadas / estadoSistema.mesas_totales) > 0.7 ? 'positive' : 'neutral'
      },
      {
        title: 'Próximas Reservas',
        value: estadoSistema.proximas_reservas?.length || 0,
        subtitle: 'En las próximas 2 horas',
        icon: Clock,
        trend: 'neutral'
      },
      {
        title: 'Ingresos Estimados',
        value: `€${(estadoSistema.ingresos_estimados || 0).toFixed(0)}`,
        subtitle: 'Hoy',
        icon: BarChart3,
        trend: 'positive'
      }
    ];

    return (
      <div className="grid-stats">
        {estadisticas.map((stat, index) => (
          <div
            key={index}
            className="stats-card group animate-scale-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Icon */}
            <div className="stats-icon">
              <stat.icon className="w-6 h-6 text-white" />
            </div>

            {/* Content */}
            <div className="stats-content">
              <div className="stats-title">{stat.value}</div>
              <div className="stats-label">{stat.title}</div>
              <div className="text-xs text-slate-500 mt-1">{stat.subtitle}</div>
            </div>

            {/* Trend */}
            {stat.change && (
              <div className={`stats-change ${stat.trend}`}>
                {stat.change}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };



  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      features={features}
    >
        {/* Mensajes Glassmorphism */}
        {mensaje && (
          <div className={`toast ${mensaje.tipo} mb-6 animate-slide-up`}>
            <div className="flex items-center">
              {mensaje.tipo === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-3" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-3" />
              )}
              <span className="font-medium">{mensaje.texto}</span>
            </div>
          </div>
        )}

        {/* Contenido por Tab */}
        {activeTab === 'inicio' && (
          <Inicio
            estadoSistema={estadoSistema}
            loading={loading}
            onNuevaReserva={() => setModalReserva(true)}
            onVerReservas={() => setActiveTab('reservas')}
            onVerMenu={() => setActiveTab('menu')}
            onVerEstadisticas={() => setActiveTab('inicio')}
          />
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
                          setInfoEditada(datosEspejo?.restaurante || {});
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
                        setInfoEditada(datosEspejo?.restaurante || {});
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
                          {datosEspejo?.restaurante?.nombre || 'No especificado'}
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
                          {datosEspejo?.restaurante?.tipo_cocina || 'No especificado'}
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
                          {datosEspejo?.restaurante?.direccion || 'No especificado'}
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
                          {datosEspejo?.restaurante?.telefono || 'No especificado'}
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
                          {datosEspejo?.restaurante?.email || 'No especificado'}
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
                          {datosEspejo?.restaurante?.web || 'No especificado'}
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
                          {datosEspejo?.restaurante?.facebook ? 
                            `facebook.com/${datosEspejo.restaurante.facebook}` : 
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
                          {datosEspejo?.restaurante?.instagram ? 
                            `@${datosEspejo.restaurante.instagram}` : 
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
                          {datosEspejo?.restaurante?.twitter ? 
                            `@${datosEspejo.restaurante.twitter}` : 
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
                          {datosEspejo?.restaurante?.tripadvisor || 'No especificado'}
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
                    {datosEspejo?.restaurante?.descripcion || 'No hay descripción disponible'}
                  </p>
                )}
              </div>
              
              {/* Vista previa */}
              {!modoEdicionInfo && datosEspejo?.restaurante && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">
                    Vista previa en el Bot:
                  </h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>📍 <strong>{datosEspejo.restaurante.nombre}</strong></p>
                    {datosEspejo.restaurante.tipo_cocina && <p>🍴 {datosEspejo.restaurante.tipo_cocina}</p>}
                    {datosEspejo.restaurante.direccion && <p>📍 {datosEspejo.restaurante.direccion}</p>}
                    {datosEspejo.restaurante.telefono && <p>📞 {datosEspejo.restaurante.telefono}</p>}
                    {datosEspejo.restaurante.email && <p>📧 {datosEspejo.restaurante.email}</p>}
                    {datosEspejo.restaurante.web && <p>🌐 {datosEspejo.restaurante.web}</p>}
                    {datosEspejo.restaurante.instagram && <p>📸 Instagram: @{datosEspejo.restaurante.instagram}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'horarios' && <HorariosTab />}
        {activeTab === 'reservas' && features.RESERVATIONS && (
          <ReservasTab
            reservas={reservas}
            loading={loading}
            onNuevaReserva={() => setModalReserva(true)}
            onCancelarReserva={cancelarReserva}
            onEliminarReserva={eliminarReserva}
          />
        )}
        {activeTab === 'pedidos' && <PedidosTab />}
        {activeTab === 'mesas' && features.TABLES && <MesasTab mesas={mesas} />}
        {activeTab === 'menu' && features.MENU && <MenuTab menu={menu} />}
        {activeTab === 'politicas' && features.POLICIES && <PoliciesTab politicas={politicas} />}

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
    </DashboardLayout>
  );
}

export default GastroBotDashboard;