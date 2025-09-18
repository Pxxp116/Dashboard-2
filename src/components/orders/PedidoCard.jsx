import React from 'react';
import { Clock, CheckCircle, Package, XCircle, Phone, User, Hash, ChevronRight, ShoppingBag } from 'lucide-react';
import { Card, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import { OrderStatusBadge } from '../ui/Badge';
import { cn } from '../../utils/cn';

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
    <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer border-0 shadow-sm">
      <CardBody className="p-0">
        <div onClick={onVerDetalles} className="p-6">
          {/* Header moderno */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <Hash className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">#{pedido.id_unico_pedido}</h3>
                <p className="text-sm text-gray-500">{formatearFecha(pedido.fecha_pedido)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <OrderStatusBadge status={pedido.estado}>
                {estadoTexto(pedido.estado)}
              </OrderStatusBadge>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Información del cliente */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-900 truncate">{pedido.cliente_nombre}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{pedido.cliente_telefono}</span>
              </div>
            </div>
          </div>

          {/* Resumen del pedido */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">{numeroItems} {numeroItems === 1 ? 'producto' : 'productos'}</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">€{parseFloat(pedido.total).toFixed(2)}</div>
              </div>
            </div>

            {/* Preview de items */}
            <div className="space-y-1">
              {pedido.detalles_pedido?.slice(0, 2).map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 truncate flex-1">{item.cantidad}x {item.plato}</span>
                  <span className="font-medium text-gray-900 ml-2">€{(item.cantidad * item.precio_unitario).toFixed(2)}</span>
                </div>
              ))}
              {pedido.detalles_pedido?.length > 2 && (
                <div className="text-sm text-gray-500 italic">
                  +{pedido.detalles_pedido.length - 2} artículo{pedido.detalles_pedido.length - 2 > 1 ? 's' : ''} más...
                </div>
              )}
            </div>

            {/* Mesa (si aplica) */}
            {pedido.numero_mesa && (
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <span className="text-sm text-gray-600">Mesa:</span>
                <span className="font-semibold text-primary-600">#{pedido.numero_mesa}</span>
              </div>
            )}
          </div>
        </div>

        {/* Botones de acción modernos */}
        <div className="px-6 pb-6">
          <div className="flex gap-2">
            {pedido.estado === 'pendiente' && (
              <>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCambiarEstado(pedido.id, 'en_preparacion');
                  }}
                  variant="primary"
                  size="sm"
                  className="flex-1"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Preparar
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('¿Cancelar este pedido?')) {
                      onCambiarEstado(pedido.id, 'cancelado');
                    }
                  }}
                  variant="danger"
                  size="sm"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </>
            )}

            {pedido.estado === 'en_preparacion' && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onCambiarEstado(pedido.id, 'entregado');
                }}
                variant="success"
                size="sm"
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Marcar Entregado
              </Button>
            )}

            {pedido.estado === 'entregado' && (
              <div className="flex-1 flex items-center justify-center gap-2 py-2 text-success-600 font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>Completado</span>
              </div>
            )}

            {pedido.estado === 'cancelado' && (
              <div className="flex-1 flex items-center justify-center gap-2 py-2 text-red-600 font-medium">
                <XCircle className="w-4 h-4" />
                <span>Cancelado</span>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default PedidoCard;