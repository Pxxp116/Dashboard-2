/**
 * @fileoverview Tab principal para gestión de códigos QR por mesa
 * Incluye vista general, estadísticas y gestión de pagos fraccionados
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  QrCode,
  Users,
  CreditCard,
  BarChart3,
  Download,
  RefreshCw,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Grid,
  List,
  Printer
} from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import TableQRCard from './TableQRCard';
import PaymentSplitModal from './PaymentSplitModal';
import PaymentStatusModal from './PaymentStatusModal';
import tableQRService from '../../services/tableQRService';
import { useAppContext } from '../../context/AppContext';
import {
  PAYMENT_STATUS,
  generateTableQR,
  calculateTablePaymentStats,
  exportPaymentDataToCSV,
  formatCurrency
} from '../../utils/tableQRGenerator';

/**
 * Tab principal de QR por mesa
 * @returns {JSX.Element} Componente TableQRTab
 */
const TableQRTab = () => {
  const { datosEspejo } = useAppContext();
  const mesas = datosEspejo?.mesas || [];

  const [tableQRs, setTableQRs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('mesa_numero');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [loading, setLoading] = useState(false);

  // Modales
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedTableQR, setSelectedTableQR] = useState(null);

  /**
   * Carga QRs de mesa al montar el componente
   */
  useEffect(() => {
    loadTableQRs();
  }, []);

  /**
   * Genera QRs automáticamente para mesas que no los tienen
   */
  useEffect(() => {
    if (mesas.length > 0 && tableQRs.length === 0) {
      generateQRsForAllTables();
    }
  }, [mesas, tableQRs]);

  /**
   * Carga todos los QRs de mesa
   */
  const loadTableQRs = async () => {
    setLoading(true);
    try {
      const qrs = await tableQRService.getAllTableQRs();
      setTableQRs(qrs);
    } catch (error) {
      console.error('Error loading table QRs:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Genera QRs para todas las mesas
   */
  const generateQRsForAllTables = async () => {
    setLoading(true);
    try {
      const qrs = await tableQRService.createMultipleTableQRs(mesas);
      setTableQRs(qrs);
    } catch (error) {
      console.error('Error generating table QRs:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * QRs filtrados y ordenados
   */
  const filteredQRs = useMemo(() => {
    let filtered = tableQRs.filter(qr => {
      const matchesSearch =
        qr.mesa_numero.toString().includes(searchTerm) ||
        qr.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'all' || qr.paymentStatus === filterStatus;

      return matchesSearch && matchesStatus;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let valueA, valueB;

      switch (sortBy) {
        case 'mesa_numero':
          valueA = a.mesa_numero;
          valueB = b.mesa_numero;
          break;
        case 'totalAmount':
          valueA = a.totalAmount || 0;
          valueB = b.totalAmount || 0;
          break;
        case 'scanCount':
          valueA = a.scanCount || 0;
          valueB = b.scanCount || 0;
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
  }, [tableQRs, searchTerm, filterStatus, sortBy, sortOrder]);

  /**
   * Estadísticas calculadas
   */
  const stats = useMemo(() => calculateTablePaymentStats(tableQRs), [tableQRs]);

  /**
   * Maneja la configuración de división de pago
   */
  const handleConfigureSplit = (tableQR) => {
    setSelectedTableQR(tableQR);
    setShowSplitModal(true);
  };

  /**
   * Maneja la visualización del estado de pago
   */
  const handleViewPayment = (tableQR) => {
    setSelectedTableQR(tableQR);
    setShowStatusModal(true);
  };

  /**
   * Guarda la configuración de división
   */
  const handleSaveSplit = async (paymentData) => {
    if (!selectedTableQR) return;

    try {
      const updatedQR = await tableQRService.updatePaymentStatus(
        selectedTableQR.mesa_id,
        paymentData
      );

      setTableQRs(prev => prev.map(qr =>
        qr.mesa_id === selectedTableQR.mesa_id ? updatedQR : qr
      ));
    } catch (error) {
      console.error('Error saving split configuration:', error);
    }
  };

  /**
   * Regenera QR de una mesa
   */
  const handleRegenerateQR = async (tableQR) => {
    try {
      const mesa = mesas.find(m => m.id === tableQR.mesa_id);
      if (!mesa) return;

      const newQR = await tableQRService.regenerateTableQR(tableQR.mesa_id, mesa);
      setTableQRs(prev => prev.map(qr =>
        qr.mesa_id === tableQR.mesa_id ? newQR : qr
      ));
    } catch (error) {
      console.error('Error regenerating QR:', error);
    }
  };

  /**
   * Elimina QR de una mesa
   */
  const handleDeleteQR = async (tableQR) => {
    if (!window.confirm(`¿Seguro que quieres eliminar el QR de la Mesa ${tableQR.mesa_numero}?`)) {
      return;
    }

    try {
      await tableQRService.deleteTableQR(tableQR.mesa_id);
      setTableQRs(prev => prev.filter(qr => qr.mesa_id !== tableQR.mesa_id));
    } catch (error) {
      console.error('Error deleting QR:', error);
    }
  };

  /**
   * Exporta datos de pagos
   */
  const handleExportData = async () => {
    try {
      const csvData = await tableQRService.exportPaymentData('csv');
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pagos_mesas_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  /**
   * Imprime todos los QRs
   */
  const handlePrintAllQRs = () => {
    const printWindow = window.open('', '_blank');
    const qrsHtml = filteredQRs.map(qr => `
      <div style="page-break-after: always; text-align: center; padding: 40px;">
        <h2>Mesa ${qr.mesa_numero}</h2>
        <p>${qr.description}</p>
        <div style="margin: 20px 0;">
          <img src="${qr.url}" alt="QR Mesa ${qr.mesa_numero}" style="max-width: 300px;" />
        </div>
        <p style="font-size: 14px; color: #666;">
          Escanee para acceder al pago de la cuenta
        </p>
        <p style="font-size: 12px; color: #999; margin-top: 20px;">
          ${qr.paymentUrl}
        </p>
      </div>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>QRs de Mesas - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          ${qrsHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  /**
   * Cierra modales
   */
  const closeModals = () => {
    setShowSplitModal(false);
    setShowStatusModal(false);
    setSelectedTableQR(null);
  };

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            QR de Mesas para Pagos
          </h1>
          <p className="text-slate-600">
            Gestiona códigos QR por mesa con división de pagos
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={loadTableQRs}
            variant="outline"
            icon={RefreshCw}
            loading={loading}
          >
            Actualizar
          </Button>
          <Button
            onClick={generateQRsForAllTables}
            icon={Plus}
          >
            Generar QRs
          </Button>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex-center">
              <QrCode className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Mesas</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Completados</p>
              <p className="text-2xl font-bold text-slate-900">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Pendientes</p>
              <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 rounded-lg flex-center">
              <CreditCard className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Pagado</p>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(stats.paidAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controles de búsqueda y filtros */}
      <div className="glass-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Búsqueda */}
          <Input
            placeholder="Buscar mesas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
          />

          {/* Filtro por estado */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos los estados</option>
            <option value={PAYMENT_STATUS.PENDING}>Pendientes</option>
            <option value={PAYMENT_STATUS.PARTIAL}>Parciales</option>
            <option value={PAYMENT_STATUS.COMPLETED}>Completados</option>
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
            <option value="mesa_numero-asc">Mesa (A-Z)</option>
            <option value="mesa_numero-desc">Mesa (Z-A)</option>
            <option value="totalAmount-desc">Mayor monto</option>
            <option value="totalAmount-asc">Menor monto</option>
            <option value="scanCount-desc">Más escaneados</option>
            <option value="created-desc">Más recientes</option>
          </select>

          {/* Modo de vista */}
          <div className="flex border border-slate-300 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex-1 px-3 py-2 rounded-l-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Grid className="w-4 h-4 mx-auto" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 px-3 py-2 rounded-r-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <List className="w-4 h-4 mx-auto" />
            </button>
          </div>

          {/* Acciones adicionales */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              icon={Download}
            >
              Exportar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintAllQRs}
              icon={Printer}
            >
              Imprimir
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de QRs */}
      <div className="space-y-4">
        {/* Header de la lista */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Mesas con QR ({filteredQRs.length})
          </h2>

          {stats.mostActiveTable && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <BarChart3 className="w-4 h-4" />
              <span>
                Más activa: <strong>Mesa {stats.mostActiveTable.mesa_numero}</strong> ({stats.mostActiveTable.scanCount} escaneos)
              </span>
            </div>
          )}
        </div>

        {/* Grid/Lista de QRs */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="h-32 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredQRs.length > 0 ? (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {filteredQRs.map((tableQR) => (
              <TableQRCard
                key={tableQR.id}
                tableQR={tableQR}
                onViewPayment={handleViewPayment}
                onConfigureSplit={handleConfigureSplit}
                onRegenerate={handleRegenerateQR}
                onDelete={handleDeleteQR}
              />
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <QrCode className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No se encontraron QRs de mesa
            </h3>
            <p className="text-slate-600 mb-6">
              {tableQRs.length === 0
                ? 'Aún no se han generado códigos QR para las mesas.'
                : 'Prueba ajustando los filtros de búsqueda.'}
            </p>
            {tableQRs.length === 0 && (
              <Button
                onClick={generateQRsForAllTables}
                icon={Plus}
              >
                Generar QRs para todas las mesas
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Modales */}
      <PaymentSplitModal
        isOpen={showSplitModal}
        onClose={closeModals}
        onSave={handleSaveSplit}
        tableQR={selectedTableQR}
      />

      <PaymentStatusModal
        isOpen={showStatusModal}
        onClose={closeModals}
        tableQR={selectedTableQR}
        onRefresh={() => {
          if (selectedTableQR) {
            // Simular actualización de datos
            loadTableQRs();
          }
        }}
        onSendReminder={(participantId) => {
          console.log('Sending reminder to participant:', participantId);
        }}
        onMarkPaid={(participantId) => {
          console.log('Marking as paid:', participantId);
        }}
      />
    </div>
  );
};

export default TableQRTab;