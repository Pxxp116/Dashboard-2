import React, { useState, useRef, useEffect } from 'react';
import {
  QrCode,
  Download,
  Copy,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Link,
  Eye,
  X,
  Share2,
  Printer,
  Plus,
  Settings
} from 'lucide-react';
import splitQRService from '../../services/api/splitQRService';

const QRGenerator = ({ mesasData, cuentasActivas, onAbrirCuenta, onActualizar }) => {
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [generandoQR, setGenerandoQR] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [modalPreview, setModalPreview] = useState(false);
  const [paymentModuleUrl, setPaymentModuleUrl] = useState(null);
  const [qrConfig, setQrConfig] = useState({
    size: 256,
    includeLink: true,
    includeLogo: true,
    backgroundColor: '#ffffff',
    foregroundColor: '#000000'
  });

  const canvasRef = useRef(null);

  // Obtener URL del módulo de pago al cargar el componente
  useEffect(() => {
    const obtenerConfiguracion = async () => {
      try {
        const config = await splitQRService.obtenerConfiguracionPago();
        setPaymentModuleUrl(config.payment_module_url);
      } catch (error) {
        console.error('Error obteniendo configuración de pago:', error);
        // Fallback a URL por defecto
        setPaymentModuleUrl(process.env.REACT_APP_PAYMENT_URL || 'https://gastrobot-payment.railway.app');
      }
    };
    obtenerConfiguracion();
  }, []);

  // Mostrar mensaje temporal
  const mostrarMensaje = (texto, tipo = 'success') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 3000);
  };

  // Generar QR code usando Canvas API (simulación)
  const generarQRCode = async (qrCodeId, mesa) => {
    try {
      setGenerandoQR(true);

      // Simular generación de QR
      // En producción aquí usarías una librería como qrcode
      await new Promise(resolve => setTimeout(resolve, 1000));

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Configurar canvas
      canvas.width = qrConfig.size;
      canvas.height = qrConfig.size + (qrConfig.includeLink ? 60 : 0);

      // Fondo
      ctx.fillStyle = qrConfig.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Simular QR code pattern
      ctx.fillStyle = qrConfig.foregroundColor;
      const cellSize = qrConfig.size / 25;

      // Patrón de QR simplificado
      for (let i = 0; i < 25; i++) {
        for (let j = 0; j < 25; j++) {
          if (Math.random() > 0.5) {
            ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
          }
        }
      }

      // Esquinas de detección (simuladas)
      ctx.fillStyle = qrConfig.foregroundColor;
      ctx.fillRect(0, 0, cellSize * 7, cellSize * 7);
      ctx.fillRect(cellSize * 18, 0, cellSize * 7, cellSize * 7);
      ctx.fillRect(0, cellSize * 18, cellSize * 7, cellSize * 7);

      ctx.fillStyle = qrConfig.backgroundColor;
      ctx.fillRect(cellSize, cellSize, cellSize * 5, cellSize * 5);
      ctx.fillRect(cellSize * 19, cellSize, cellSize * 5, cellSize * 5);
      ctx.fillRect(cellSize, cellSize * 19, cellSize * 5, cellSize * 5);

      // URL debajo del QR si está habilitado
      if (qrConfig.includeLink) {
        ctx.fillStyle = '#333333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        const url = `${paymentModuleUrl || 'https://gastrobot-payment.railway.app'}/mesa/${qrCodeId}/pago`;
        ctx.fillText(url, canvas.width / 2, qrConfig.size + 20);
        ctx.fillText(`Mesa ${mesa.numero}`, canvas.width / 2, qrConfig.size + 40);
      }

      return canvas.toDataURL();

    } catch (error) {
      console.error('Error generando QR:', error);
      throw error;
    } finally {
      setGenerandoQR(false);
    }
  };

  // Descargar QR como imagen usando el servicio real
  const descargarQR = async (cuenta, mesa, formato = 'png') => {
    try {
      setGenerandoQR(true);

      // Usar el servicio real para descargar la imagen QR
      await splitQRService.descargarImagenQR(cuenta.id, formato, qrConfig.size);

      mostrarMensaje(`QR de Mesa ${mesa.numero} descargado correctamente`);
    } catch (error) {
      console.error('Error descargando QR:', error);
      mostrarMensaje('Error al descargar QR: ' + error.message, 'error');
    } finally {
      setGenerandoQR(false);
    }
  };

  // Copiar enlace al portapapeles usando URL dinámica
  const copiarEnlace = async (cuenta, mesaNumero) => {
    try {
      // Construir URL dinámicamente
      const url = await splitQRService.construirURLPago(cuenta.qr_code_id);
      await navigator.clipboard.writeText(url);
      mostrarMensaje(`Enlace de Mesa ${mesaNumero} copiado al portapapeles`);
    } catch (error) {
      console.error('Error copiando enlace:', error);
      mostrarMensaje('Error al copiar enlace: ' + error.message, 'error');
    }
  };

  // Generar nuevo QR para mesa sin cuenta
  const generarNuevoQR = async (mesa) => {
    try {
      setGenerandoQR(true);
      const nuevaCuenta = await onAbrirCuenta(mesa.id);
      mostrarMensaje(`QR generado para Mesa ${mesa.numero}`);
      onActualizar();
    } catch (error) {
      mostrarMensaje('Error al generar QR', 'error');
    } finally {
      setGenerandoQR(false);
    }
  };

  // Vista previa del QR
  const mostrarPreview = async (cuenta, mesa) => {
    try {
      setSelectedMesa({ cuenta, mesa });
      setModalPreview(true);
    } catch (error) {
      mostrarMensaje('Error al mostrar vista previa', 'error');
    }
  };

  // Regenerar QR para cuenta existente
  const regenerarQR = async (cuenta, mesa) => {
    try {
      setGenerandoQR(true);

      const response = await splitQRService.regenerarQR(cuenta.id);

      if (response.exito) {
        mostrarMensaje(`QR regenerado para Mesa ${mesa.numero}`);
        onActualizar(); // Recargar datos
        setModalPreview(false); // Cerrar modal
      } else {
        throw new Error(response.mensaje || 'Error regenerando QR');
      }
    } catch (error) {
      console.error('Error regenerando QR:', error);
      mostrarMensaje('Error al regenerar QR: ' + error.message, 'error');
    } finally {
      setGenerandoQR(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Generador de QRs</h2>
          <p className="text-gray-600">Crea y gestiona códigos QR únicos para cada mesa</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onActualizar}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>

          <button
            onClick={() => {/* TODO: Abrir configuración */}}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Configurar
          </button>
        </div>
      </div>

      {/* Mensajes */}
      {mensaje && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          mensaje.tipo === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {mensaje.tipo === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{mensaje.texto}</span>
        </div>
      )}

      {/* Canvas oculto para generar QRs */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Grid de mesas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mesasData.map((mesa) => {
          const cuenta = cuentasActivas.find(c => c.mesa_id === mesa.id);

          return (
            <div key={mesa.id} className="bg-white rounded-lg shadow-md p-6">
              {/* Header de la mesa */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    cuenta ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <QrCode className={`w-6 h-6 ${
                      cuenta ? 'text-blue-600' : 'text-gray-500'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Mesa {mesa.numero}</h3>
                    <p className="text-sm text-gray-600">{mesa.capacidad} personas</p>
                  </div>
                </div>

                <div className={`w-3 h-3 rounded-full ${
                  cuenta ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              </div>

              {/* Estado */}
              <div className="mb-4">
                {cuenta ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Estado:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        cuenta.estado === 'pagada'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {cuenta.estado === 'pagada' ? 'Pagada' : 'Activa'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-medium">€{cuenta.total.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">QR ID:</span>
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {cuenta.qr_code_id.slice(-8)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm mb-2">Sin QR activo</p>
                    <p className="text-xs text-gray-400">Genera un QR para esta mesa</p>
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="space-y-2">
                {cuenta ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => mostrarPreview(cuenta, mesa)}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        Ver
                      </button>
                      <button
                        onClick={() => descargarQR(cuenta, mesa)}
                        disabled={generandoQR}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                      >
                        <Download className="w-4 h-4" />
                        Descargar
                      </button>
                    </div>

                    <button
                      onClick={() => copiarEnlace(cuenta, mesa.numero)}
                      className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <Copy className="w-4 h-4" />
                      Copiar enlace
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => generarNuevoQR(mesa)}
                    disabled={generandoQR}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {generandoQR ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Generar QR
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de vista previa */}
      {modalPreview && selectedMesa && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                QR Mesa {selectedMesa.mesa.numero}
              </h3>
              <button
                onClick={() => setModalPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview del QR */}
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                <iframe
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=${qrConfig.size}x${qrConfig.size}&data=${encodeURIComponent(`${paymentModuleUrl || 'https://gastrobot-payment.railway.app'}/mesa/${selectedMesa.cuenta.qr_code_id}/pago`)}`}
                  width={qrConfig.size}
                  height={qrConfig.size}
                  className="border-0"
                  title="QR Code Preview"
                />
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">URL de pago:</p>
                <p className="text-xs font-mono text-gray-800 break-all">
                  {paymentModuleUrl || 'https://gastrobot-payment.railway.app'}/mesa/{selectedMesa.cuenta.qr_code_id}/pago
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  QR ID: {selectedMesa.cuenta.qr_code_id}
                </p>
              </div>
            </div>

            {/* Acciones */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => descargarQR(selectedMesa.cuenta, selectedMesa.mesa)}
                disabled={generandoQR}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Descargar
              </button>
              <button
                onClick={() => copiarEnlace(selectedMesa.cuenta, selectedMesa.mesa.numero)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Compartir
              </button>
              <button
                onClick={() => regenerarQR(selectedMesa.cuenta, selectedMesa.mesa)}
                disabled={generandoQR}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {generandoQR ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Regenerar
              </button>
            </div>

            {/* Instrucciones */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-2">
                <Smartphone className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Instrucciones para clientes:</p>
                  <ol className="text-xs space-y-1 list-decimal list-inside">
                    <li>Escanear el código QR con el móvil</li>
                    <li>Ver los productos de la mesa</li>
                    <li>Seleccionar qué productos pagar</li>
                    <li>Completar el pago de forma segura</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resumen de acciones rápidas */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              // Generar QRs para todas las mesas sin cuenta
              const mesasSinCuenta = mesasData.filter(mesa =>
                !cuentasActivas.find(c => c.mesa_id === mesa.id)
              );
              if (mesasSinCuenta.length > 0) {
                mesasSinCuenta.forEach(mesa => generarNuevoQR(mesa));
              } else {
                mostrarMensaje('Todas las mesas ya tienen QR activo');
              }
            }}
            className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
          >
            <QrCode className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Generar QRs Faltantes</p>
            <p className="text-sm text-gray-600">
              {mesasData.filter(mesa => !cuentasActivas.find(c => c.mesa_id === mesa.id)).length} mesas
            </p>
          </button>

          <button
            onClick={() => {
              // Descargar todos los QRs activos
              cuentasActivas.forEach(cuenta => {
                const mesa = mesasData.find(m => m.id === cuenta.mesa_id);
                if (mesa) {
                  setTimeout(() => descargarQR(cuenta, mesa), 500);
                }
              });
            }}
            className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
          >
            <Download className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Descargar Todos</p>
            <p className="text-sm text-gray-600">
              {cuentasActivas.length} QRs activos
            </p>
          </button>

          <button
            onClick={() => {
              // Imprimir QRs (funcionalidad futura)
              mostrarMensaje('Función de impresión próximamente');
            }}
            className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
          >
            <Printer className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Imprimir QRs</p>
            <p className="text-sm text-gray-600">Próximamente</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;