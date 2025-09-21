import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Eye,
  MoreVertical,
  User,
  Smartphone,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  X
} from 'lucide-react';

const PaymentStatus = ({ cuentasActivas, onActualizar }) => {
  const [pagos, setPagos] = useState([]);
  const [filtroTiempo, setFiltroTiempo] = useState('hoy'); // 'hoy', 'semana', 'mes'
  const [filtroEstado, setFiltroEstado] = useState('todos'); // 'todos', 'completados', 'pendientes', 'fallidos'
  const [busqueda, setBusqueda] = useState('');
  const [pagoSeleccionado, setPagoSeleccionado] = useState(null);
  const [estadisticas, setEstadisticas] = useState({
    totalPagos: 0,
    montoTotal: 0,
    pagosCompletados: 0,
    pagosPendientes: 0,
    pagosFallidos: 0,
    ingresosDiarios: []
  });

  // Datos de ejemplo de pagos
  useEffect(() => {
    cargarPagos();
  }, [filtroTiempo, filtroEstado]);

  const cargarPagos = async () => {
    // TODO: Implementar llamada real al API
    // Simulando datos de pagos
    const pagosEjemplo = [
      {
        id: 1,
        mesa_numero: 2,
        cliente_nombre: 'Ana García',
        cliente_telefono: '+34 666 123 456',
        monto: 22.80,
        metodo_pago: 'tarjeta',
        tipo_division: 'igual',
        estado: 'completado',
        fecha_pago: '2024-01-20T16:45:00Z',
        transaction_id: 'TXN_001_2024',
        qr_code_id: 'QR1642345678001',
        items_pagados: ['Paella Valenciana (1/2)', 'Gazpacho (1/1)']
      },
      {
        id: 2,
        mesa_numero: 3,
        cliente_nombre: 'Carlos Ruiz',
        cliente_telefono: '+34 666 789 012',
        monto: 35.60,
        metodo_pago: 'bizum',
        tipo_division: 'items',
        estado: 'completado',
        fecha_pago: '2024-01-20T15:30:00Z',
        transaction_id: 'TXN_002_2024',
        qr_code_id: 'QR1642345678002',
        items_pagados: ['Pulpo a la gallega', 'Vino Tinto x2', 'Tarta de Santiago']
      },
      {
        id: 3,
        mesa_numero: 2,
        cliente_nombre: 'María López',
        cliente_telefono: '+34 666 345 678',
        monto: 22.80,
        metodo_pago: 'tarjeta',
        tipo_division: 'igual',
        estado: 'pendiente',
        fecha_pago: '2024-01-20T16:50:00Z',
        transaction_id: 'TXN_003_2024',
        qr_code_id: 'QR1642345678001',
        items_pagados: ['Paella Valenciana (1/2)', 'Agua mineral']
      },
      {
        id: 4,
        mesa_numero: 5,
        cliente_nombre: 'Pedro Sánchez',
        cliente_telefono: '+34 666 456 789',
        monto: 28.90,
        metodo_pago: 'tarjeta',
        tipo_division: 'items',
        estado: 'fallido',
        fecha_pago: '2024-01-20T14:20:00Z',
        transaction_id: 'TXN_004_2024',
        qr_code_id: 'QR1642345678003',
        items_pagados: ['Gazpacho', 'Vino Tinto x3']
      }
    ];

    setPagos(pagosEjemplo);

    // Calcular estadísticas
    const stats = {
      totalPagos: pagosEjemplo.length,
      montoTotal: pagosEjemplo.filter(p => p.estado === 'completado').reduce((sum, p) => sum + p.monto, 0),
      pagosCompletados: pagosEjemplo.filter(p => p.estado === 'completado').length,
      pagosPendientes: pagosEjemplo.filter(p => p.estado === 'pendiente').length,
      pagosFallidos: pagosEjemplo.filter(p => p.estado === 'fallido').length,
      ingresosDiarios: [
        { fecha: '2024-01-15', monto: 245.60 },
        { fecha: '2024-01-16', monto: 312.40 },
        { fecha: '2024-01-17', monto: 189.20 },
        { fecha: '2024-01-18', monto: 278.90 },
        { fecha: '2024-01-19', monto: 356.80 },
        { fecha: '2024-01-20', monto: 81.20 }
      ]
    };

    setEstadisticas(stats);
  };

  // Filtrar pagos
  const pagosFiltrados = pagos.filter(pago => {
    const fechaPago = new Date(pago.fecha_pago);
    const ahora = new Date();

    // Filtro de tiempo
    let cumpleTiempo = true;
    if (filtroTiempo === 'hoy') {
      cumpleTiempo = fechaPago.toDateString() === ahora.toDateString();
    } else if (filtroTiempo === 'semana') {
      const semanaAtras = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
      cumpleTiempo = fechaPago >= semanaAtras;
    } else if (filtroTiempo === 'mes') {
      const mesAtras = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);
      cumpleTiempo = fechaPago >= mesAtras;
    }

    // Filtro de estado
    const cumpleEstado = filtroEstado === 'todos' || pago.estado === filtroEstado;

    // Filtro de búsqueda
    const cumpleBusqueda = !busqueda ||
      pago.cliente_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      pago.mesa_numero.toString().includes(busqueda) ||
      pago.transaction_id.toLowerCase().includes(busqueda.toLowerCase());

    return cumpleTiempo && cumpleEstado && cumpleBusqueda;
  });

  // Exportar datos
  const exportarDatos = () => {
    const csvContent = [
      ['Fecha', 'Mesa', 'Cliente', 'Monto', 'Método', 'Estado', 'ID Transacción'].join(','),
      ...pagosFiltrados.map(pago => [
        new Date(pago.fecha_pago).toLocaleString('es-ES'),
        pago.mesa_numero,
        pago.cliente_nombre,
        pago.monto.toFixed(2),
        pago.metodo_pago,
        pago.estado,
        pago.transaction_id
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pagos-splitqr-${filtroTiempo}.csv`;
    link.click();
  };

  // Obtener icono de método de pago
  const getMetodoIcon = (metodo) => {
    switch (metodo) {
      case 'tarjeta':
        return <CreditCard className="w-4 h-4" />;
      case 'bizum':
        return <Smartphone className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  // Obtener color de estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'completado':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-amber-100 text-amber-800';
      case 'fallido':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Estado de Pagos</h2>
          <p className="text-gray-600">Monitorea los pagos divididos en tiempo real</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar cliente, mesa o ID..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filtros */}
          <select
            value={filtroTiempo}
            onChange={(e) => setFiltroTiempo(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="hoy">Hoy</option>
            <option value="semana">Última semana</option>
            <option value="mes">Último mes</option>
          </select>

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="todos">Todos los estados</option>
            <option value="completado">Completados</option>
            <option value="pendiente">Pendientes</option>
            <option value="fallido">Fallidos</option>
          </select>

          <button
            onClick={exportarDatos}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>

          <button
            onClick={onActualizar}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Receipt className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Pagos</p>
              <p className="text-xl font-bold text-gray-900">{estadisticas.totalPagos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Monto Total</p>
              <p className="text-xl font-bold text-gray-900">€{estadisticas.montoTotal.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completados</p>
              <p className="text-xl font-bold text-gray-900">{estadisticas.pagosCompletados}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-xl font-bold text-gray-900">{estadisticas.pagosPendientes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Fallidos</p>
              <p className="text-xl font-bold text-gray-900">{estadisticas.pagosFallidos}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de ingresos (simplificado) */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingresos Diarios</h3>
        <div className="flex items-end gap-2 h-32">
          {estadisticas.ingresosDiarios.map((dia, index) => {
            const altura = (dia.monto / Math.max(...estadisticas.ingresosDiarios.map(d => d.monto))) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="bg-blue-500 rounded-t w-full min-h-[4px] transition-all hover:bg-blue-600"
                  style={{ height: `${altura}%` }}
                  title={`${dia.fecha}: €${dia.monto.toFixed(2)}`}
                />
                <p className="text-xs text-gray-600 mt-2 transform rotate-45 origin-left">
                  {new Date(dia.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lista de pagos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Pagos Recientes ({pagosFiltrados.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {pagosFiltrados.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No hay pagos</h4>
              <p className="text-gray-600">
                No se encontraron pagos con los filtros aplicados
              </p>
            </div>
          ) : (
            pagosFiltrados.map((pago) => (
              <div key={pago.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  {/* Información principal */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getMetodoIcon(pago.metodo_pago)}
                    </div>

                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-gray-900">
                          {pago.cliente_nombre}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(pago.estado)}`}>
                          {pago.estado.charAt(0).toUpperCase() + pago.estado.slice(1)}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>Mesa {pago.mesa_numero}</span>
                        <span>•</span>
                        <span>€{pago.monto.toFixed(2)}</span>
                        <span>•</span>
                        <span className="capitalize">{pago.metodo_pago}</span>
                        <span>•</span>
                        <span>División {pago.tipo_division === 'igual' ? 'igualitaria' : 'por ítems'}</span>
                        <span>•</span>
                        <span>{new Date(pago.fecha_pago).toLocaleString('es-ES')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPagoSeleccionado(pago)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Detalles
                    </button>

                    <div className="relative">
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Ítems pagados (solo si hay espacio) */}
                {pago.items_pagados && pago.items_pagados.length > 0 && (
                  <div className="mt-3 ml-16">
                    <p className="text-sm text-gray-600 mb-1">Ítems pagados:</p>
                    <div className="flex flex-wrap gap-1">
                      {pago.items_pagados.slice(0, 3).map((item, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {item}
                        </span>
                      ))}
                      {pago.items_pagados.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{pago.items_pagados.length - 3} más
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal detalles de pago */}
      {pagoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Detalles del Pago</h3>
                  <p className="text-gray-600">ID: {pagoSeleccionado.transaction_id}</p>
                </div>
                <button
                  onClick={() => setPagoSeleccionado(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Información del pago */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Cliente</p>
                    <p className="font-medium text-gray-900">{pagoSeleccionado.cliente_nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Mesa</p>
                    <p className="font-medium text-gray-900">Mesa {pagoSeleccionado.mesa_numero}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Monto</p>
                    <p className="text-lg font-bold text-gray-900">€{pagoSeleccionado.monto.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estado</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(pagoSeleccionado.estado)}`}>
                      {pagoSeleccionado.estado.charAt(0).toUpperCase() + pagoSeleccionado.estado.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Método de pago</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getMetodoIcon(pagoSeleccionado.metodo_pago)}
                      <span className="font-medium text-gray-900 capitalize">{pagoSeleccionado.metodo_pago}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tipo de división</p>
                    <p className="font-medium text-gray-900">
                      {pagoSeleccionado.tipo_division === 'igual' ? 'Igualitaria' : 'Por ítems'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Fecha y hora</p>
                  <p className="font-medium text-gray-900">
                    {new Date(pagoSeleccionado.fecha_pago).toLocaleString('es-ES')}
                  </p>
                </div>

                {pagoSeleccionado.cliente_telefono && (
                  <div>
                    <p className="text-sm text-gray-600">Teléfono</p>
                    <p className="font-medium text-gray-900">{pagoSeleccionado.cliente_telefono}</p>
                  </div>
                )}

                {/* Ítems pagados */}
                {pagoSeleccionado.items_pagados && pagoSeleccionado.items_pagados.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Ítems pagados</p>
                    <div className="space-y-2">
                      {pagoSeleccionado.items_pagados.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <Receipt className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-900">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* QR Code ID */}
                <div>
                  <p className="text-sm text-gray-600">QR Code usado</p>
                  <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {pagoSeleccionado.qr_code_id}
                  </p>
                </div>
              </div>

              {/* Acciones */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    // TODO: Implementar reenvío de recibo
                    console.log('Reenviar recibo');
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Receipt className="w-4 h-4" />
                  Reenviar Recibo
                </button>

                {pagoSeleccionado.estado === 'fallido' && (
                  <button
                    onClick={() => {
                      // TODO: Implementar reintento de pago
                      console.log('Reintentar pago');
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reintentar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentStatus;