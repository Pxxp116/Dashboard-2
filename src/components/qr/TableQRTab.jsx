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
import WaiterInterface from './WaiterInterface';
import tableQRService from '../../services/tableQRService';
import { useAppContext } from '../../context/AppContext';
import {
  PAYMENT_STATUS,
  generateTableQR,
  generateEnhancedTableQR,
  generateEnhancedMultipleTableQRs,
  calculateTablePaymentStats,
  exportPaymentDataToCSV,
  formatCurrency,
  validateTableQRs
} from '../../utils/tableQRGenerator';
import { debugQRGeneration, validateMesaData } from '../../utils/qrDebugger';
import { runCompleteQRDiagnostic, quickDiagnostic } from '../../utils/qrDiagnostic';
import restaurantDataService from '../../services/restaurantDataService';

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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list' | 'waiter'
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
   * Genera QRs para todas las mesas con contexto del restaurante
   */
  const generateQRsForAllTables = async () => {
    setLoading(true);

    try {
      console.log('🚀 Iniciando generación de QRs mejorados para todas las mesas');

      // Validar datos de mesas antes de procesar
      if (!validateMesaData(mesas)) {
        console.warn('⚠️ Problemas detectados en los datos de las mesas');
      }

      // ANÁLISIS DETALLADO: Estructura real de las mesas recibidas
      console.log(`🔍 [ANÁLISIS] Estructura real de mesas recibidas de BD:`, {
        total_mesas: mesas.length,
        muestra_primera_mesa: mesas[0],
        campos_disponibles: mesas[0] ? Object.keys(mesas[0]) : [],
        tipos_de_datos: mesas[0] ? Object.entries(mesas[0]).reduce((acc, [key, value]) => {
          acc[key] = typeof value;
          return acc;
        }, {}) : {}
      });

      // Normalizar mesas asegurando IDs únicos y respetando estructura BD
      const mesasNormalizadas = mesas.map((mesa, index) => {
        // La estructura real de BD: { id: number, numero_mesa: string, capacidad: number, zona: string, activa: boolean, ... }
        const mesaId = mesa.id; // ID siempre debe existir en BD
        const mesaNumero = mesa.numero_mesa; // numero_mesa es el campo real de BD

        console.log(`🔍 Procesando mesa ${index + 1}:`, {
          mesa_original: mesa,
          id_extraido: mesaId,
          numero_extraido: mesaNumero,
          tiene_id: !!mesaId,
          tiene_numero_mesa: !!mesaNumero,
          tipo_id: typeof mesaId,
          valor_numero_mesa: mesaNumero
        });

        // Validación estricta
        if (!mesaId) {
          console.error(`❌ Mesa sin ID en posición ${index}:`, mesa);
          throw new Error(`Mesa en posición ${index} no tiene ID válido de BD`);
        }

        if (!mesaNumero) {
          console.error(`❌ Mesa sin numero_mesa en posición ${index}:`, mesa);
          throw new Error(`Mesa en posición ${index} no tiene numero_mesa válido de BD`);
        }

        return {
          ...mesa, // Mantener toda la estructura original de BD
          id: mesaId, // Asegurar que ID existe
          numero_mesa: mesaNumero, // Mantener numero_mesa original
          numero: mesaNumero, // Compatibilidad hacia atrás
          capacidad: mesa.capacidad || 4
        };
      });

      // Verificar IDs duplicados con análisis detallado
      const ids = mesasNormalizadas.map(m => m.id);
      const numeross = mesasNormalizadas.map(m => m.numero_mesa);
      const idsUnicos = [...new Set(ids)];
      const numerosUnicos = [...new Set(numeross)];

      console.log(`🔍 [VALIDACIÓN] Análisis de unicidad:`, {
        total_mesas: mesasNormalizadas.length,
        ids_array: ids,
        ids_unicos: idsUnicos,
        numeros_mesa_array: numeross,
        numeros_unicos: numerosUnicos,
        hay_ids_duplicados: ids.length !== idsUnicos.length,
        hay_numeros_duplicados: numeross.length !== numerosUnicos.length
      });

      if (ids.length !== idsUnicos.length) {
        console.error('❌ ERROR CRÍTICO: IDs duplicados detectados en base de datos');

        // Análisis detallado de duplicados
        const duplicadosDetalle = {};
        ids.forEach((id, index) => {
          if (!duplicadosDetalle[id]) duplicadosDetalle[id] = [];
          duplicadosDetalle[id].push({
            index,
            mesa: mesasNormalizadas[index],
            numero_mesa: mesasNormalizadas[index].numero_mesa
          });
        });

        const duplicados = Object.entries(duplicadosDetalle)
          .filter(([id, ocurrencias]) => ocurrencias.length > 1);

        console.error('📊 Análisis detallado de duplicados:', duplicados);

        alert(`Error crítico: Se detectaron IDs duplicados en la base de datos.
        Esto indica un problema de integridad de datos.
        IDs duplicados: ${duplicados.map(([id]) => id).join(', ')}`);
        setLoading(false);
        return;
      }

      console.log(`✅ ${mesasNormalizadas.length} mesas listas para generar QR`);

      // Cargar datos del restaurante para contexto
      console.log('🏪 Cargando datos del restaurante para contexto de QRs...');
      let restaurantData = {};

      try {
        const [restaurantInfo, menu] = await Promise.all([
          restaurantDataService.getRestaurantInfo(),
          restaurantDataService.getRestaurantMenu()
        ]);

        restaurantData = {
          restaurante: restaurantInfo,
          menu: menu,
          config: {
            baseUrl: 'https://gastrobot.com',
            enableSplitPayment: true,
            paymentMethods: ['card', 'cash', 'bizum']
          }
        };

        console.log(`✅ Contexto del restaurante cargado: ${restaurantInfo.nombre}, ${menu.metadata?.total_platos || 0} platos en menú`);

      } catch (error) {
        console.warn('⚠️ No se pudo cargar contexto del restaurante, usando configuración básica:', error);
        restaurantData = {
          restaurante: { nombre: 'GastroBot Restaurant' },
          menu: { categorias: [] },
          config: {}
        };
      }

      // Generar QRs mejorados con contexto del restaurante
      const enhancedQRs = generateEnhancedMultipleTableQRs(mesasNormalizadas, restaurantData);

      // Crear QRs usando el servicio (que los guardará en el backend)
      const qrs = await tableQRService.createMultipleTableQRs(mesasNormalizadas, restaurantData.config);

      // Agregar contexto mejorado a los QRs del servicio
      const finalQRs = qrs.map((qr, index) => ({
        ...qr,
        enhanced: true,
        restaurant_context: enhancedQRs[index]?.restaurant_context,
        restaurant_metadata: enhancedQRs[index]?.restaurant_metadata
      }));

      // Debug y validación detallada
      debugQRGeneration(mesasNormalizadas, finalQRs);

      // Validación exhaustiva de URLs únicas
      const urls = finalQRs.map(qr => qr.paymentUrl);
      const urlsUnicas = [...new Set(urls)];

      console.log(`🔍 [VALIDACIÓN FINAL] Verificación de URLs generadas:`, {
        total_qrs: finalQRs.length,
        urls_generadas: urls,
        urls_unicas: urlsUnicas,
        son_todas_unicas: urls.length === urlsUnicas.length
      });

      if (urls.length !== urlsUnicas.length) {
        console.error('❌ ERROR CRÍTICO: URLs duplicadas en QRs generados');

        // Análisis detallado de URLs duplicadas
        const urlCount = {};
        urls.forEach((url, index) => {
          if (!urlCount[url]) urlCount[url] = [];
          urlCount[url].push({
            index,
            mesa_id: finalQRs[index].mesa_id,
            mesa_numero: finalQRs[index].mesa_numero,
            qr: finalQRs[index]
          });
        });

        const urlsDuplicadas = Object.entries(urlCount)
          .filter(([url, ocurrencias]) => ocurrencias.length > 1);

        console.error('📊 URLs duplicadas encontradas:', urlsDuplicadas);

        alert(`ERROR CRÍTICO: Se generaron URLs duplicadas.
        Esto significa que múltiples mesas tendrán el mismo QR.

        URLs duplicadas: ${urlsDuplicadas.length}

        Revisa la consola para más detalles y contacta con soporte técnico.`);

        setLoading(false);
        return;
      }

      if (!validateTableQRs(finalQRs)) {
        alert('Advertencia: Se detectaron posibles problemas con los QR generados. Revisa la consola para más detalles.');
      }

      setTableQRs(finalQRs);

      console.log(`✅ ${finalQRs.length} QRs mejorados generados exitosamente con contexto de ${restaurantData.restaurante.nombre}`);
      console.log(`✅ VERIFICACIÓN COMPLETA: Todas las URLs son únicas y funcionales`);

      // Ejecutar diagnóstico rápido post-generación
      console.log('\n🔍 Ejecutando diagnóstico post-generación...');
      const diagnosticResult = quickDiagnostic();
      console.log('📊 Resultado diagnóstico:', diagnosticResult);

    } catch (error) {
      console.error('❌ Error generando QRs:', error);
      alert(`Error al generar QRs: ${error.message}`);
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
        (qr.mesa_numero?.toString() || '').includes(searchTerm) ||
        (qr.name?.toLowerCase() || '').includes(searchTerm.toLowerCase());

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
   * Maneja la actualización de cuenta de mesa desde la interfaz de camarero
   */
  const handleTableOrderUpdate = async (mesaId, orderData) => {
    try {
      const updatedQR = await tableQRService.configureTableOrder(mesaId, orderData);

      setTableQRs(prev => prev.map(qr =>
        qr.mesa_id === mesaId ? updatedQR : qr
      ));
    } catch (error) {
      console.error('Error updating table order:', error);
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
              title="Vista de tarjetas"
            >
              <Grid className="w-4 h-4 mx-auto" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 px-3 py-2 transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
              title="Vista de lista"
            >
              <List className="w-4 h-4 mx-auto" />
            </button>
            <button
              onClick={() => setViewMode('waiter')}
              className={`flex-1 px-3 py-2 rounded-r-lg transition-colors ${
                viewMode === 'waiter'
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
              title="Vista de camarero"
            >
              <Users className="w-4 h-4 mx-auto" />
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
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                console.log('🔬 Ejecutando diagnóstico completo del sistema QR...');
                const result = await runCompleteQRDiagnostic();
                console.log('📋 Diagnóstico completado:', result);
                alert(result.issues.length === 0
                  ? '✅ Sistema QR funcionando correctamente'
                  : `⚠️ Se detectaron ${result.issues.length} problemas. Revisa la consola para detalles.`
                );
              }}
              icon={Settings}
            >
              Diagnosticar
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

        {/* Grid/Lista/Vista de Camarero */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="h-32 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredQRs.length > 0 ? (
          viewMode === 'waiter' ? (
            <div className="space-y-6">
              {filteredQRs.map((tableQR) => (
                <WaiterInterface
                  key={tableQR.id}
                  tableQR={tableQR}
                  onTableOrderUpdate={handleTableOrderUpdate}
                  onRefresh={loadTableQRs}
                />
              ))}
            </div>
          ) : (
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
          )
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