/**
 * @fileoverview Tab de información general del restaurante
 * Permite visualizar y editar todos los datos básicos del restaurante
 */

import React, { useState, useEffect } from 'react';
import { 
  Save, Edit2, X, Check, Globe, Phone, Mail, MapPin, 
  Facebook, Instagram, Twitter, Star, ChefHat, Building,
  RefreshCw
} from 'lucide-react';

/**
 * Tab de información general del restaurante
 * @returns {JSX.Element} Componente InfoGeneralTab
 */
function InfoGeneralTab() {
  const [restaurante, setRestaurante] = useState({
    nombre: '',
    tipo_cocina: '',
    direccion: '',
    telefono: '',
    email: '',
    web: '',
    descripcion: '',
    facebook: '',
    instagram: '',
    twitter: '',
    tripadvisor: ''
  });
  
  const [modoEdicion, setModoEdicion] = useState(false);
  const [datosEditados, setDatosEditados] = useState({});
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  
  // URL de la API
  const API_URL = process.env.REACT_APP_API_URL || 'https://backend-2-production-227a.up.railway.app/api';
  
  /**
   * Carga la información del restaurante
   */
  const cargarInformacion = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/restaurante`);
      const data = await response.json();
      
      if (data.exito) {
        // Normalizar datos para asegurar que todos los campos sean strings
        const restauranteNormalizado = {
          nombre: data.restaurante.nombre || '',
          tipo_cocina: data.restaurante.tipo_cocina || '',
          direccion: data.restaurante.direccion || '',
          telefono: data.restaurante.telefono || '',
          email: data.restaurante.email || '',
          web: data.restaurante.web || '',
          descripcion: data.restaurante.descripcion || '',
          facebook: data.restaurante.facebook || '',
          instagram: data.restaurante.instagram || '',
          twitter: data.restaurante.twitter || '',
          tripadvisor: data.restaurante.tripadvisor || ''
        };
        
        setRestaurante(restauranteNormalizado);
        setDatosEditados(restauranteNormalizado);
      }
    } catch (error) {
      console.error('Error cargando información:', error);
      mostrarMensaje('Error al cargar la información', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Guarda los cambios en el backend
   */
  const guardarCambios = async () => {
    setLoading(true);
    try {
      // Preparar datos asegurando que todos los campos sean strings
      const datosParaEnviar = {
        nombre: datosEditados.nombre || '',
        tipo_cocina: datosEditados.tipo_cocina || '',
        direccion: datosEditados.direccion || '',
        telefono: datosEditados.telefono || '',
        email: datosEditados.email || '',
        web: datosEditados.web || '',
        descripcion: datosEditados.descripcion || '',
        facebook: datosEditados.facebook || '',
        instagram: datosEditados.instagram || '',
        twitter: datosEditados.twitter || '',
        tripadvisor: datosEditados.tripadvisor || ''
      };
      
      const response = await fetch(`${API_URL}/admin/restaurante`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosParaEnviar)
      });
      
      const data = await response.json();
      
      if (data.exito) {
        // Normalizar la respuesta también
        const restauranteNormalizado = {
          nombre: data.restaurante.nombre || '',
          tipo_cocina: data.restaurante.tipo_cocina || '',
          direccion: data.restaurante.direccion || '',
          telefono: data.restaurante.telefono || '',
          email: data.restaurante.email || '',
          web: data.restaurante.web || '',
          descripcion: data.restaurante.descripcion || '',
          facebook: data.restaurante.facebook || '',
          instagram: data.restaurante.instagram || '',
          twitter: data.restaurante.twitter || '',
          tripadvisor: data.restaurante.tripadvisor || ''
        };
        
        setRestaurante(restauranteNormalizado);
        setModoEdicion(false);
        mostrarMensaje('Información actualizada correctamente', 'success');
      } else {
        mostrarMensaje(data.mensaje || 'Error al actualizar', 'error');
      }
    } catch (error) {
      console.error('Error guardando cambios:', error);
      mostrarMensaje('Error al guardar los cambios', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Cancela la edición y restaura los valores originales
   */
  const cancelarEdicion = () => {
    setDatosEditados(restaurante);
    setModoEdicion(false);
  };
  
  /**
   * Maneja el cambio de un campo
   */
  const handleChange = (campo, valor) => {
    setDatosEditados({
      ...datosEditados,
      [campo]: valor
    });
  };
  
  /**
   * Muestra un mensaje temporal
   */
  const mostrarMensaje = (texto, tipo = 'success') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 3000);
  };
  
  // Cargar información al montar el componente
  useEffect(() => {
    cargarInformacion();
  }, []);
  
  /**
   * Renderiza un campo editable
   */
  const renderCampo = (config) => {
    const { icono: Icon, label, campo, tipo = 'text', placeholder, prefix = '' } = config;
    const valor = datosEditados[campo] || '';
    
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <Icon className="w-4 h-4 inline mr-2" />
          {label}
        </label>
        {modoEdicion ? (
          <div className="flex">
            {prefix && <span className="px-3 py-2 bg-gray-100 border border-r-0 rounded-l-lg text-gray-500">{prefix}</span>}
            <input
              type={tipo}
              value={valor}
              onChange={(e) => handleChange(campo, e.target.value)}
              className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${prefix ? 'rounded-l-none' : ''}`}
              placeholder={placeholder}
            />
          </div>
        ) : (
          <p className="py-2 px-3 bg-gray-50 rounded-lg">
            {prefix}{valor || <span className="text-gray-400">No especificado</span>}
          </p>
        )}
      </div>
    );
  };

  // Si está cargando, mostrar spinner
  if (loading && !restaurante.nombre) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2">Cargando información...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Mensaje de notificación */}
      {mensaje && (
        <div className={`p-4 rounded-lg flex items-center ${
          mensaje.tipo === 'success' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {mensaje.tipo === 'success' ? (
            <Check className="w-5 h-5 mr-2" />
          ) : (
            <X className="w-5 h-5 mr-2" />
          )}
          {mensaje.texto}
        </div>
      )}
      
      {/* Tarjeta principal */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Header con botones de acción */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center">
            <Building className="w-6 h-6 mr-2" />
            Información General del Restaurante
          </h2>
          
          <div className="flex space-x-2">
            {modoEdicion ? (
              <>
                <button
                  onClick={cancelarEdicion}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={loading}
                >
                  <X className="w-4 h-4 inline mr-2" />
                  Cancelar
                </button>
                <button
                  onClick={guardarCambios}
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
                onClick={() => setModoEdicion(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Editar Información
              </button>
            )}
          </div>
        </div>
        
        {/* Grid de campos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna izquierda */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Datos Básicos</h3>
            
            {renderCampo({
              icono: Building,
              label: 'Nombre del Restaurante',
              campo: 'nombre',
              placeholder: 'Ej: La Bona Taula'
            })}
            
            {renderCampo({
              icono: ChefHat,
              label: 'Tipo de Cocina',
              campo: 'tipo_cocina',
              placeholder: 'Ej: Mediterránea, Italiana, Fusión...'
            })}
            
            {renderCampo({
              icono: MapPin,
              label: 'Dirección Completa',
              campo: 'direccion',
              placeholder: 'Calle, número, ciudad, código postal'
            })}
            
            {renderCampo({
              icono: Phone,
              label: 'Teléfono de Contacto',
              campo: 'telefono',
              tipo: 'tel',
              placeholder: '+34 900 123 456'
            })}
            
            {renderCampo({
              icono: Mail,
              label: 'Email de Contacto',
              campo: 'email',
              tipo: 'email',
              placeholder: 'info@restaurante.com'
            })}
            
            {renderCampo({
              icono: Globe,
              label: 'Sitio Web Oficial',
              campo: 'web',
              tipo: 'url',
              placeholder: 'www.restaurante.com'
            })}
          </div>
          
          {/* Columna derecha */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Redes Sociales</h3>
            
            {renderCampo({
              icono: Facebook,
              label: 'Facebook',
              campo: 'facebook',
              placeholder: 'mirestaurante',
              prefix: 'facebook.com/'
            })}
            
            {renderCampo({
              icono: Instagram,
              label: 'Instagram',
              campo: 'instagram',
              placeholder: 'mirestaurante',
              prefix: '@'
            })}
            
            {renderCampo({
              icono: Twitter,
              label: 'Twitter / X',
              campo: 'twitter',
              placeholder: 'mirestaurante',
              prefix: '@'
            })}
            
            {renderCampo({
              icono: Star,
              label: 'TripAdvisor',
              campo: 'tripadvisor',
              placeholder: 'URL del perfil en TripAdvisor'
            })}
          </div>
        </div>
        
        {/* Descripción del restaurante */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Descripción</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción del Restaurante
            </label>
            {modoEdicion ? (
              <textarea
                value={datosEditados.descripcion || ''}
                onChange={(e) => handleChange('descripcion', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Describe tu restaurante, el tipo de cocina, el ambiente..."
              />
            ) : (
              <p className="py-2 px-3 bg-gray-50 rounded-lg">
                {restaurante.descripcion || <span className="text-gray-400">No hay descripción disponible</span>}
              </p>
            )}
          </div>
        </div>
        
        {/* Vista previa de cómo se verá en el bot */}
        {!modoEdicion && restaurante.nombre && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">
              Vista previa en el Bot:
            </h4>
            <div className="text-sm text-gray-700 space-y-1">
              <p>📍 <strong>{restaurante.nombre}</strong></p>
              {restaurante.tipo_cocina && <p>🍴 {restaurante.tipo_cocina}</p>}
              {restaurante.direccion && <p>📍 {restaurante.direccion}</p>}
              {restaurante.telefono && <p>📞 {restaurante.telefono}</p>}
              {restaurante.email && <p>📧 {restaurante.email}</p>}
              {restaurante.web && <p>🌐 {restaurante.web}</p>}
              {restaurante.instagram && <p>📸 Instagram: @{restaurante.instagram}</p>}
              {restaurante.facebook && <p>👥 Facebook: {restaurante.facebook}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InfoGeneralTab;