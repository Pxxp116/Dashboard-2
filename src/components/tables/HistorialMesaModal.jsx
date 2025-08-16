/**
 * @fileoverview Modal para mostrar el historial de reservas de una mesa
 * Muestra todas las reservas realizadas en una mesa específica
 */

import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, User, Phone, MessageSquare } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { ESTADOS_RESERVA } from '../../types';

/**
 * Modal de historial de mesa
 * @param {Object} props - Props del componente
 * @param {boolean} props.abierto - Si el modal está abierto
 * @param {Object} [props.mesa] - Mesa seleccionada
 * @param {Function} props.onCerrar - Callback al cerrar
 * @returns {JSX.Element} Modal de historial
 */
function HistorialMesaModal({ abierto, mesa, onCerrar }) {
  const [historialReservas, setHistorialReservas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('todas');
  
  const { datosEspejo } = useAppContext();

  useEffect(() => {
    if (abierto && mesa && datosEspejo) {
      cargarHistorialMesa();
    }
  }, [abierto, mesa, datosEspejo]);

  const cargarHistorialMesa = () => {
    setCargando(true);
    try {
      if (!datosEspejo?.reservas || !mesa) {
        setHistorialReservas([]);
        return;
      }

      // Filtrar reservas de esta mesa
      const reservasMesa = datosEspejo.reservas
        .filter(reserva => reserva.mesa_id === mesa.id)
        .map(reserva => ({
          ...reserva,
          hora_fin_calculada: calcularHoraFin(reserva)
        }))
        .sort((a, b) => new Date(`${b.fecha} ${b.hora}`) - new Date(`${a.fecha} ${a.hora}`));

      setHistorialReservas(reservasMesa);
    } catch (error) {
      console.error('Error cargando historial:', error);
      setHistorialReservas([]);
    } finally {
      setCargando(false);
    }
  };

  const calcularHoraFin = (reserva) => {
    try {
      const duracionMinutos = datosEspejo?.politicas?.tiempo_mesa_minutos || 90;
      const [hora, minutos] = reserva.hora.split(':').map(Number);
      const fechaInicio = new Date();
      fechaInicio.setHours(hora, minutos, 0, 0);
      
      const fechaFin = new Date(fechaInicio);
      fechaFin.setMinutes(fechaFin.getMinutes() + duracionMinutos);
      
      return fechaFin.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return 'No calculado';
    }
  };

  const reservasFiltradas = () => {
    if (filtroEstado === 'todas') {
      return historialReservas;
    }
    return historialReservas.filter(reserva => reserva.estado === filtroEstado);
  };

  const obtenerEstiloEstado = (estado) => {
    switch (estado) {
      case ESTADOS_RESERVA.CONFIRMADA:
        return 'bg-green-100 text-green-800 border-green-200';
      case ESTADOS_RESERVA.PENDIENTE:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case ESTADOS_RESERVA.CANCELADA:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatearFecha = (fecha) => {
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return fecha;
    }
  };

  if (!abierto || !mesa) return null;

  const reservasParaMostrar = reservasFiltradas();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold">
              Historial de Mesa {mesa.numero_mesa}
            </h2>
            <p className="text-gray-600 text-sm">
              Capacidad: {mesa.capacidad} personas
              {mesa.zona && ` • Zona: ${mesa.zona}`}
            </p>
          </div>
          <button
            onClick={onCerrar}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filtros */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Total de reservas: {historialReservas.length}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-gray-700">
                Filtrar por estado:
              </label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todas">Todas</option>
                <option value={ESTADOS_RESERVA.CONFIRMADA}>Confirmadas</option>
                <option value={ESTADOS_RESERVA.PENDIENTE}>Pendientes</option>
                <option value={ESTADOS_RESERVA.CANCELADA}>Canceladas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto max-h-96">
          {cargando ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : reservasParaMostrar.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {filtroEstado === 'todas' 
                  ? 'No hay reservas registradas para esta mesa'
                  : `No hay reservas ${filtroEstado} para esta mesa`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reservasParaMostrar.map((reserva) => (
                <div 
                  key={reserva.id} 
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{reserva.nombre}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{reserva.telefono}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>{formatearFecha(reserva.fecha)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span>{reserva.hora}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span>Hasta: {reserva.hora_fin_calculada}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span>{reserva.personas} personas</span>
                        </div>
                      </div>
                      
                      {reserva.notas && (
                        <div className="mt-2 flex items-start space-x-2">
                          <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
                          <span className="text-sm text-gray-600">{reserva.notas}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${obtenerEstiloEstado(reserva.estado)}`}>
                      {reserva.estado.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              Duración configurada por reserva: {datosEspejo?.politicas?.tiempo_mesa_minutos || 90} minutos
            </div>
            <button
              onClick={onCerrar}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HistorialMesaModal;