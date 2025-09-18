/**
 * @fileoverview Componente de tarjeta para mostrar códigos QR individuales
 * Diseñado con glassmorphism siguiendo el estilo del dashboard
 */

import React, { useState } from 'react';
import {
  Eye,
  Download,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  Calendar,
  BarChart3,
  QrCode,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { copyToClipboard, downloadQR, formatDate } from '../../utils/qrGenerator';

/**
 * Componente QRCard - Tarjeta individual para códigos QR
 * @param {Object} props - Props del componente
 * @param {Object} props.qr - Datos del código QR
 * @param {Function} props.onView - Callback para ver QR
 * @param {Function} props.onEdit - Callback para editar QR
 * @param {Function} props.onDelete - Callback para eliminar QR
 * @returns {JSX.Element} Componente QRCard
 */
const QRCard = ({ qr, onView, onEdit, onDelete }) => {
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  /**
   * Maneja la copia de URL al portapapeles
   */
  const handleCopyUrl = async () => {
    setLoading(true);
    const success = await copyToClipboard(qr.publicUrl);
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
    downloadQR(qr.url, `${qr.name.replace(/\s+/g, '_')}_QR`);
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

  return (
    <div className="glass-card hover:scale-[1.02] transition-all duration-300 group">
      {/* Header con imagen QR y estado */}
      <div className="relative p-6 border-b border-white/10">
        <div className="flex items-start justify-between">
          {/* Imagen QR */}
          <div className="relative">
            <div className="w-20 h-20 bg-white rounded-lg shadow-lg overflow-hidden">
              <img
                src={qr.url}
                alt={`QR Code: ${qr.name}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            {/* Icono de tipo */}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-theme-gradient rounded-full flex-center text-white text-sm shadow-lg">
              {getTypeIcon()}
            </div>
          </div>

          {/* Estado activo/inactivo */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
            qr.active
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              : 'bg-gray-100 text-gray-600 border border-gray-200'
          }`}>
            {qr.active ? (
              <CheckCircle className="w-3 h-3" />
            ) : (
              <AlertCircle className="w-3 h-3" />
            )}
            {qr.active ? 'Activo' : 'Inactivo'}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-6">
        {/* Título y descripción */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-1">
            {qr.name}
          </h3>
          <p className="text-sm text-slate-600 line-clamp-2">
            {qr.description}
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-xs text-slate-500">Escaneos</p>
              <p className="font-semibold text-slate-900">{qr.scanCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-violet-500" />
            <div>
              <p className="text-xs text-slate-500">Creado</p>
              <p className="font-semibold text-slate-900 text-xs">
                {formatDate(qr.created)}
              </p>
            </div>
          </div>
        </div>

        {/* URL pública */}
        <div className="mb-6">
          <p className="text-xs text-slate-500 mb-2">URL Pública:</p>
          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border">
            <ExternalLink className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="text-xs text-slate-600 truncate flex-1">
              {qr.publicUrl}
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

        {/* Acciones */}
        <div className="flex gap-2">
          {/* Botón Ver */}
          <button
            onClick={() => onView(qr)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            <Eye className="w-4 h-4" />
            Ver
          </button>

          {/* Botón Descargar */}
          <button
            onClick={handleDownload}
            className="px-3 py-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            title="Descargar QR"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Botón Editar */}
          <button
            onClick={() => onEdit(qr)}
            className="px-3 py-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors"
            title="Editar QR"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {/* Botón Eliminar */}
          <button
            onClick={() => onDelete(qr)}
            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            title="Eliminar QR"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Overlay de hover */}
      <div className="absolute inset-0 bg-theme-gradient opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-xl pointer-events-none" />
    </div>
  );
};

export default QRCard;