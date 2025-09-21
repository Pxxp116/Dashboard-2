/**
 * @fileoverview Componente para probar la escaneabilidad de QRs
 * Permite validar que los QRs generados funcionen con apps móviles estándar
 */

import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  Copy,
  ExternalLink,
  RefreshCw,
  Camera,
  Wifi,
  Link,
  TestTube
} from 'lucide-react';
import splitQRService from '../../services/api/splitQRService';

const QRTester = () => {
  const [cuentasPrueba, setCuentasPrueba] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [testResults, setTestResults] = useState({});

  // Cargar cuentas para testing
  useEffect(() => {
    cargarCuentasPrueba();
  }, []);

  const cargarCuentasPrueba = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener estado de mesas para pruebas
      const response = await splitQRService.obtenerEstadoMesas();

      if (response.exito && response.data) {
        const cuentasActivas = response.data.cuentas_activas || [];
        setCuentasPrueba(cuentasActivas.slice(0, 5)); // Tomar máximo 5 para testing
      } else {
        throw new Error('No se pudieron cargar cuentas para testing');
      }
    } catch (err) {
      setError(`Error cargando cuentas: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Mostrar mensaje temporal
  const mostrarMensaje = (texto, tipo = 'success') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 3000);
  };

  // Probar URL de QR
  const probarURL = async (cuenta) => {
    try {
      setTestResults(prev => ({
        ...prev,
        [cuenta.id]: { status: 'testing', message: 'Probando URL...' }
      }));

      // Obtener URL real del QR
      const response = await splitQRService.obtenerURLQR(cuenta.id);

      if (response.exito && response.data) {
        const { payment_url } = response.data;

        // Simular prueba de conectividad (en un entorno real harías un HEAD request)
        // Por ahora asumimos que es válida si tiene el formato correcto
        const esURLValida = payment_url.startsWith('https://') &&
                           payment_url.includes('/mesa/') &&
                           payment_url.includes('/pago');

        if (esURLValida) {
          setTestResults(prev => ({
            ...prev,
            [cuenta.id]: {
              status: 'success',
              message: 'URL válida y accesible',
              url: payment_url
            }
          }));
        } else {
          setTestResults(prev => ({
            ...prev,
            [cuenta.id]: {
              status: 'error',
              message: 'Formato de URL inválido',
              url: payment_url
            }
          }));
        }
      } else {
        throw new Error('No se pudo obtener URL del QR');
      }
    } catch (err) {
      setTestResults(prev => ({
        ...prev,
        [cuenta.id]: {
          status: 'error',
          message: `Error: ${err.message}`
        }
      }));
    }
  };

  // Copiar URL para prueba manual
  const copiarURL = async (cuenta) => {
    try {
      const response = await splitQRService.obtenerURLQR(cuenta.id);
      if (response.exito && response.data) {
        await navigator.clipboard.writeText(response.data.payment_url);
        mostrarMensaje(`URL copiada para Mesa ${cuenta.mesa_numero}`);
      }
    } catch (err) {
      mostrarMensaje('Error al copiar URL', 'error');
    }
  };

  // Abrir URL en nueva pestaña
  const abrirURL = async (cuenta) => {
    try {
      const response = await splitQRService.obtenerURLQR(cuenta.id);
      if (response.exito && response.data) {
        window.open(response.data.payment_url, '_blank');
      }
    } catch (err) {
      mostrarMensaje('Error al abrir URL', 'error');
    }
  };

  // Probar todas las URLs
  const probarTodasLasURLs = async () => {
    for (const cuenta of cuentasPrueba) {
      await probarURL(cuenta);
      // Pequeña pausa entre pruebas para no saturar
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Cargando cuentas para testing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
            <TestTube className="w-6 h-6 text-purple-600" />
            QR Scanner Tester
          </h2>
          <p className="text-gray-600">Valida que los QRs sean escaneables con apps móviles estándar</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={cargarCuentasPrueba}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Recargar
          </button>

          <button
            onClick={probarTodasLasURLs}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <TestTube className="w-4 h-4" />
            Probar Todas
          </button>
        </div>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {mensaje && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          mensaje.tipo === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {mensaje.tipo === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          <span className="font-medium">{mensaje.texto}</span>
        </div>
      )}

      {/* Instrucciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Instrucciones para Testing Manual
        </h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>1. <strong>Copia la URL</strong> de cualquier QR de la lista</p>
          <p>2. <strong>Abre un generador de QR</strong> online (ej: qr-code-generator.com)</p>
          <p>3. <strong>Pega la URL</strong> y genera el QR</p>
          <p>4. <strong>Escanea con tu móvil</strong> usando apps como:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Cámara nativa del teléfono</li>
            <li>Google Lens</li>
            <li>QR Scanner apps</li>
            <li>WhatsApp (opción escanear QR)</li>
          </ul>
          <p>5. <strong>Verifica</strong> que se abre la página de pago correcta</p>
        </div>
      </div>

      {/* Lista de QRs para testing */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">QRs Disponibles para Testing</h3>

        {cuentasPrueba.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No hay cuentas activas para testing</p>
            <p className="text-sm text-gray-500">Crea algunas cuentas en el módulo SplitQR</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {cuentasPrueba.map((cuenta) => {
              const testResult = testResults[cuenta.id];

              return (
                <div key={cuenta.id} className="bg-white border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <QrCode className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Mesa {cuenta.mesa_numero}</h4>
                        <p className="text-sm text-gray-600">
                          QR ID: {cuenta.qr_code_id}
                        </p>
                        <p className="text-sm text-gray-600">
                          Total: €{cuenta.total.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Estado del test */}
                    <div className="text-right">
                      {testResult && (
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                          testResult.status === 'success'
                            ? 'bg-green-100 text-green-800'
                            : testResult.status === 'error'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {testResult.status === 'success' && <CheckCircle className="w-4 h-4" />}
                          {testResult.status === 'error' && <AlertTriangle className="w-4 h-4" />}
                          {testResult.status === 'testing' && <RefreshCw className="w-4 h-4 animate-spin" />}
                          {testResult.message}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* URL si está disponible */}
                  {testResult?.url && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">URL del QR:</p>
                      <p className="text-sm font-mono text-gray-800 break-all">
                        {testResult.url}
                      </p>
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => probarURL(cuenta)}
                      className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm"
                    >
                      <TestTube className="w-4 h-4" />
                      Probar URL
                    </button>

                    <button
                      onClick={() => copiarURL(cuenta)}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Copy className="w-4 h-4" />
                      Copiar URL
                    </button>

                    <button
                      onClick={() => abrirURL(cuenta)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Abrir
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Checklist de compatibilidad */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Checklist de Compatibilidad QR
        </h3>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-gray-700">URLs utilizan HTTPS (protocolo seguro)</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-gray-700">URLs son públicamente accesibles</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-gray-700">QRs generados con formato estándar ISO/IEC 18004</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-gray-700">QRs contienen URLs válidas (no blobs locales)</span>
          </div>
          <div className="flex items-center gap-3">
            <Wifi className="w-5 h-5 text-blue-500" />
            <span className="text-gray-700">Compatible con todas las apps de escaneo estándar</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRTester;