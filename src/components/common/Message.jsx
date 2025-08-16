/**
 * @fileoverview Componente para mostrar mensajes de notificación
 * Soporta diferentes tipos de mensajes (success, error, warning, info)
 */

import React from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { TIPOS_MENSAJE } from '../../services/utils/constants';

/**
 * Configuración de estilos y iconos por tipo de mensaje
 */
const MESSAGE_CONFIG = {
  [TIPOS_MENSAJE.SUCCESS]: {
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800',
    iconClassName: 'text-green-600'
  },
  [TIPOS_MENSAJE.ERROR]: {
    icon: AlertCircle,
    className: 'bg-red-100 text-red-800',
    iconClassName: 'text-red-600'
  },
  [TIPOS_MENSAJE.WARNING]: {
    icon: AlertTriangle,
    className: 'bg-yellow-100 text-yellow-800',
    iconClassName: 'text-yellow-600'
  },
  [TIPOS_MENSAJE.INFO]: {
    icon: Info,
    className: 'bg-blue-100 text-blue-800',
    iconClassName: 'text-blue-600'
  }
};

/**
 * Componente de mensaje de notificación
 * @param {Object} props - Props del componente
 * @param {string} props.texto - Texto del mensaje
 * @param {string} props.tipo - Tipo de mensaje
 * @param {Function} [props.onClose] - Callback al cerrar el mensaje
 * @returns {JSX.Element} Componente Message
 */
function Message({ texto, tipo = TIPOS_MENSAJE.INFO, onClose }) {
  const config = MESSAGE_CONFIG[tipo] || MESSAGE_CONFIG[TIPOS_MENSAJE.INFO];
  const Icon = config.icon;

  return (
    <div 
      className={`mb-4 p-4 rounded-lg flex items-center justify-between ${config.className}`}
      role="alert"
    >
      <div className="flex items-center">
        <Icon className={`w-5 h-5 mr-2 ${config.iconClassName}`} />
        <span className="font-medium">{texto}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
          aria-label="Cerrar mensaje"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default Message;