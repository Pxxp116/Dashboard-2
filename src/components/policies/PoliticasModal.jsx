/**
 * @fileoverview Modal para editar políticas del restaurante
 * Permite modificar todas las políticas y configuraciones del negocio
 */

import React, { useState, useEffect } from 'react';
import { X, Save, Clock, Users, Baby, PawPrint, CreditCard, Calendar, AlertCircle, Info, DollarSign, MessageSquare } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useMessage } from '../../hooks/useMessage';
import mirrorService from '../../services/api/mirrorService';

/**
 * Modal de edición de políticas
 * @param {Object} props - Props del componente
 * @param {boolean} props.abierto - Si el modal está abierto
 * @param {Object} props.politicas - Políticas actuales
 * @param {Function} props.onCerrar - Callback al cerrar
 * @param {Function} props.onGuardar - Callback al guardar
 * @returns {JSX.Element} Modal de políticas
 */
function PoliticasModal({ abierto, politicas, onCerrar, onGuardar }) {
  const [formData, setFormData] = useState({
    cancelacion_horas: 24,
    cancelacion_mensaje: '',
    no_show_penalizacion: false,
    no_show_cantidad: 0,
    no_show_bloqueo_tras: 3,
    tiempo_mesa_minutos: 120,
    tiempo_mesa_mensaje: '',
    anticipo_requerido: false,
    anticipo_cantidad: 0,
    anticipo_porcentaje: null,
    anticipo_grupos_desde: 8,
    confirmacion_requerida: true,
    confirmacion_horas_antes: 4,
    niños_permitidos: true,
    niños_menu_especial: false,
    niños_descuento: 0,
    mascotas_permitidas: false,
    mascotas_solo_terraza: true,
    dress_code: '',
    fumadores_terraza: true,
    edad_minima_reserva: 18,
    reserva_maxima_personas: 20,
    reserva_maxima_dias_anticipacion: 60,
    info_alergias: '',
    mensaje_bienvenida: '',
    mensaje_confirmacion: '',
    mensaje_recordatorio: '',
    mensaje_agradecimiento: ''
  });

  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState({});
  const [seccionActiva, setSeccionActiva] = useState('general');
  
  const { actualizarDatosEspejo } = useAppContext();
  const { mostrarMensaje } = useMessage();

  useEffect(() => {
    if (abierto && politicas) {
      setFormData({
        cancelacion_horas: politicas.cancelacion_horas || 24,
        cancelacion_mensaje: politicas.cancelacion_mensaje || '',
        no_show_penalizacion: politicas.no_show_penalizacion || false,
        no_show_cantidad: politicas.no_show_cantidad || 0,
        no_show_bloqueo_tras: politicas.no_show_bloqueo_tras || 3,
        tiempo_mesa_minutos: politicas.tiempo_mesa_minutos || 120,
        tiempo_mesa_mensaje: politicas.tiempo_mesa_mensaje || '',
        anticipo_requerido: politicas.anticipo_requerido || false,
        anticipo_cantidad: politicas.anticipo_cantidad || 0,
        anticipo_porcentaje: politicas.anticipo_porcentaje || null,
        anticipo_grupos_desde: politicas.anticipo_grupos_desde || 8,
        confirmacion_requerida: politicas.confirmacion_requerida !== false,
        confirmacion_horas_antes: politicas.confirmacion_horas_antes || 4,
        niños_permitidos: politicas.niños_permitidos !== false,
        niños_menu_especial: politicas.niños_menu_especial || false,
        niños_descuento: politicas.niños_descuento || 0,
        mascotas_permitidas: politicas.mascotas_permitidas || false,
        mascotas_solo_terraza: politicas.mascotas_solo_terraza !== false,
        dress_code: politicas.dress_code || '',
        fumadores_terraza: politicas.fumadores_terraza !== false,
        edad_minima_reserva: politicas.edad_minima_reserva || 18,
        reserva_maxima_personas: politicas.reserva_maxima_personas || 20,
        reserva_maxima_dias_anticipacion: politicas.reserva_maxima_dias_anticipacion || 60,
        info_alergias: politicas.info_alergias || '',
        mensaje_bienvenida: politicas.mensaje_bienvenida || '',
        mensaje_confirmacion: politicas.mensaje_confirmacion || '',
        mensaje_recordatorio: politicas.mensaje_recordatorio || '',
        mensaje_agradecimiento: politicas.mensaje_agradecimiento || ''
      });
      setErrores({});
    }
  }, [abierto, politicas]);

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (formData.cancelacion_horas < 0 || formData.cancelacion_horas > 168) {
      nuevosErrores.cancelacion_horas = 'Debe estar entre 0 y 168 horas';
    }

    if (formData.tiempo_mesa_minutos < 30 || formData.tiempo_mesa_minutos > 480) {
      nuevosErrores.tiempo_mesa_minutos = 'Debe estar entre 30 y 480 minutos';
    }

    if (formData.anticipo_requerido && formData.anticipo_cantidad <= 0 && !formData.anticipo_porcentaje) {
      nuevosErrores.anticipo_cantidad = 'Debe indicar cantidad o porcentaje de anticipo';
    }

    if (formData.confirmacion_requerida && (formData.confirmacion_horas_antes < 1 || formData.confirmacion_horas_antes > 72)) {
      nuevosErrores.confirmacion_horas_antes = 'Debe estar entre 1 y 72 horas';
    }

    if (formData.edad_minima_reserva < 0 || formData.edad_minima_reserva > 99) {
      nuevosErrores.edad_minima_reserva = 'Edad inválida';
    }

    if (formData.reserva_maxima_personas < 1 || formData.reserva_maxima_personas > 100) {
      nuevosErrores.reserva_maxima_personas = 'Debe estar entre 1 y 100 personas';
    }

    if (formData.reserva_maxima_dias_anticipacion < 1 || formData.reserva_maxima_dias_anticipacion > 365) {
      nuevosErrores.reserva_maxima_dias_anticipacion = 'Debe estar entre 1 y 365 días';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      mostrarMensaje('Por favor corrige los errores en el formulario', 'error');
      return;
    }

    setGuardando(true);
    try {
      const response = await mirrorService.actualizarPoliticas(formData);
      
      if (response.exito) {
        mostrarMensaje('Políticas actualizadas correctamente', 'success');
        await actualizarDatosEspejo();
        if (onGuardar) onGuardar(formData);
        onCerrar();
      } else {
        mostrarMensaje(response.mensaje || 'Error al actualizar políticas', 'error');
      }
    } catch (error) {
      console.error('Error actualizando políticas:', error);
      mostrarMensaje('Error al actualizar políticas: ' + error.message, 'error');
    } finally {
      setGuardando(false);
    }
  };

  const manejarCambio = (campo, valor) => {
    setFormData(prev => ({
      ...prev,
      [campo]: valor
    }));
    
    if (errores[campo]) {
      setErrores(prev => ({
        ...prev,
        [campo]: ''
      }));
    }
  };

  if (!abierto) return null;

  const secciones = [
    { id: 'general', nombre: 'General', icono: AlertCircle },
    { id: 'reservas', nombre: 'Reservas', icono: Calendar },
    { id: 'pagos', nombre: 'Pagos', icono: CreditCard },
    { id: 'familias', nombre: 'Familias', icono: Baby },
    { id: 'mensajes', nombre: 'Mensajes', icono: MessageSquare }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 mr-2 text-blue-600" />
            <h2 className="text-xl font-bold">Editar Políticas del Restaurante</h2>
          </div>
          <button
            onClick={onCerrar}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs de secciones */}
        <div className="flex overflow-x-auto border-b bg-gray-50">
          {secciones.map(seccion => {
            const Icon = seccion.icono;
            return (
              <button
                key={seccion.id}
                onClick={() => setSeccionActiva(seccion.id)}
                className={`px-4 py-3 flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
                  seccionActiva === seccion.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{seccion.nombre}</span>
              </button>
            );
          })}
        </div>

        {/* Contenido del formulario */}
        <form onSubmit={manejarSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Sección General */}
          {seccionActiva === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Tiempo de antelación para cancelaciones (horas)
                  </label>
                  <input
                    type="number"
                    value={formData.cancelacion_horas}
                    onChange={(e) => manejarCambio('cancelacion_horas', parseInt(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errores.cancelacion_horas ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="0"
                    max="168"
                  />
                  {errores.cancelacion_horas && (
                    <p className="text-red-500 text-sm mt-1">{errores.cancelacion_horas}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Duración estándar de mesa (minutos)
                  </label>
                  <input
                    type="number"
                    value={formData.tiempo_mesa_minutos}
                    onChange={(e) => manejarCambio('tiempo_mesa_minutos', parseInt(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errores.tiempo_mesa_minutos ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="30"
                    max="480"
                  />
                  {errores.tiempo_mesa_minutos && (
                    <p className="text-red-500 text-sm mt-1">{errores.tiempo_mesa_minutos}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Edad mínima para reservar
                  </label>
                  <input
                    type="number"
                    value={formData.edad_minima_reserva}
                    onChange={(e) => manejarCambio('edad_minima_reserva', parseInt(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errores.edad_minima_reserva ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="0"
                    max="99"
                  />
                  {errores.edad_minima_reserva && (
                    <p className="text-red-500 text-sm mt-1">{errores.edad_minima_reserva}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código de vestimenta
                  </label>
                  <input
                    type="text"
                    value={formData.dress_code}
                    onChange={(e) => manejarCambio('dress_code', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Casual elegante"
                    maxLength="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje de política de cancelación
                </label>
                <textarea
                  value={formData.cancelacion_mensaje}
                  onChange={(e) => manejarCambio('cancelacion_mensaje', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Ej: Las cancelaciones deben realizarse con 24 horas de antelación"
                  maxLength="500"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.fumadores_terraza}
                    onChange={(e) => manejarCambio('fumadores_terraza', e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Permitir fumadores en terraza
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Sección Reservas */}
          {seccionActiva === 'reservas' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Máximo de personas por reserva
                  </label>
                  <input
                    type="number"
                    value={formData.reserva_maxima_personas}
                    onChange={(e) => manejarCambio('reserva_maxima_personas', parseInt(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errores.reserva_maxima_personas ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="1"
                    max="100"
                  />
                  {errores.reserva_maxima_personas && (
                    <p className="text-red-500 text-sm mt-1">{errores.reserva_maxima_personas}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Días máximos de anticipación
                  </label>
                  <input
                    type="number"
                    value={formData.reserva_maxima_dias_anticipacion}
                    onChange={(e) => manejarCambio('reserva_maxima_dias_anticipacion', parseInt(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errores.reserva_maxima_dias_anticipacion ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="1"
                    max="365"
                  />
                  {errores.reserva_maxima_dias_anticipacion && (
                    <p className="text-red-500 text-sm mt-1">{errores.reserva_maxima_dias_anticipacion}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.confirmacion_requerida}
                    onChange={(e) => manejarCambio('confirmacion_requerida', e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Requiere confirmación de reservas
                  </span>
                </label>

                {formData.confirmacion_requerida && (
                  <div className="ml-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Horas antes para confirmar
                    </label>
                    <input
                      type="number"
                      value={formData.confirmacion_horas_antes}
                      onChange={(e) => manejarCambio('confirmacion_horas_antes', parseInt(e.target.value) || 0)}
                      className={`w-48 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errores.confirmacion_horas_antes ? 'border-red-500' : 'border-gray-300'
                      }`}
                      min="1"
                      max="72"
                    />
                    {errores.confirmacion_horas_antes && (
                      <p className="text-red-500 text-sm mt-1">{errores.confirmacion_horas_antes}</p>
                    )}
                  </div>
                )}

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.no_show_penalizacion}
                    onChange={(e) => manejarCambio('no_show_penalizacion', e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Penalización por no presentarse
                  </span>
                </label>

                {formData.no_show_penalizacion && (
                  <div className="ml-6 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cantidad de penalización (€)
                      </label>
                      <input
                        type="number"
                        value={formData.no_show_cantidad}
                        onChange={(e) => manejarCambio('no_show_cantidad', parseFloat(e.target.value) || 0)}
                        className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bloquear después de (no shows)
                      </label>
                      <input
                        type="number"
                        value={formData.no_show_bloqueo_tras}
                        onChange={(e) => manejarCambio('no_show_bloqueo_tras', parseInt(e.target.value) || 0)}
                        className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        max="10"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sección Pagos */}
          {seccionActiva === 'pagos' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.anticipo_requerido}
                    onChange={(e) => manejarCambio('anticipo_requerido', e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Requiere anticipo
                  </span>
                </label>

                {formData.anticipo_requerido && (
                  <div className="ml-6 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <DollarSign className="w-4 h-4 inline mr-1" />
                          Cantidad fija (€)
                        </label>
                        <input
                          type="number"
                          value={formData.anticipo_cantidad}
                          onChange={(e) => manejarCambio('anticipo_cantidad', parseFloat(e.target.value) || 0)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errores.anticipo_cantidad ? 'border-red-500' : 'border-gray-300'
                          }`}
                          min="0"
                          step="0.01"
                        />
                        {errores.anticipo_cantidad && (
                          <p className="text-red-500 text-sm mt-1">{errores.anticipo_cantidad}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          O porcentaje (%)
                        </label>
                        <input
                          type="number"
                          value={formData.anticipo_porcentaje || ''}
                          onChange={(e) => manejarCambio('anticipo_porcentaje', e.target.value ? parseFloat(e.target.value) : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          max="100"
                          step="1"
                          placeholder="Opcional"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Users className="w-4 h-4 inline mr-1" />
                        Requerir anticipo para grupos desde (personas)
                      </label>
                      <input
                        type="number"
                        value={formData.anticipo_grupos_desde}
                        onChange={(e) => manejarCambio('anticipo_grupos_desde', parseInt(e.target.value) || 0)}
                        className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="2"
                        max="50"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sección Familias */}
          {seccionActiva === 'familias' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.niños_permitidos}
                    onChange={(e) => manejarCambio('niños_permitidos', e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    <Baby className="w-4 h-4 inline mr-1" />
                    Niños permitidos
                  </span>
                </label>

                {formData.niños_permitidos && (
                  <div className="ml-6 space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.niños_menu_especial}
                        onChange={(e) => manejarCambio('niños_menu_especial', e.target.checked)}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Menú especial para niños</span>
                    </label>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descuento para niños (%)
                      </label>
                      <input
                        type="number"
                        value={formData.niños_descuento}
                        onChange={(e) => manejarCambio('niños_descuento', parseFloat(e.target.value) || 0)}
                        className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        max="100"
                        step="1"
                      />
                    </div>
                  </div>
                )}

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.mascotas_permitidas}
                    onChange={(e) => manejarCambio('mascotas_permitidas', e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    <PawPrint className="w-4 h-4 inline mr-1" />
                    Mascotas permitidas
                  </span>
                </label>

                {formData.mascotas_permitidas && (
                  <div className="ml-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.mascotas_solo_terraza}
                        onChange={(e) => manejarCambio('mascotas_solo_terraza', e.target.checked)}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Solo en terraza</span>
                    </label>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Info className="w-4 h-4 inline mr-1" />
                  Información sobre alergias
                </label>
                <textarea
                  value={formData.info_alergias}
                  onChange={(e) => manejarCambio('info_alergias', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Ej: Por favor, indique cualquier alergia o intolerancia alimentaria"
                  maxLength="500"
                />
              </div>
            </div>
          )}

          {/* Sección Mensajes */}
          {seccionActiva === 'mensajes' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <Info className="w-4 h-4 inline mr-1" />
                  Estos mensajes se utilizan en las comunicaciones automáticas con los clientes
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje de bienvenida
                </label>
                <textarea
                  value={formData.mensaje_bienvenida}
                  onChange={(e) => manejarCambio('mensaje_bienvenida', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Mensaje que se muestra al crear una reserva"
                  maxLength="500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje de confirmación
                </label>
                <textarea
                  value={formData.mensaje_confirmacion}
                  onChange={(e) => manejarCambio('mensaje_confirmacion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Mensaje enviado al confirmar la reserva"
                  maxLength="500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje de recordatorio
                </label>
                <textarea
                  value={formData.mensaje_recordatorio}
                  onChange={(e) => manejarCambio('mensaje_recordatorio', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Mensaje de recordatorio antes de la reserva"
                  maxLength="500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje de agradecimiento
                </label>
                <textarea
                  value={formData.mensaje_agradecimiento}
                  onChange={(e) => manejarCambio('mensaje_agradecimiento', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Mensaje enviado después de la visita"
                  maxLength="500"
                />
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <Info className="w-4 h-4 inline mr-1" />
            Los cambios se aplicarán inmediatamente y se sincronizarán con el GPT
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onCerrar}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={guardando}
            >
              Cancelar
            </button>
            <button
              onClick={manejarSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              disabled={guardando}
            >
              <Save className="w-4 h-4" />
              <span>{guardando ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PoliticasModal;