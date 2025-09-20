/**
 * @fileoverview Componente de tarjeta individual de mesa
 * Muestra el estado y detalles de una mesa específica
 */

import React from 'react';
import { Users, MapPin, Receipt, QrCode } from 'lucide-react';
import { ESTADOS_MESA } from '../../types';

/**
 * Tarjeta de mesa individual
 * @param {Object} props - Props del componente
 * @param {Object} props.mesa - Datos de la mesa
 * @param {Function} [props.onClick] - Callback al hacer click
 * @param {Function} [props.onDoubleClick] - Callback al hacer doble click
 * @returns {JSX.Element} Componente TableCard
 */
function TableCard({ mesa, onClick, onDoubleClick }) {
  const esOcupada = mesa.estado === ESTADOS_MESA.OCUPADA;
  
  /**
   * Obtiene las clases CSS según el estado
   * @returns {Object} Clases para contenedor y badge
   */
  const getEstiloClases = () => {
    if (esOcupada) {
      return {
        container: 'bg-red-100 border-2 border-red-300 hover:bg-red-200',
        badge: 'bg-red-600 text-white',
        icon: 'text-red-600'
      };
    }
    return {
      container: 'bg-green-100 border-2 border-green-300 hover:bg-green-200',
      badge: 'bg-green-600 text-white',
      icon: 'text-green-600'
    };
  };

  const estilos = getEstiloClases();

  return (
    <div
      className={`p-4 rounded-lg text-center transition-all cursor-pointer ${estilos.container}`}
      onClick={() => onClick && onClick(mesa)}
      onDoubleClick={() => onDoubleClick && onDoubleClick(mesa)}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' && onClick) {
          onClick(mesa);
        }
      }}
    >
      {/* Nombre/Número de mesa */}
      <div className="mb-2">
        {mesa.nombre ? (
          <>
            <p className="font-bold text-lg">{mesa.nombre}</p>
            <p className="text-sm text-gray-600">Mesa {mesa.numero_mesa}</p>
          </>
        ) : (
          <p className="font-bold text-lg">Mesa {mesa.numero_mesa}</p>
        )}
      </div>
      
      {/* Capacidad */}
      <div className="flex items-center justify-center mb-2">
        <Users className={`w-4 h-4 mr-1 ${estilos.icon}`} />
        <span className="text-sm">
          {mesa.capacidad} {mesa.capacidad === 1 ? 'persona' : 'personas'}
        </span>
      </div>
      
      {/* Zona (si existe) */}
      {mesa.zona && (
        <div className="flex items-center justify-center mb-2">
          <MapPin className={`w-3 h-3 mr-1 ${estilos.icon}`} />
          <span className="text-xs text-gray-600">{mesa.zona}</span>
        </div>
      )}
      
      {/* Estado */}
      <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${estilos.badge}`}>
        {esOcupada ? 'OCUPADA' : 'LIBRE'}
      </span>

      {/* Información de factura */}
      {(mesa.cuenta_status || mesa.items_count > 0 || mesa.cuenta_total > 0) && (
        <div className="mt-2 pt-2 border-t border-gray-300">
          <div className="flex items-center justify-center mb-1">
            <Receipt className="w-3 h-3 mr-1 text-blue-600" />
            <span className="text-xs font-medium text-blue-600">
              Factura: {mesa.cuenta_status || 'empty'}
            </span>
          </div>
          {mesa.items_count > 0 && (
            <p className="text-xs text-gray-600">
              {mesa.items_count} item{mesa.items_count !== 1 ? 's' : ''}
            </p>
          )}
          {mesa.cuenta_total > 0 && (
            <p className="text-xs font-bold text-gray-700">
              €{mesa.cuenta_total.toFixed(2)}
            </p>
          )}
        </div>
      )}

      {/* Indicador de QR disponible */}
      {mesa.qr_code && (
        <div className="mt-1">
          <div className="flex items-center justify-center">
            <QrCode className="w-3 h-3 mr-1 text-green-600" />
            <span className="text-xs text-green-600">QR Disponible</span>
          </div>
        </div>
      )}

      {/* Información adicional si está ocupada */}
      {esOcupada && mesa.reserva_actual && (
        <div className="mt-2 pt-2 border-t border-red-300">
          <p className="text-xs text-gray-700">
            {mesa.reserva_actual.nombre}
          </p>
          <p className="text-xs text-gray-600">
            {mesa.reserva_actual.hora_fin_estimada}
          </p>
        </div>
      )}
    </div>
  );
}

export default TableCard;