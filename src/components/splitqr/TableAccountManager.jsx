import React, { useState } from 'react';
import {
  Table,
  Plus,
  Minus,
  ShoppingCart,
  DollarSign,
  Clock,
  User,
  Receipt,
  X,
  CheckCircle,
  AlertTriangle,
  Eye,
  Edit3,
  Trash2,
  Save,
  RefreshCw,
  Search,
  Filter,
  MoreVertical,
  QrCode,
  Link
} from 'lucide-react';
import splitQRService from '../../services/api/splitQRService';

const TableAccountManager = ({ cuentasActivas, mesasData, onActualizar }) => {
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState(null);
  const [modalProducto, setModalProducto] = useState(false);
  const [modalEditarCuenta, setModalEditarCuenta] = useState(false);
  const [filtro, setFiltro] = useState('todas'); // 'todas', 'abiertas', 'pagadas', 'parciales'
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    precio: '',
    categoria: 'Platos principales',
    cantidad: 1
  });

  // Productos de ejemplo (en producción vendrían del menú)
  const productosDisponibles = [
    { id: 1, nombre: 'Paella Valenciana', precio: 18.50, categoria: 'Platos principales' },
    { id: 2, nombre: 'Gazpacho', precio: 8.90, categoria: 'Entrantes' },
    { id: 3, nombre: 'Pulpo a la gallega', precio: 15.20, categoria: 'Entrantes' },
    { id: 4, nombre: 'Tarta de Santiago', precio: 6.50, categoria: 'Postres' },
    { id: 5, nombre: 'Vino Tinto Crianza', precio: 4.20, categoria: 'Bebidas' },
    { id: 6, nombre: 'Agua mineral', precio: 2.10, categoria: 'Bebidas' }
  ];

  // Filtrar cuentas
  const cuentasFiltradas = cuentasActivas.filter(cuenta => {
    const mesa = mesasData.find(m => m.id === cuenta.mesa_id);
    const mesaTexto = mesa ? `mesa ${mesa.numero}` : '';

    const coincideBusqueda = !busqueda ||
      mesaTexto.toLowerCase().includes(busqueda.toLowerCase()) ||
      cuenta.qr_code_id.toLowerCase().includes(busqueda.toLowerCase());

    const coincideFiltro = filtro === 'todas' ||
      (filtro === 'abiertas' && cuenta.pendiente === cuenta.total) ||
      (filtro === 'pagadas' && cuenta.pendiente === 0) ||
      (filtro === 'parciales' && cuenta.pendiente > 0 && cuenta.pendiente < cuenta.total);

    return coincideBusqueda && coincideFiltro;
  });

  // Agregar producto a cuenta usando API real
  const agregarProducto = async (cuentaId, producto) => {
    try {
      console.log(`Agregando producto ${producto.nombre} a cuenta ${cuentaId}`);

      // Llamar al servicio real
      const response = await splitQRService.agregarProducto(cuentaId, producto);

      if (response.exito) {
        console.log('Producto agregado exitosamente:', response.item);

        // Recargar datos para mantener sincronización
        onActualizar();

        return true;
      } else {
        throw new Error(response.mensaje || 'Error agregando producto');
      }
    } catch (error) {
      console.error('Error agregando producto:', error);
      throw new Error(`Error al agregar producto: ${error.message}`);
    }
  };

  // Agregar producto personalizado
  const agregarProductoPersonalizado = async () => {
    if (!nuevoProducto.nombre || !nuevoProducto.precio) return;

    try {
      const producto = {
        id: Date.now(),
        nombre: nuevoProducto.nombre,
        precio: parseFloat(nuevoProducto.precio),
        categoria: nuevoProducto.categoria,
        cantidad: nuevoProducto.cantidad
      };

      await agregarProducto(cuentaSeleccionada.id, producto);

      setModalProducto(false);
      setNuevoProducto({
        nombre: '',
        precio: '',
        categoria: 'Platos principales',
        cantidad: 1
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Cerrar cuenta usando API real
  const cerrarCuenta = async (cuentaId) => {
    if (!window.confirm('¿Estás seguro de que quieres cerrar esta cuenta?')) return;

    try {
      console.log(`Cerrando cuenta ${cuentaId}`);

      // Llamar al servicio real
      const response = await splitQRService.cerrarCuenta(cuentaId);

      if (response.exito) {
        console.log('Cuenta cerrada exitosamente');

        // Recargar datos para mantener sincronización
        onActualizar();
      } else {
        throw new Error(response.mensaje || 'Error cerrando cuenta');
      }
    } catch (error) {
      console.error('Error cerrando cuenta:', error);
      alert(`Error al cerrar cuenta: ${error.message}`);
    }
  };

  // Obtener cuenta con items reales del backend
  const getCuentaConItems = async (cuenta) => {
    try {
      // Obtener los datos completos de la cuenta desde el API
      const response = await splitQRService.obtenerCuentaMesa(cuenta.mesa_id);

      if (response.exito && response.cuenta) {
        return response.cuenta;
      } else {
        // Fallback si no se pueden obtener los datos
        console.warn('No se pudieron obtener los items de la cuenta, usando datos base');
        return {
          ...cuenta,
          items: []
        };
      }
    } catch (error) {
      console.error('Error obteniendo cuenta con items:', error);
      // Fallback si hay error
      return {
        ...cuenta,
        items: []
      };
    }
  };

  return (
    <div className="space-y-6">
      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-800">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto p-1 hover:bg-red-100 rounded"
          >
            <X className="w-4 h-4 text-red-500" />
          </button>
        </div>
      )}

      {/* Header con controles */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestión de Cuentas</h2>
          <p className="text-gray-600">Administra los productos y pagos de cada mesa</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar mesa o QR ID..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filtros */}
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="todas">Todas las cuentas</option>
            <option value="abiertas">Abiertas</option>
            <option value="parciales">Pago parcial</option>
            <option value="pagadas">Completamente pagadas</option>
          </select>

          <button
            onClick={onActualizar}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Table className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Cuentas</p>
              <p className="text-xl font-bold text-gray-900">{cuentasActivas.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pagadas</p>
              <p className="text-xl font-bold text-gray-900">
                {cuentasActivas.filter(c => c.pendiente === 0).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-xl font-bold text-gray-900">
                {cuentasActivas.filter(c => c.pendiente > 0).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Recaudado</p>
              <p className="text-xl font-bold text-gray-900">
                €{cuentasActivas.reduce((sum, c) => sum + c.pagado, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de cuentas */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Cuentas Activas ({cuentasFiltradas.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {cuentasFiltradas.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Table className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No hay cuentas</h4>
              <p className="text-gray-600">
                {busqueda || filtro !== 'todas'
                  ? 'No se encontraron cuentas con los filtros aplicados'
                  : 'No hay cuentas activas en este momento'
                }
              </p>
            </div>
          ) : (
            cuentasFiltradas.map((cuenta) => {
              const mesa = mesasData.find(m => m.id === cuenta.mesa_id);

              return (
                <div key={cuenta.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    {/* Información principal */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Table className="w-6 h-6 text-blue-600" />
                      </div>

                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="text-lg font-semibold text-gray-900">
                            Mesa {mesa?.numero}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            cuenta.estado === 'pagada'
                              ? 'bg-green-100 text-green-800'
                              : cuenta.pendiente > 0 && cuenta.pendiente < cuenta.total
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {cuenta.estado === 'pagada' ? 'Pagada' :
                             cuenta.pendiente > 0 && cuenta.pendiente < cuenta.total ? 'Pago parcial' : 'Abierta'}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>{cuenta.items_count || 0} productos</span>
                          <span>•</span>
                          <span>Total: €{cuenta.total.toFixed(2)}</span>
                          <span>•</span>
                          <span>Pendiente: €{cuenta.pendiente.toFixed(2)}</span>
                          <span>•</span>
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            {cuenta.qr_code_id.slice(-8)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          try {
                            setLoading(true);
                            setError(null);
                            const cuentaCompleta = await getCuentaConItems(cuenta);
                            setCuentaSeleccionada(cuentaCompleta);
                          } catch (err) {
                            setError(`Error al cargar detalles: ${err.message}`);
                          } finally {
                            setLoading(false);
                          }
                        }}
                        disabled={loading}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        <Eye className="w-4 h-4" />
                        Ver detalles
                      </button>

                      <button
                        onClick={async () => {
                          try {
                            setLoading(true);
                            setError(null);
                            const cuentaCompleta = await getCuentaConItems(cuenta);
                            setCuentaSeleccionada(cuentaCompleta);
                            setModalProducto(true);
                          } catch (err) {
                            setError(`Error al cargar cuenta: ${err.message}`);
                          } finally {
                            setLoading(false);
                          }
                        }}
                        disabled={loading}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                        Agregar
                      </button>

                      <div className="relative">
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {/* TODO: Implementar menú desplegable */}
                      </div>
                    </div>
                  </div>

                  {/* Progreso de pago */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                      <span>Progreso de pago</span>
                      <span>{((cuenta.pagado / cuenta.total) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(cuenta.pagado / cuenta.total) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal detalles de cuenta */}
      {cuentaSeleccionada && !modalProducto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Cuenta Mesa {mesasData.find(m => m.id === cuentaSeleccionada.mesa_id)?.numero}
                  </h3>
                  <p className="text-gray-600">QR ID: {cuentaSeleccionada.qr_code_id}</p>
                </div>
                <button
                  onClick={() => setCuentaSeleccionada(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Resumen financiero */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600">Subtotal</p>
                  <p className="text-lg font-bold text-gray-900">€{cuentaSeleccionada.total.toFixed(2)}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-green-600">Pagado</p>
                  <p className="text-lg font-bold text-green-700">€{cuentaSeleccionada.pagado.toFixed(2)}</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-amber-600">Pendiente</p>
                  <p className="text-lg font-bold text-amber-700">€{cuentaSeleccionada.pendiente.toFixed(2)}</p>
                </div>
              </div>

              {/* Lista de productos */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Productos en la cuenta</h4>
                <div className="space-y-2">
                  {cuentaSeleccionada.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <ShoppingCart className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.nombre}</p>
                          <p className="text-sm text-gray-600">{item.categoria}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {item.cantidad}x €{item.precio.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Total: €{(item.cantidad * item.precio).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-3">
                <button
                  onClick={() => setModalProducto(true)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Producto
                </button>
                <button
                  onClick={() => cerrarCuenta(cuentaSeleccionada.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cerrar Cuenta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal agregar producto */}
      {modalProducto && cuentaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Agregar Producto - Mesa {mesasData.find(m => m.id === cuentaSeleccionada.mesa_id)?.numero}
                </h3>
                <button
                  onClick={() => setModalProducto(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Productos predefinidos */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Productos del menú</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {productosDisponibles.map((producto) => (
                    <button
                      key={producto.id}
                      onClick={() => agregarProducto(cuentaSeleccionada.id, producto)}
                      className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{producto.nombre}</p>
                        <p className="text-sm text-gray-600">{producto.categoria}</p>
                      </div>
                      <p className="font-bold text-gray-900">€{producto.precio.toFixed(2)}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Producto personalizado */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Producto personalizado</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Nombre del producto"
                    value={nuevoProducto.nombre}
                    onChange={(e) => setNuevoProducto({...nuevoProducto, nombre: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Precio"
                      value={nuevoProducto.precio}
                      onChange={(e) => setNuevoProducto({...nuevoProducto, precio: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="number"
                      min="1"
                      placeholder="Cantidad"
                      value={nuevoProducto.cantidad}
                      onChange={(e) => setNuevoProducto({...nuevoProducto, cantidad: parseInt(e.target.value)})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <select
                    value={nuevoProducto.categoria}
                    onChange={(e) => setNuevoProducto({...nuevoProducto, categoria: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Entrantes">Entrantes</option>
                    <option value="Platos principales">Platos principales</option>
                    <option value="Postres">Postres</option>
                    <option value="Bebidas">Bebidas</option>
                  </select>

                  <button
                    onClick={agregarProductoPersonalizado}
                    disabled={!nuevoProducto.nombre || !nuevoProducto.precio}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar Producto
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableAccountManager;