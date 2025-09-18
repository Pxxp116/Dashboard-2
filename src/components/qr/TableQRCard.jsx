/**
 * @fileoverview Componente de tarjeta para QR de mesa con estado de pago
 * Muestra información visual del QR, estado de pago y controles de acción
 */

import React, { useState } from 'react';
import {
  QrCode,
  Download,
  Copy,
  ExternalLink,
  Users,
  CreditCard,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Printer,
  RefreshCw,
  Eye,
  Settings,
  Trash2
} from 'lucide-react';
import {
  PAYMENT_STATUS,
  formatCurrency
} from '../../utils/tableQRGenerator';
import { copyToClipboard, downloadQR } from '../../utils/qrGenerator';

/**
 * Componente TableQRCard - Tarjeta para QR de mesa con funcionalidad de pago
 * @param {Object} props - Props del componente
 * @param {Object} props.tableQR - Datos del QR de mesa
 * @param {Function} props.onViewPayment - Callback para ver estado de pago
 * @param {Function} props.onConfigureSplit - Callback para configurar división
 * @param {Function} props.onRegenerate - Callback para regenerar QR
 * @param {Function} props.onDelete - Callback para eliminar QR
 * @returns {JSX.Element} Componente TableQRCard
 */
const TableQRCard = ({
  tableQR,
  onViewPayment,
  onConfigureSplit,
  onRegenerate,
  onDelete
}) => {
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  /**
   * Obtiene el color y estilo basado en el estado de pago
   */
  const getPaymentStatusStyle = () => {
    switch (tableQR.paymentStatus) {
      case PAYMENT_STATUS.PENDING:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
          icon: Clock,
          label: 'Pendiente'
        };
      case PAYMENT_STATUS.PARTIAL:
        return {
          bgColor: 'bg-amber-100',
          textColor: 'text-amber-700',
          borderColor: 'border-amber-200',
          icon: AlertTriangle,
          label: 'Parcial'
        };
      case PAYMENT_STATUS.COMPLETED:
        return {
          bgColor: 'bg-emerald-100',
          textColor: 'text-emerald-700',
          borderColor: 'border-emerald-200',
          icon: CheckCircle,
          label: 'Completado'
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
          icon: Clock,
          label: 'Sin estado'
        };
    }
  };

  /**
   * Maneja la copia de URL al portapapeles
   */
  const handleCopyUrl = async () => {
    setLoading(true);
    const success = await copyToClipboard(tableQR.paymentUrl);
    if (success) {
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    }
    setLoading(false);
  };

  /**
   * Maneja la descarga del código QR
   */
  const handleDownload = () => {
    downloadQR(tableQR.url, `Mesa_${tableQR.mesa_numero}_QR`);
  };

  /**
   * Maneja la impresión del QR
   */
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Mesa ${tableQR.mesa_numero}</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
            .qr-container { margin: 20px 0; }
            .qr-image { max-width: 300px; }
            .mesa-info { margin: 20px 0; font-size: 18px; }
            .instructions { margin-top: 30px; font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <h1>Mesa ${tableQR.mesa_numero}</h1>
          <div class="mesa-info">
            <p><strong>Capacidad:</strong> ${tableQR.description}</p>
            <p><strong>Escanee para pagar su cuenta</strong></p>
          </div>
          <div class="qr-container">
            <img src="${tableQR.url}" alt="QR Mesa ${tableQR.mesa_numero}" class="qr-image" />
          </div>
          <div class="instructions">
            <p>1. Escanee el código QR con su teléfono</p>
            <p>2. Revise los ítems de su cuenta</p>
            <p>3. Elija como dividir el pago</p>
            <p>4. Complete el pago de forma segura</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  /**
   * Calcula el porcentaje de pago completado
   */
  const getPaymentProgress = () => {
    if (!tableQR.totalAmount || tableQR.totalAmount === 0) return 0;
    return Math.round((tableQR.paidAmount / tableQR.totalAmount) * 100);
  };

  const statusStyle = getPaymentStatusStyle();
  const StatusIcon = statusStyle.icon;
  const progress = getPaymentProgress();

  return (
    <div className="glass-card hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden">
      {/* Header con número de mesa y estado */}
      <div className="relative p-6 border-b border-white/10">
        <div className="flex items-start justify-between mb-4">
          {/* Número de mesa */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-theme-gradient rounded-xl flex-center text-white font-bold text-lg shadow-lg">
              {tableQR.mesa_numero}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Mesa {tableQR.mesa_numero}
              </h3>
              <p className="text-sm text-slate-600">
                {tableQR.description}
              </p>
            </div>
          </div>

          {/* Estado de pago */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${statusStyle.bgColor} ${statusStyle.textColor} ${statusStyle.borderColor}`}>
            <StatusIcon className="w-3 h-3" />
            {statusStyle.label}
          </div>
        </div>

        {/* QR Code pequeño */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={tableQR.url}
              alt={`QR Mesa ${tableQR.mesa_numero}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* Información de pago */}
      <div className="p-6">
        {/* Progreso de pago */}
        {tableQR.totalAmount > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700">Progreso de Pago</span>
              <span className="text-sm text-slate-600">{progress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  progress === 100 ? 'bg-emerald-500' :
                  progress > 0 ? 'bg-amber-500' : 'bg-gray-300'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Montos */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <DollarSign className="w-4 h-4 text-slate-500 mx-auto mb-1" />
            <p className="text-xs text-slate-500">Total</p>
            <p className="font-semibold text-slate-900">
              {formatCurrency(tableQR.totalAmount || 0)}
            </p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <CreditCard className="w-4 h-4 text-slate-500 mx-auto mb-1" />
            <p className="text-xs text-slate-500">Pendiente</p>
            <p className="font-semibold text-slate-900">
              {formatCurrency(tableQR.pendingAmount || 0)}
            </p>
          </div>
        </div>

        {/* Participantes */}
        {tableQR.participants && tableQR.participants.length > 0 && (
          <div className="flex items-center gap-2 mb-6 p-3 bg-blue-50 rounded-lg">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-blue-700">
              {tableQR.participants.length} participante{tableQR.participants.length !== 1 ? 's' : ''}
            </span>
            {tableQR.splitMode && (
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                {tableQR.splitMode === 'equal' ? 'División igual' : 'Por ítems'}
              </span>
            )}
          </div>
        )}

        {/* URL de pago */}
        <div className="mb-6">
          <p className="text-xs text-slate-500 mb-2">URL de Pago:</p>
          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border">
            <ExternalLink className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="text-xs text-slate-600 truncate flex-1">
              {tableQR.paymentUrl}
            </span>
            <button
              onClick={handleCopyUrl}
              disabled={loading}
              className={`p-1 rounded transition-colors ${
                showCopySuccess
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-white'
              }`}
              title="Copiar URL"
            >
              {showCopySuccess ? (
                <CheckCircle className="w-3 h-3" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>

        {/* Acciones principales */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={() => onViewPayment(tableQR)}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            <Eye className="w-4 h-4" />
            Ver Estado
          </button>
          <button
            onClick={() => onConfigureSplit(tableQR)}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-violet-50 text-violet-600 rounded-lg hover:bg-violet-100 transition-colors text-sm font-medium"
          >
            <Settings className="w-4 h-4" />
            Configurar
          </button>
        </div>

        {/* Acciones secundarias */}
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors text-sm"
            title="Descargar QR"
          >
            <Download className="w-4 h-4" />
            Descargar
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors text-sm"
            title="Imprimir QR"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
          <button
            onClick={() => onRegenerate(tableQR)}
            className="px-3 py-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors"
            title="Regenerar QR"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(tableQR)}
            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            title="Eliminar QR"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Información adicional */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Escaneos: {tableQR.scanCount || 0}</span>
            <span>
              Creado: {new Date(tableQR.created).toLocaleDateString('es-ES')}
            </span>
          </div>
        </div>
      </div>

      {/* Overlay de hover */}
      <div className="absolute inset-0 bg-theme-gradient opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-xl pointer-events-none" />

      {/* Indicador de estado activo */}
      {tableQR.active && (
        <div className="absolute top-4 right-4 w-3 h-3 bg-emerald-500 rounded-full shadow-lg"></div>
      )}
    </div>
  );
};

export default TableQRCard;