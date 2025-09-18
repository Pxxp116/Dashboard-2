import React from 'react';
import { Clock, CheckCircle, Package, XCircle, Phone, User, Hash, ChevronRight } from 'lucide-react';

const PedidoCard = ({ pedido, onCambiarEstado, onVerDetalles }) => {
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'en_preparacion':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'entregado':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'pendiente':
        return <Clock className="w-5 h-5" />;
      case 'en_preparacion':
        return <Package className="w-5 h-5" />;
      case 'entregado':
        return <CheckCircle className="w-5 h-5" />;
      case 'cancelado':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    const ahora = new Date();
    const diffMs = ahora - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffMins < 1440) return `Hace ${Math.floor(diffMins / 60)} horas`;

    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const estadoTexto = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente';
      case 'en_preparacion':
        return 'En Preparación';
      case 'entregado':
        return 'Entregado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return estado;
    }
  };

  // Calcular número de items
  const numeroItems = pedido.detalles_pedido?.reduce((acc, item) => acc + item.cantidad, 0) || 0;

  return (
    <div className={`bg-white border-2 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer ${getEstadoColor(pedido.estado)}`}>
      <div onClick={onVerDetalles}>
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2">
            <Hash className="w-4 h-4 text-gray-500" />
            <span className="font-bold text-lg">{pedido.id_unico_pedido}</span>
          </div>
          <div className="flex items-center space-x-2">
            {getEstadoIcon(pedido.estado)}
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getEstadoColor(pedido.estado)}`}>
              {estadoTexto(pedido.estado)}
            </span>
          </div>
        </div>

        {/* Información del cliente */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center space-x-2 text-gray-700">
            <User className="w-4 h-4 text-gray-400" />
            <span className="font-medium truncate">{pedido.cliente_nombre}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-sm">{pedido.cliente_telefono}</span>
          </div>
        </div>

        {/* Resumen del pedido */}
        <div className="border-t pt-3 mb-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">{numeroItems} {numeroItems === 1 ? 'producto' : 'productos'}</span>
            <span className="font-bold text-lg">€{parseFloat(pedido.total).toFixed(2)}</span>
          </div>

          {/* Preview de los primeros 2 items */}
          {pedido.detalles_pedido?.slice(0, 2).map((item, index) => (
            <div key={index} className="text-sm text-gray-600 truncate">
              • {item.cantidad}x {item.plato}
            </div>
          ))}
          {pedido.detalles_pedido?.length > 2 && (
            <div className="text-sm text-gray-500 italic">
              +{pedido.detalles_pedido.length - 2} más...
            </div>
          )}
        </div>

        {/* Mesa (si aplica) */}
        {pedido.numero_mesa && (
          <div className="text-sm text-gray-600 mb-3">
            Mesa: <span className="font-medium">{pedido.numero_mesa}</span>
          </div>
        )}

        {/* Tiempo */}
        <div className="text-xs text-gray-500 flex items-center justify-between">
          <span>{formatearFecha(pedido.fecha_pedido)}</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      {/* Botones de acción rápida */}
      <div className="border-t mt-3 pt-3 flex gap-2">
        {pedido.estado === 'pendiente' && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCambiarEstado(pedido.id, 'en_preparacion');
              }}
              className="flex-1 bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition-colors"
            >
              Preparar
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('¿Cancelar este pedido?')) {
                  onCambiarEstado(pedido.id, 'cancelado');
                }
              }}
              className="px-3 py-1.5 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
            >
              Cancelar
            </button>
          </>
        )}

        {pedido.estado === 'en_preparacion' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCambiarEstado(pedido.id, 'entregado');
            }}
            className="flex-1 bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 transition-colors"
          >
            Marcar Entregado
          </button>
        )}

        {pedido.estado === 'entregado' && (
          <div className="flex-1 text-center text-green-600 font-medium text-sm">
            ✓ Completado
          </div>
        )}

        {pedido.estado === 'cancelado' && (
          <div className="flex-1 text-center text-red-600 font-medium text-sm">
            ✗ Cancelado
          </div>
        )}
      </div>
    </div>
  );
};

export default PedidoCard;