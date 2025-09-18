import React, { useState, useEffect } from 'react';
import { ShoppingBag, Clock, CheckCircle, Package, Filter, RefreshCw, Search, Calendar, BarChart3, TrendingUp } from 'lucide-react';
import PedidoCard from './PedidoCard';
import { usePedidos } from '../../hooks/usePedidos';
import LoadingSpinner from '../common/LoadingSpinner';

// Componentes de UI modernas
import { Card, CardHeader, CardBody, CardTitle, CardDescription } from '../ui/Card';
import Button from '../ui/Button';
import { OrderStatusBadge } from '../ui/Badge';
import Input from '../ui/Input';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../ui/Modal';
import { cn } from '../../utils/cn';

const PedidosTab = () => {
  const { pedidos, loading, error, cargarPedidos, actualizarEstadoPedido } = usePedidos();
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [filtroFecha, setFiltroFecha] = useState(new Date().toISOString().split('T')[0]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  useEffect(() => {
    cargarPedidos(filtroFecha, filtroEstado === 'todos' ? null : filtroEstado);
  }, [filtroFecha, filtroEstado]);

  const pedidosFiltrados = pedidos.filter(pedido => {
    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      return (
        pedido.id_unico_pedido?.toLowerCase().includes(busquedaLower) ||
        pedido.cliente_nombre?.toLowerCase().includes(busquedaLower) ||
        pedido.cliente_telefono?.includes(busqueda)
      );
    }
    return true;
  });

  const handleCambiarEstado = async (pedidoId, nuevoEstado) => {
    const exito = await actualizarEstadoPedido(pedidoId, nuevoEstado);
    if (exito) {
      await cargarPedidos(filtroFecha, filtroEstado === 'todos' ? null : filtroEstado);
    }
  };

  const estadisticas = {
    pendientes: pedidos.filter(p => p.estado === 'pendiente').length,
    enPreparacion: pedidos.filter(p => p.estado === 'en_preparacion').length,
    entregados: pedidos.filter(p => p.estado === 'entregado').length,
    total: pedidos.reduce((acc, p) => acc + parseFloat(p.total || 0), 0)
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'en_preparacion':
        return 'bg-blue-100 text-blue-800';
      case 'entregado':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'pendiente':
        return <Clock className="w-4 h-4" />;
      case 'en_preparacion':
        return <Package className="w-4 h-4" />;
      case 'entregado':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <ShoppingBag className="w-4 h-4" />;
    }
  };

  if (loading && pedidos.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Pedidos</h1>
          <p className="text-gray-600 mt-1">Monitorea y gestiona todos los pedidos en tiempo real</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon={BarChart3}
            size="sm"
          >
            Reportes
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => cargarPedidos(filtroFecha, filtroEstado === 'todos' ? null : filtroEstado)}
            disabled={loading}
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Estadísticas mejoradas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-all">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-3xl font-bold text-warning-600 mt-1">{estadisticas.pendientes}</p>
                <p className="text-xs text-gray-500 mt-1">Requieren atención</p>
              </div>
              <div className="h-12 w-12 bg-warning-50 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Preparación</p>
                <p className="text-3xl font-bold text-info-600 mt-1">{estadisticas.enPreparacion}</p>
                <p className="text-xs text-gray-500 mt-1">En la cocina</p>
              </div>
              <div className="h-12 w-12 bg-info-50 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-info-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Entregados</p>
                <p className="text-3xl font-bold text-success-600 mt-1">{estadisticas.entregados}</p>
                <p className="text-xs text-gray-500 mt-1">Completados hoy</p>
              </div>
              <div className="h-12 w-12 bg-success-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">€{estadisticas.total.toFixed(0)}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-success-600 mr-1" />
                  <p className="text-xs text-success-600">+12% vs ayer</p>
                </div>
              </div>
              <div className="h-12 w-12 bg-primary-50 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filtros y Búsqueda modernos */}
      <Card className="border-0 shadow-sm">
        <CardBody className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filtros principales */}
            <div className="flex flex-col sm:flex-row gap-4 lg:flex-1">
              {/* Filtro por fecha */}
              <Input
                type="date"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                icon={Calendar}
                label="Fecha"
                className="sm:w-auto"
              />

              {/* Filtro por estado */}
              <div className="form-group sm:w-auto">
                <label className="form-label">Estado</label>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    className="form-input pl-10 appearance-none bg-white cursor-pointer"
                  >
                    <option value="todos">Todos los estados</option>
                    <option value="pendiente">Pendientes</option>
                    <option value="en_preparacion">En Preparación</option>
                    <option value="entregado">Entregados</option>
                    <option value="cancelado">Cancelados</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Búsqueda y acciones */}
            <div className="flex flex-col sm:flex-row gap-4 lg:flex-1">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Buscar por ID, nombre o teléfono..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  icon={Search}
                  label="Búsqueda"
                />
              </div>

              <div className="flex items-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => cargarPedidos(filtroFecha, filtroEstado === 'todos' ? null : filtroEstado)}
                  loading={loading}
                  className="h-10 w-10"
                  title="Actualizar pedidos"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Filtros rápidos */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm font-medium text-gray-700 mr-2">Filtros rápidos:</span>
            {[
              { key: 'todos', label: 'Todos', count: pedidos.length },
              { key: 'pendiente', label: 'Pendientes', count: estadisticas.pendientes },
              { key: 'en_preparacion', label: 'En Preparación', count: estadisticas.enPreparacion },
              { key: 'entregado', label: 'Entregados', count: estadisticas.entregados }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setFiltroEstado(filter.key)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  filtroEstado === filter.key
                    ? 'bg-primary-100 text-primary-700 border border-primary-200'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'
                )}
              >
                {filter.label}
                <span className={cn(
                  'px-1.5 py-0.5 rounded text-xs font-semibold',
                  filtroEstado === filter.key
                    ? 'bg-primary-200 text-primary-800'
                    : 'bg-gray-200 text-gray-700'
                )}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Lista de Pedidos mejorada */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Pedidos del Día</CardTitle>
                <CardDescription>
                  {pedidosFiltrados.length} {pedidosFiltrados.length === 1 ? 'pedido' : 'pedidos'}
                  {filtroEstado !== 'todos' && ` ${filtroEstado.replace('_', ' ')}`}
                </CardDescription>
              </div>
            </div>

            {pedidosFiltrados.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Total: €{pedidosFiltrados.reduce((acc, p) => acc + parseFloat(p.total || 0), 0).toFixed(2)}</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardBody className="pt-0">
          {error && (
            <div className="alert alert-error mb-6">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          {pedidosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay pedidos para mostrar
              </h3>
              <p className="text-gray-600 max-w-sm mx-auto">
                {filtroEstado !== 'todos'
                  ? `No se encontraron pedidos ${filtroEstado.replace('_', ' ')} para la fecha seleccionada.`
                  : 'No hay pedidos registrados para la fecha seleccionada.'
                }
              </p>
              {busqueda && (
                <Button
                  variant="ghost"
                  onClick={() => setBusqueda('')}
                  className="mt-4"
                >
                  Limpiar búsqueda
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {pedidosFiltrados.map((pedido) => (
                <PedidoCard
                  key={pedido.id}
                  pedido={pedido}
                  onCambiarEstado={handleCambiarEstado}
                  onVerDetalles={() => setPedidoSeleccionado(pedido)}
                />
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Modal moderno de detalles del pedido */}
      <Modal
        isOpen={!!pedidoSeleccionado}
        onClose={() => setPedidoSeleccionado(null)}
        size="lg"
        title={`Pedido #${pedidoSeleccionado?.id_unico_pedido}`}
      >
        {pedidoSeleccionado && (
          <>
            <ModalBody className="max-h-[70vh] overflow-y-auto">
              <div className="space-y-6">
                {/* Header con fecha y estado */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div>
                    <p className="text-sm text-gray-600">
                      {new Date(pedidoSeleccionado.fecha_pedido).toLocaleString('es-ES')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getEstadoIcon(pedidoSeleccionado.estado)}
                    <OrderStatusBadge status={pedidoSeleccionado.estado}>
                      {pedidoSeleccionado.estado.replace('_', ' ').charAt(0).toUpperCase() + pedidoSeleccionado.estado.slice(1).replace('_', ' ')}
                    </OrderStatusBadge>
                  </div>
                </div>

                {/* Información del cliente */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Información del Cliente</h4>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Nombre:</span>
                      <span className="text-sm font-semibold text-gray-900">{pedidoSeleccionado.cliente_nombre}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Teléfono:</span>
                      <span className="text-sm font-semibold text-gray-900">{pedidoSeleccionado.cliente_telefono}</span>
                    </div>
                  </div>
                </div>

                {/* Detalles del pedido */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Detalles del Pedido</h4>
                  <div className="space-y-3">
                    {pedidoSeleccionado.detalles_pedido?.map((item, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900">{item.plato}</h5>
                            {item.notas && (
                              <p className="text-sm text-gray-600 mt-1 italic">{item.notas}</p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-semibold text-gray-900">{item.cantidad} x €{item.precio_unitario}</p>
                            <p className="text-lg font-bold text-primary-600">€{(item.cantidad * item.precio_unitario).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="bg-primary-50 rounded-xl p-4 border border-primary-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-900">Total del Pedido</span>
                    <span className="text-2xl font-bold text-primary-600">€{pedidoSeleccionado.total}</span>
                  </div>
                </div>

                {/* Notas adicionales */}
                {pedidoSeleccionado.notas && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Notas Especiales</h4>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <p className="text-gray-700">{pedidoSeleccionado.notas}</p>
                    </div>
                  </div>
                )}
              </div>
            </ModalBody>

            <ModalFooter>
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                {pedidoSeleccionado.estado === 'pendiente' && (
                  <Button
                    onClick={() => {
                      handleCambiarEstado(pedidoSeleccionado.id, 'en_preparacion');
                      setPedidoSeleccionado(null);
                    }}
                    className="flex-1"
                    variant="primary"
                  >
                    Iniciar Preparación
                  </Button>
                )}
                {pedidoSeleccionado.estado === 'en_preparacion' && (
                  <Button
                    onClick={() => {
                      handleCambiarEstado(pedidoSeleccionado.id, 'entregado');
                      setPedidoSeleccionado(null);
                    }}
                    className="flex-1"
                    variant="success"
                  >
                    Marcar como Entregado
                  </Button>
                )}
                {(pedidoSeleccionado.estado === 'pendiente' || pedidoSeleccionado.estado === 'en_preparacion') && (
                  <Button
                    onClick={() => {
                      if (window.confirm('¿Seguro que deseas cancelar este pedido?')) {
                        handleCambiarEstado(pedidoSeleccionado.id, 'cancelado');
                        setPedidoSeleccionado(null);
                      }
                    }}
                    variant="danger"
                  >
                    Cancelar Pedido
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={() => setPedidoSeleccionado(null)}
                >
                  Cerrar
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </Modal>
    </div>
  );
};

export default PedidosTab;