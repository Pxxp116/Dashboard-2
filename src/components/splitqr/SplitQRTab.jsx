import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Download,
  Plus,
  Eye,
  Settings,
  Users,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Table,
  Receipt,
  DollarSign,
  ShoppingCart,
  Smartphone,
  X,
  ArrowRight
} from 'lucide-react';

import QRGenerator from './QRGenerator';
import TableAccountManager from './TableAccountManager';
import PaymentStatus from './PaymentStatus';
import QRTester from './QRTester';
import splitQRService from '../../services/api/splitQRService';

const SplitQRTab = () => {
  const [activeView, setActiveView] = useState('overview'); // 'overview', 'qr-generator', 'accounts', 'payments', 'tester'
  const [mesasData, setMesasData] = useState([]);
  const [cuentasActivas, setCuentasActivas] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    mesasConCuenta: 0,
    totalRecaudado: 0,
    pagosPendientes: 0,
    pagosCompletados: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosSplitQR();
    const interval = setInterval(cargarDatosSplitQR, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const cargarDatosSplitQR = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar datos reales desde el API
      const response = await splitQRService.obtenerEstadoMesas();

      if (response.exito && response.data) {
        const { mesas, cuentas_activas, estadisticas } = response.data;

        setMesasData(mesas || []);
        setCuentasActivas(cuentas_activas || []);
        setEstadisticas(estadisticas || {
          mesasConCuenta: 0,
          totalRecaudado: 0,
          pagosPendientes: 0,
          pagosCompletados: 0
        });
      } else {
        throw new Error(response.mensaje || 'Error al cargar datos');
      }

    } catch (err) {
      setError('Error al cargar datos de SplitQR: ' + err.message);
      console.error('Error cargando datos SplitQR:', err);

      // En caso de error, mantener datos vacíos
      setMesasData([]);
      setCuentasActivas([]);
      setEstadisticas({
        mesasConCuenta: 0,
        totalRecaudado: 0,
        pagosPendientes: 0,
        pagosCompletados: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Abrir nueva cuenta para mesa
  const abrirCuentaMesa = async (mesaId) => {
    try {
      console.log(`Abriendo cuenta para mesa ${mesaId}`);

      // Llamar al API real
      const response = await splitQRService.abrirCuentaMesa(mesaId);

      if (response.exito && response.cuenta) {
        console.log('Cuenta abierta exitosamente:', response.cuenta);

        // Actualizar estado local
        setCuentasActivas(prev => [...prev, response.cuenta]);
        setMesasData(prev => prev.map(mesa =>
          mesa.id === mesaId ? { ...mesa, tiene_cuenta: true } : mesa
        ));

        // Recargar datos para mantener sincronización
        setTimeout(() => {
          cargarDatosSplitQR();
        }, 1000);

        return response.cuenta;
      } else {
        throw new Error(response.mensaje || 'Error al abrir cuenta');
      }
    } catch (err) {
      console.error('Error abriendo cuenta:', err);
      setError(`Error al abrir cuenta: ${err.message}`);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Cargando SplitQR...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={cargarDatosSplitQR}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con navegación */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <QrCode className="w-8 h-8 text-blue-600" />
            SplitQR
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona QRs únicos por mesa y pagos divididos
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveView('overview')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeView === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Resumen
          </button>
          <button
            onClick={() => setActiveView('qr-generator')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeView === 'qr-generator'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Generar QRs
          </button>
          <button
            onClick={() => setActiveView('accounts')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeView === 'accounts'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cuentas
          </button>
          <button
            onClick={() => setActiveView('payments')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeView === 'payments'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pagos
          </button>
          <button
            onClick={() => setActiveView('tester')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeView === 'tester'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Testing QR
          </button>
        </div>
      </div>

      {/* Vista Overview */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Mesas con Cuenta</p>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.mesasConCuenta}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Table className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Recaudado</p>
                  <p className="text-2xl font-bold text-gray-900">€{estadisticas.totalRecaudado.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pagos Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.pagosPendientes}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pagos Completados</p>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.pagosCompletados}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Estado de Mesas */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Mesas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {mesasData.map((mesa) => (
                <div
                  key={mesa.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    mesa.tiene_cuenta
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">Mesa {mesa.numero}</span>
                    <div className={`w-3 h-3 rounded-full ${
                      mesa.estado === 'ocupada' ? 'bg-red-500' : 'bg-green-500'
                    }`} />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {mesa.capacidad} personas • {mesa.estado}
                  </p>

                  {mesa.tiene_cuenta ? (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <QrCode className="w-4 h-4" />
                      <span>QR Activo</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => abrirCuentaMesa(mesa.id)}
                      className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Abrir Cuenta
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Cuentas Activas Recientes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Cuentas Activas</h3>
              <button
                onClick={() => setActiveView('accounts')}
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
              >
                Ver todas
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {cuentasActivas.slice(0, 3).map((cuenta) => (
                <div key={cuenta.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Table className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Mesa {cuenta.mesa_numero}</p>
                      <p className="text-sm text-gray-600">
                        {cuenta.items_count} items • €{cuenta.total.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      cuenta.estado === 'pagada'
                        ? 'bg-green-100 text-green-800'
                        : cuenta.pendiente > 0
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {cuenta.estado === 'pagada' ? 'Pagada' :
                       cuenta.pendiente > 0 ? 'Parcial' : 'Abierta'}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Pendiente: €{cuenta.pendiente.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Vista Generador QR */}
      {activeView === 'qr-generator' && (
        <QRGenerator
          mesasData={mesasData}
          cuentasActivas={cuentasActivas}
          onAbrirCuenta={abrirCuentaMesa}
          onActualizar={cargarDatosSplitQR}
        />
      )}

      {/* Vista Gestión de Cuentas */}
      {activeView === 'accounts' && (
        <TableAccountManager
          cuentasActivas={cuentasActivas}
          mesasData={mesasData}
          onActualizar={cargarDatosSplitQR}
        />
      )}

      {/* Vista Estado de Pagos */}
      {activeView === 'payments' && (
        <PaymentStatus
          cuentasActivas={cuentasActivas}
          onActualizar={cargarDatosSplitQR}
        />
      )}

      {/* Vista Testing QR */}
      {activeView === 'tester' && (
        <QRTester />
      )}
    </div>
  );
};

export default SplitQRTab;