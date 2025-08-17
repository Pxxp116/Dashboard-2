import React, { useState, useEffect } from 'react';
import { Clock, Save, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'https://backend-2-production-227a.up.railway.app/api';

function HorariosTab() {
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const diasSemana = [
    { id: 0, nombre: 'Domingo' },
    { id: 1, nombre: 'Lunes' },
    { id: 2, nombre: 'Martes' },
    { id: 3, nombre: 'Miércoles' },
    { id: 4, nombre: 'Jueves' },
    { id: 5, nombre: 'Viernes' },
    { id: 6, nombre: 'Sábado' }
  ];

  // Cargar horarios al montar el componente
  useEffect(() => {
    cargarHorarios();
  }, []);

  const cargarHorarios = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/admin/horarios`);
      const data = await response.json();

      if (data.exito) {
        setHorarios(data.horarios);
      } else {
        mostrarMensaje('Error al cargar horarios', 'error');
      }
    } catch (error) {
      console.error('Error cargando horarios:', error);
      mostrarMensaje('Error de conexión', 'error');
    } finally {
      setLoading(false);
    }
  };

  const guardarHorarios = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${API_URL}/admin/horarios`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ horarios })
      });

      const data = await response.json();

      if (data.exito) {
        mostrarMensaje('Horarios guardados correctamente', 'success');
      } else {
        mostrarMensaje(data.mensaje || 'Error al guardar horarios', 'error');
      }
    } catch (error) {
      console.error('Error guardando horarios:', error);
      mostrarMensaje('Error de conexión', 'error');
    } finally {
      setSaving(false);
    }
  };

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 5000);
  };

  const actualizarHorario = (diaIndex, campo, valor) => {
    const nuevosHorarios = [...horarios];
    nuevosHorarios[diaIndex] = {
      ...nuevosHorarios[diaIndex],
      [campo]: valor
    };
    setHorarios(nuevosHorarios);
  };

  const toggleDiaCerrado = (diaIndex) => {
    const nuevosHorarios = [...horarios];
    const cerrado = !nuevosHorarios[diaIndex].cerrado;
    
    nuevosHorarios[diaIndex] = {
      ...nuevosHorarios[diaIndex],
      cerrado,
      // Si se cierra, limpiar horarios
      ...(cerrado && {
        apertura: null,
        cierre: null,
        turno_comida_inicio: null,
        turno_comida_fin: null,
        turno_cena_inicio: null,
        turno_cena_fin: null
      })
    };
    
    setHorarios(nuevosHorarios);
  };

  const resetearHorarios = () => {
    cargarHorarios();
    mostrarMensaje('Horarios restablecidos', 'success');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="w-6 h-6 mr-3 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Horarios del Restaurante</h2>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={resetearHorarios}
              className="flex items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Restablecer
            </button>
            <button
              onClick={guardarHorarios}
              className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>

        {/* Mensaje */}
        {mensaje && (
          <div className={`mt-4 p-4 rounded-lg flex items-center ${
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

        <p className="mt-2 text-gray-600">
          Configura los horarios de apertura y cierre de tu restaurante. Puedes establecer horarios diferentes para comida y cena.
        </p>
      </div>

      {/* Horarios por día */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="divide-y divide-gray-200">
          {diasSemana.map((dia, index) => {
            const horarioDia = horarios.find(h => h.dia_semana === dia.id) || {
              dia_semana: dia.id,
              nombre_dia: dia.nombre,
              cerrado: false,
              apertura: null,
              cierre: null,
              turno_comida_inicio: null,
              turno_comida_fin: null,
              turno_cena_inicio: null,
              turno_cena_fin: null,
              capacidad_reducida: false,
              porcentaje_capacidad: 100
            };

            return (
              <div key={dia.id} className="p-6">
                <div className="flex items-start space-x-6">
                  {/* Día de la semana */}
                  <div className="flex-shrink-0 w-24">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`cerrado-${dia.id}`}
                        checked={horarioDia.cerrado}
                        onChange={() => toggleDiaCerrado(horarios.findIndex(h => h.dia_semana === dia.id) !== -1 ? horarios.findIndex(h => h.dia_semana === dia.id) : index)}
                        className="mr-2 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`cerrado-${dia.id}`} className="text-sm text-gray-500">
                        Cerrado
                      </label>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mt-2">
                      {dia.nombre}
                    </h3>
                  </div>

                  {/* Horarios */}
                  {!horarioDia.cerrado && (
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Horario General */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Horario General</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Apertura
                            </label>
                            <input
                              type="time"
                              value={horarioDia.apertura || ''}
                              onChange={(e) => actualizarHorario(
                                horarios.findIndex(h => h.dia_semana === dia.id) !== -1 ? 
                                horarios.findIndex(h => h.dia_semana === dia.id) : index,
                                'apertura',
                                e.target.value
                              )}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Cierre
                            </label>
                            <input
                              type="time"
                              value={horarioDia.cierre || ''}
                              onChange={(e) => actualizarHorario(
                                horarios.findIndex(h => h.dia_semana === dia.id) !== -1 ? 
                                horarios.findIndex(h => h.dia_semana === dia.id) : index,
                                'cierre',
                                e.target.value
                              )}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Turnos Específicos */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Turnos Específicos (Opcional)</h4>
                        
                        {/* Turno Comida */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Turno Comida
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="time"
                              placeholder="Inicio"
                              value={horarioDia.turno_comida_inicio || ''}
                              onChange={(e) => actualizarHorario(
                                horarios.findIndex(h => h.dia_semana === dia.id) !== -1 ? 
                                horarios.findIndex(h => h.dia_semana === dia.id) : index,
                                'turno_comida_inicio',
                                e.target.value
                              )}
                              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                            <input
                              type="time"
                              placeholder="Fin"
                              value={horarioDia.turno_comida_fin || ''}
                              onChange={(e) => actualizarHorario(
                                horarios.findIndex(h => h.dia_semana === dia.id) !== -1 ? 
                                horarios.findIndex(h => h.dia_semana === dia.id) : index,
                                'turno_comida_fin',
                                e.target.value
                              )}
                              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </div>
                        </div>

                        {/* Turno Cena */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Turno Cena
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="time"
                              placeholder="Inicio"
                              value={horarioDia.turno_cena_inicio || ''}
                              onChange={(e) => actualizarHorario(
                                horarios.findIndex(h => h.dia_semana === dia.id) !== -1 ? 
                                horarios.findIndex(h => h.dia_semana === dia.id) : index,
                                'turno_cena_inicio',
                                e.target.value
                              )}
                              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                            <input
                              type="time"
                              placeholder="Fin"
                              value={horarioDia.turno_cena_fin || ''}
                              onChange={(e) => actualizarHorario(
                                horarios.findIndex(h => h.dia_semana === dia.id) !== -1 ? 
                                horarios.findIndex(h => h.dia_semana === dia.id) : index,
                                'turno_cena_fin',
                                e.target.value
                              )}
                              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Estado cerrado */}
                  {horarioDia.cerrado && (
                    <div className="flex-1 flex items-center justify-center py-8">
                      <div className="text-center text-gray-500">
                        <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Restaurante cerrado este día</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 rounded-lg p-6">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h3 className="font-medium text-blue-900 mb-2">Información sobre horarios</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Los horarios se actualizan automáticamente en el chatbot</li>
              <li>• Puedes configurar turnos específicos para comida y cena</li>
              <li>• Si no especificas turnos, se usará el horario general</li>
              <li>• Los cambios se reflejan inmediatamente en las reservas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HorariosTab;