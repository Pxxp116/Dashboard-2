/**
 * @fileoverview Componente principal para la gestión de códigos QR con funcionalidad SplitQR
 * Incluye lista, búsqueda, filtros y estadísticas
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  QrCode,
  BarChart3,
  Calendar,
  Eye,
  Layers,
  Download,
  Trash2,
  RefreshCw
} from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import QRCard from './QRCard';
import SplitQRModal from './SplitQRModal';
import QRPreviewModal from './QRPreviewModal';
import { calculateQRStats, generateCustomQR } from '../../utils/qrGenerator';

/**
 * Datos de ejemplo para demostración
 */
const DEMO_QRS = [
  {
    id: 'qr_1691234567890_abc123def',
    name: 'Menú Principal',
    description: 'Acceso completo al menú del restaurante',
    type: 'menu-completo',
    url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://gastrobot.com/menu-completo&format=png&ecc=M',
    publicUrl: 'https://gastrobot.com/menu-completo',
    created: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    scanCount: 127,
    active: true,
    lastScanned: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'qr_1691234567891_def456ghi',
    name: 'Carta de Bebidas',
    description: 'Bebidas, cócteles y vinos seleccionados',
    type: 'bebidas',
    url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://gastrobot.com/bebidas&format=png&ecc=M',
    publicUrl: 'https://gastrobot.com/bebidas',
    created: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    scanCount: 89,
    active: true,
    lastScanned: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: 'qr_1691234567892_ghi789jkl',
    name: 'Menú del Día',
    description: 'Especiales y platos del día con precios especiales',
    type: 'menu-del-dia',
    url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://gastrobot.com/menu-del-dia&format=png&ecc=M',
    publicUrl: 'https://gastrobot.com/menu-del-dia',
    created: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    scanCount: 45,
    active: true,
    lastScanned: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'qr_1691234567893_jkl012mno',
    name: 'Promociones Especiales',
    description: 'Descuentos y ofertas limitadas',
    type: 'promociones',
    url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://gastrobot.com/promociones&format=png&ecc=M',
    publicUrl: 'https://gastrobot.com/promociones',
    created: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    scanCount: 23,
    active: false,
    lastScanned: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

/**
 * Componente principal SplitQRTab
 * @returns {JSX.Element} Componente SplitQRTab
 */
const SplitQRTab = () => {
  const [qrs, setQrs] = useState(DEMO_QRS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editingQR, setEditingQR] = useState(null);
  const [selectedQR, setSelectedQR] = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * QRs filtrados y ordenados
   */
  const filteredQRs = useMemo(() => {
    let filtered = qrs.filter(qr => {
      const matchesSearch = qr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           qr.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'all' || qr.type === filterType;
      const matchesStatus = filterStatus === 'all' ||
                           (filterStatus === 'active' && qr.active) ||
                           (filterStatus === 'inactive' && !qr.active);

      return matchesSearch && matchesType && matchesStatus;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let valueA, valueB;

      switch (sortBy) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'scanCount':
          valueA = a.scanCount;
          valueB = b.scanCount;
          break;
        case 'created':
        default:
          valueA = new Date(a.created);
          valueB = new Date(b.created);
          break;
      }

      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    return filtered;
  }, [qrs, searchTerm, filterType, filterStatus, sortBy, sortOrder]);

  /**
   * Estadísticas calculadas
   */
  const stats = useMemo(() => calculateQRStats(qrs), [qrs]);

  /**
   * Maneja la creación/edición de QRs
   */
  const handleSaveQR = (newQRs) => {
    if (editingQR) {
      // Actualizar QR existente
      setQrs(prev => prev.map(qr =>
        qr.id === editingQR.id ? { ...newQRs[0], id: editingQR.id } : qr
      ));
    } else {
      // Agregar nuevos QRs
      setQrs(prev => [...prev, ...newQRs]);
    }
    setEditingQR(null);
  };

  /**
   * Maneja la visualización de un QR
   */
  const handleViewQR = (qr) => {
    setSelectedQR(qr);
    setShowPreviewModal(true);
  };

  /**
   * Maneja la edición de un QR
   */
  const handleEditQR = (qr) => {
    setEditingQR(qr);
    setShowCreateModal(true);
  };

  /**
   * Maneja la eliminación de un QR
   */
  const handleDeleteQR = (qr) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${qr.name}"?`)) {
      setQrs(prev => prev.filter(q => q.id !== qr.id));
    }
  };

  /**
   * Cierra los modales
   */
  const closeModals = () => {
    setShowCreateModal(false);
    setShowPreviewModal(false);
    setEditingQR(null);
    setSelectedQR(null);
  };

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Gestión de Códigos QR
          </h1>
          <p className="text-slate-600">
            Crea, gestiona y analiza códigos QR para tu restaurante
          </p>
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          icon={Plus}
          size="lg"
        >
          Generar nuevo QR
        </Button>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex-center">
              <QrCode className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total QRs</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex-center">
              <Eye className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Escaneos</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalScans}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 rounded-lg flex-center">
              <BarChart3 className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Promedio</p>
              <p className="text-2xl font-bold text-slate-900">{stats.averageScans}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex-center">
              <Layers className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Activos</p>
              <p className="text-2xl font-bold text-slate-900">{stats.active}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controles de búsqueda y filtros */}
      <div className="glass-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <Input
            placeholder="Buscar códigos QR..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
          />

          {/* Filtro por tipo */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos los tipos</option>
            <option value="menu-completo">Menú Completo</option>
            <option value="bebidas">Bebidas</option>
            <option value="postres">Postres</option>
            <option value="menu-del-dia">Menú del Día</option>
            <option value="promociones">Promociones</option>
            <option value="reservas">Reservas</option>
          </select>

          {/* Filtro por estado */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>

          {/* Ordenamiento */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [by, order] = e.target.value.split('-');
              setSortBy(by);
              setSortOrder(order);
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="created-desc">Más recientes</option>
            <option value="created-asc">Más antiguos</option>
            <option value="name-asc">Nombre A-Z</option>
            <option value="name-desc">Nombre Z-A</option>
            <option value="scanCount-desc">Más escaneados</option>
            <option value="scanCount-asc">Menos escaneados</option>
          </select>
        </div>
      </div>

      {/* Lista de QRs */}
      <div className="space-y-4">
        {/* Header de la lista */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Códigos QR ({filteredQRs.length})
          </h2>

          {stats.mostScanned && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <BarChart3 className="w-4 h-4" />
              <span>
                Más popular: <strong>{stats.mostScanned.name}</strong> ({stats.mostScanned.scanCount} escaneos)
              </span>
            </div>
          )}
        </div>

        {/* Grid de tarjetas */}
        {filteredQRs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQRs.map((qr) => (
              <QRCard
                key={qr.id}
                qr={qr}
                onView={handleViewQR}
                onEdit={handleEditQR}
                onDelete={handleDeleteQR}
              />
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <QrCode className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No se encontraron códigos QR
            </h3>
            <p className="text-slate-600 mb-6">
              {qrs.length === 0
                ? 'Aún no has creado ningún código QR. ¡Comienza creando tu primer QR!'
                : 'Prueba ajustando los filtros de búsqueda.'}
            </p>
            {qrs.length === 0 && (
              <Button
                onClick={() => setShowCreateModal(true)}
                icon={Plus}
              >
                Crear primer QR
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Modales */}
      <SplitQRModal
        isOpen={showCreateModal}
        onClose={closeModals}
        onSave={handleSaveQR}
        editingQR={editingQR}
      />

      <QRPreviewModal
        isOpen={showPreviewModal}
        onClose={closeModals}
        qr={selectedQR}
        onEdit={handleEditQR}
      />
    </div>
  );
};

export default SplitQRTab;