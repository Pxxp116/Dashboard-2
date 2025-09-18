/**
 * @fileoverview Modal de vista previa ampliada para códigos QR
 * Incluye estadísticas detalladas y opciones de descarga
 */

import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  ExternalLink,
  BarChart3,
  Calendar,
  Eye,
  Share2,
  QrCode,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import Button from '../ui/Button';
import { copyToClipboard, downloadQR, formatDate } from '../../utils/qrGenerator';

/**
 * Modal de vista previa para códigos QR
 * @param {Object} props - Props del componente
 * @param {boolean} props.isOpen - Estado del modal
 * @param {Function} props.onClose - Callback para cerrar
 * @param {Object} props.qr - Datos del código QR
 * @param {Function} props.onEdit - Callback para editar
 * @returns {JSX.Element} Componente QRPreviewModal
 */
const QRPreviewModal = ({ isOpen, onClose, qr, onEdit }) => {
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState('png');

  if (!qr) return null;

  /**
   * Maneja la copia de URL al portapapeles
   */
  const handleCopyUrl = async () => {
    const success = await copyToClipboard(qr.publicUrl);
    if (success) {
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    }
  };

  /**
   * Maneja la descarga del código QR
   */
  const handleDownload = () => {
    let downloadUrl = qr.url;

    // Generar diferentes tamaños según el formato
    const sizes = {
      png: 300,
      svg: 300,
      pdf: 300
    };

    const size = sizes[downloadFormat] || 300;
    if (downloadFormat !== 'png') {
      downloadUrl = qr.url.replace(/size=\d+x\d+/, `size=${size}x${size}&format=${downloadFormat}`);
    }

    downloadQR(downloadUrl, `${qr.name.replace(/\s+/g, '_')}_QR`);
  };

  /**
   * Obtiene el icono basado en el tipo de QR
   */
  const getTypeIcon = () => {
    const iconMap = {
      'menu-completo': '🍽️',
      'bebidas': '🍷',
      'postres': '🧁',
      'menu-del-dia': '📅',
      'promociones': '🏷️',
      'reservas': '📋'
    };
    return iconMap[qr.type] || '🔗';
  };

  /**
   * Calcula el crecimiento simulado de escaneos
   */
  const getGrowthData = () => {
    // Datos simulados para demo
    const lastWeek = Math.max(0, qr.scanCount - Math.floor(Math.random() * 10));
    const growth = lastWeek > 0 ? ((qr.scanCount - lastWeek) / lastWeek * 100) : 0;
    return {
      lastWeek,
      growth: Math.round(growth)
    };
  };

  const growthData = getGrowthData();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            {/* QR Image */}
            <div className="relative">
              <div className="w-20 h-20 bg-white rounded-xl shadow-lg overflow-hidden">
                <img
                  src={qr.url}
                  alt={`QR Code: ${qr.name}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-theme-gradient rounded-full flex-center text-white text-sm shadow-lg">
                {getTypeIcon()}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-bold text-slate-900">{qr.name}</h2>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  qr.active
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {qr.active ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <AlertCircle className="w-3 h-3" />
                  )}
                  {qr.active ? 'Activo' : 'Inactivo'}
                </div>
              </div>
              <p className="text-slate-600 mb-3">{qr.description}</p>
              <p className="text-sm text-slate-500">
                Creado el {formatDate(qr.created)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vista previa del QR */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              Código QR
            </h3>

            <div className="glass-card-sm p-6 text-center">
              <img
                src={qr.url}
                alt={`QR Code: ${qr.name}`}
                className="mx-auto mb-4 rounded-lg shadow-md w-48 h-48"
              />

              {/* URL pública */}
              <div className="mb-4">
                <p className="text-sm text-slate-500 mb-2">URL Pública:</p>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border">
                  <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-sm text-slate-600 truncate flex-1">
                    {qr.publicUrl}
                  </span>
                  <button
                    onClick={handleCopyUrl}
                    className={`p-1 rounded transition-colors ${
                      showCopySuccess
                        ? 'text-emerald-600 bg-emerald-50'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-white'
                    }`}
                    title="Copiar URL"
                  >
                    {showCopySuccess ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Opciones de descarga */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Formato de descarga:
                  </label>
                  <select
                    value={downloadFormat}
                    onChange={(e) => setDownloadFormat(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="png">PNG (Recomendado)</option>
                    <option value="svg">SVG (Vector)</option>
                    <option value="pdf">PDF (Impresión)</option>
                  </select>
                </div>

                <Button
                  onClick={handleDownload}
                  icon={Download}
                  className="w-full"
                >
                  Descargar QR
                </Button>
              </div>
            </div>
          </div>

          {/* Estadísticas y acciones */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Estadísticas
            </h3>

            {/* Tarjetas de estadísticas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card-sm p-4 text-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex-center mx-auto mb-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{qr.scanCount}</p>
                <p className="text-sm text-slate-600">Total escaneos</p>
              </div>

              <div className="glass-card-sm p-4 text-center">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex-center mx-auto mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{growthData.lastWeek}</p>
                <p className="text-sm text-slate-600">Última semana</p>
              </div>

              <div className="glass-card-sm p-4 text-center col-span-2">
                <div className="w-8 h-8 bg-violet-100 rounded-lg flex-center mx-auto mb-2">
                  <Calendar className="w-4 h-4 text-violet-600" />
                </div>
                <p className="text-lg font-bold text-slate-900">
                  {qr.lastScanned ? formatDate(qr.lastScanned) : 'Nunca'}
                </p>
                <p className="text-sm text-slate-600">Último escaneo</p>
              </div>
            </div>

            {/* Crecimiento */}
            {growthData.growth !== 0 && (
              <div className={`glass-card-sm p-4 ${
                growthData.growth > 0 ? 'border-l-4 border-emerald-500' : 'border-l-4 border-red-500'
              }`}>
                <div className="flex items-center gap-2">
                  <TrendingUp className={`w-4 h-4 ${
                    growthData.growth > 0 ? 'text-emerald-600' : 'text-red-600'
                  }`} />
                  <span className="text-sm font-medium text-slate-900">
                    {growthData.growth > 0 ? '+' : ''}{growthData.growth}% esta semana
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Comparado con la semana anterior
                </p>
              </div>
            )}

            {/* Información adicional */}
            <div className="glass-card-sm p-4 space-y-3">
              <h4 className="font-medium text-slate-900">Información del QR</h4>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Tipo:</span>
                  <span className="text-slate-900 font-medium">
                    {qr.type ? qr.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Personalizado'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-600">Estado:</span>
                  <span className={`font-medium ${
                    qr.active ? 'text-emerald-600' : 'text-gray-600'
                  }`}>
                    {qr.active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-600">ID:</span>
                  <span className="text-slate-900 font-mono text-xs">
                    {qr.id.substring(0, 12)}...
                  </span>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="space-y-3">
              <Button
                onClick={() => onEdit(qr)}
                variant="outline"
                className="w-full"
                icon={Share2}
              >
                Editar QR
              </Button>

              <Button
                onClick={handleCopyUrl}
                variant="outline"
                className="w-full"
                icon={showCopySuccess ? CheckCircle : Copy}
              >
                {showCopySuccess ? 'URL Copiada' : 'Copiar URL'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default QRPreviewModal;