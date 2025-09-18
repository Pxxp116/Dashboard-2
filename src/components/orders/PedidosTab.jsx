import React, { useState, useEffect } from 'react';
import { ShoppingBag, Clock, CheckCircle, Package, Filter, RefreshCw, Search, Calendar } from 'lucide-react';
import PedidoCard from './PedidoCard';
import { usePedidos } from '../../hooks/usePedidos';
import LoadingSpinner from '../common/LoadingSpinner';

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
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{estadisticas.pendientes}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En Preparación</p>
              <p className="text-2xl font-bold text-blue-600">{estadisticas.enPreparacion}</p>
            </div>
            <Package className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Entregados</p>
              <p className="text-2xl font-bold text-green-600">{estadisticas.entregados}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total del Día</p>
              <p className="text-2xl font-bold text-purple-600">€{estadisticas.total.toFixed(2)}</p>
            </div>
            <ShoppingBag className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Filtro por fecha */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <input
              type="date"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtro por estado */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="en_preparacion">En Preparación</option>
              <option value="entregado">Entregados</option>
              <option value="cancelado">Cancelados</option>
            </select>
          </div>

          {/* Búsqueda */}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por ID, nombre o teléfono..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Botón actualizar */}
          <button
            onClick={() => cargarPedidos(filtroFecha, filtroEstado === 'todos' ? null : filtroEstado)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <ShoppingBag className="mr-2" />
          Pedidos del Día
        </h2>

        {error && (
          <div className="p-4 mb-4 bg-red-100 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        {pedidosFiltrados.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No hay pedidos {filtroEstado !== 'todos' ? `${filtroEstado.replace('_', ' ')}s` : ''} para mostrar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
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
      </div>

      {/* Modal de detalles del pedido */}
      {pedidoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">Pedido #{pedidoSeleccionado.id_unico_pedido}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(pedidoSeleccionado.fecha_pedido).toLocaleString('es-ES')}
                </p>
              </div>
              <button
                onClick={() => setPedidoSeleccionado(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Información del cliente */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Cliente</h4>
                <p className="text-gray-700">{pedidoSeleccionado.cliente_nombre}</p>
                <p className="text-gray-600">{pedidoSeleccionado.cliente_telefono}</p>
              </div>

              {/* Detalles del pedido */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Detalles del Pedido</h4>
                <div className="space-y-2">
                  {pedidoSeleccionado.detalles_pedido?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b">
                      <div>
                        <p className="font-medium">{item.plato}</p>
                        {item.notas && (
                          <p className="text-sm text-gray-600">{item.notas}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{item.cantidad} x €{item.precio_unitario}</p>
                        <p className="text-sm text-gray-600">€{(item.cantidad * item.precio_unitario).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">Total</span>
                  <span className="text-xl font-bold text-green-600">€{pedidoSeleccionado.total}</span>
                </div>
              </div>

              {/* Estado actual y acciones */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Estado del Pedido</h4>
                <div className="flex items-center space-x-2 mb-4">
                  {getEstadoIcon(pedidoSeleccionado.estado)}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(pedidoSeleccionado.estado)}`}>
                    {pedidoSeleccionado.estado.replace('_', ' ').charAt(0).toUpperCase() + pedidoSeleccionado.estado.slice(1).replace('_', ' ')}
                  </span>
                </div>

                <div className="flex space-x-2">
                  {pedidoSeleccionado.estado === 'pendiente' && (
                    <button
                      onClick={() => {
                        handleCambiarEstado(pedidoSeleccionado.id, 'en_preparacion');
                        setPedidoSeleccionado(null);
                      }}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Iniciar Preparación
                    </button>
                  )}
                  {pedidoSeleccionado.estado === 'en_preparacion' && (
                    <button
                      onClick={() => {
                        handleCambiarEstado(pedidoSeleccionado.id, 'entregado');
                        setPedidoSeleccionado(null);
                      }}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Marcar como Entregado
                    </button>
                  )}
                  {(pedidoSeleccionado.estado === 'pendiente' || pedidoSeleccionado.estado === 'en_preparacion') && (
                    <button
                      onClick={() => {
                        if (window.confirm('¿Seguro que deseas cancelar este pedido?')) {
                          handleCambiarEstado(pedidoSeleccionado.id, 'cancelado');
                          setPedidoSeleccionado(null);
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>

              {/* Notas adicionales */}
              {pedidoSeleccionado.notas && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Notas</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{pedidoSeleccionado.notas}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PedidosTab;