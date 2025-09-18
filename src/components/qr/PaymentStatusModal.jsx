/**
 * @fileoverview Modal para monitorear el estado de pagos de mesa en tiempo real
 * Muestra participantes, progreso de pagos y permite acciones de gestión
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  CreditCard,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  RefreshCw,
  Download,
  Eye,
  EyeOff,
  User,
  Phone,
  Calendar,
  History,
  MoreVertical,
  Send,
  Bell
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import Button from '../ui/Button';
import {
  PAYMENT_STATUS,
  SPLIT_MODES,
  formatCurrency
} from '../../utils/tableQRGenerator';

/**
 * Modal para monitorear estado de pagos
 * @param {Object} props - Props del componente
 * @param {boolean} props.isOpen - Estado del modal
 * @param {Function} props.onClose - Callback para cerrar
 * @param {Object} props.tableQR - QR de mesa
 * @param {Function} props.onRefresh - Callback para actualizar datos
 * @param {Function} props.onSendReminder - Callback para enviar recordatorio
 * @param {Function} props.onMarkPaid - Callback para marcar como pagado
 * @returns {JSX.Element} Componente PaymentStatusModal
 */
const PaymentStatusModal = ({
  isOpen,
  onClose,
  tableQR = null,
  onRefresh,
  onSendReminder,
  onMarkPaid
}) => {
  const [loading, setLoading] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Auto-refresh cada 30 segundos cuando el modal está abierto
  useEffect(() => {
    if (isOpen && onRefresh) {
      const interval = setInterval(() => {
        onRefresh();
      }, 30000);
      setRefreshInterval(interval);

      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [isOpen, onRefresh]);

  // Limpiar interval al cerrar
  useEffect(() => {
    if (!isOpen && refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, [isOpen, refreshInterval]);

  /**
   * Obtiene el color y estilo del estado de pago
   */
  const getPaymentStatusStyle = (status) => {
    switch (status) {
      case PAYMENT_STATUS.PENDING:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          icon: Clock,
          label: 'Pendiente'
        };
      case PAYMENT_STATUS.PARTIAL:
        return {
          bgColor: 'bg-amber-100',
          textColor: 'text-amber-700',
          icon: AlertTriangle,
          label: 'Parcial'
        };
      case PAYMENT_STATUS.COMPLETED:
        return {
          bgColor: 'bg-emerald-100',
          textColor: 'text-emerald-700',
          icon: CheckCircle,
          label: 'Completado'
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          icon: Clock,
          label: 'Sin estado'
        };
    }
  };

  /**
   * Calcula el progreso de pago
   */
  const getPaymentProgress = () => {
    if (!tableQR?.totalAmount || tableQR.totalAmount === 0) return 0;
    return Math.round((tableQR.paidAmount / tableQR.totalAmount) * 100);
  };

  /**
   * Maneja el refresh manual
   */
  const handleRefresh = async () => {
    setLoading(true);
    try {
      await onRefresh?.();
    } catch (error) {
      console.error('Error refreshing payment status:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja marcar como pagado manualmente
   */
  const handleMarkPaid = async (participantId = null) => {
    try {
      await onMarkPaid?.(participantId);
    } catch (error) {
      console.error('Error marking as paid:', error);
    }
  };

  /**
   * Maneja envío de recordatorio
   */
  const handleSendReminder = async (participantId) => {
    try {
      await onSendReminder?.(participantId);
    } catch (error) {
      console.error('Error sending reminder:', error);
    }
  };

  /**
   * Exporta datos de pago
   */
  const handleExport = () => {
    if (!tableQR) return;

    const data = {
      mesa: tableQR.mesa_numero,
      fecha: new Date().toISOString(),
      totalAmount: tableQR.totalAmount,
      paidAmount: tableQR.paidAmount,
      pendingAmount: tableQR.pendingAmount,
      participants: tableQR.participants,
      items: tableQR.items,
      splitMode: tableQR.splitMode
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pago_mesa_${tableQR.mesa_numero}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!tableQR) return null;

  const statusStyle = getPaymentStatusStyle(tableQR.paymentStatus);
  const StatusIcon = statusStyle.icon;
  const progress = getPaymentProgress();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-theme-gradient rounded-xl flex-center text-white font-bold text-lg">
                {tableQR.mesa_numero}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Estado de Pago - Mesa {tableQR.mesa_numero}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusStyle.bgColor} ${statusStyle.textColor}`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusStyle.label}
                  </div>
                  <span className="text-sm text-slate-500">
                    {tableQR.participants?.length || 0} participante{(tableQR.participants?.length || 0) !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                loading={loading}
                icon={RefreshCw}
              >
                Actualizar
              </Button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Resumen de pago */}
          <div className="glass-card-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <DollarSign className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm text-slate-600">Total</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(tableQR.totalAmount || 0)}
                </p>
              </div>
              <div className="text-center">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm text-slate-600">Pagado</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(tableQR.paidAmount || 0)}
                </p>
              </div>
              <div className="text-center">
                <Clock className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-sm text-slate-600">Pendiente</p>
                <p className="text-2xl font-bold text-amber-600">
                  {formatCurrency(tableQR.pendingAmount || 0)}
                </p>
              </div>
            </div>

            {/* Progreso visual */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">Progreso de Pago</span>
                <span className="text-sm text-slate-600">{progress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    progress === 100 ? 'bg-emerald-500' :
                    progress > 0 ? 'bg-amber-500' : 'bg-gray-300'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Información adicional */}
            <div className="flex items-center justify-between text-sm text-slate-600">
              <div className="flex items-center gap-4">
                <span>Modo: {tableQR.splitMode === SPLIT_MODES.EQUAL ? 'División igual' : 'Por ítems'}</span>
                <span>Actualizado: {new Date(tableQR.lastUpdated || tableQR.created).toLocaleTimeString('es-ES')}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPaymentHistory(!showPaymentHistory)}
                  icon={showPaymentHistory ? EyeOff : Eye}
                >
                  {showPaymentHistory ? 'Ocultar' : 'Ver'} Historial
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  icon={Download}
                >
                  Exportar
                </Button>
              </div>
            </div>
          </div>

          {/* Lista de participantes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Participantes
              </h3>
              {tableQR.pendingAmount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarkPaid()}
                  icon={CheckCircle}
                >
                  Marcar Toda Cuenta Pagada
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {tableQR.participants?.map((participant, index) => {
                const isPaid = participant.paid || false;
                const participantAmount = participant.amount || 0;

                return (
                  <div
                    key={participant.id}
                    className={`p-4 rounded-lg border transition-all ${
                      isPaid
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex-center ${
                          isPaid ? 'bg-emerald-100' : 'bg-slate-100'
                        }`}>
                          <User className={`w-5 h-5 ${
                            isPaid ? 'text-emerald-600' : 'text-slate-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {participant.name || `Participante ${index + 1}`}
                          </p>
                          {participant.phone && (
                            <div className="flex items-center gap-1 text-sm text-slate-600">
                              <Phone className="w-3 h-3" />
                              {participant.phone}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">
                            {formatCurrency(participantAmount)}
                          </p>
                          <div className={`flex items-center gap-1 text-xs ${
                            isPaid ? 'text-emerald-600' : 'text-amber-600'
                          }`}>
                            {isPaid ? (
                              <>
                                <CheckCircle className="w-3 h-3" />
                                Pagado
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3" />
                                Pendiente
                              </>
                            )}
                          </div>
                        </div>

                        {!isPaid && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleSendReminder(participant.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Enviar recordatorio"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleMarkPaid(participant.id)}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Marcar como pagado"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ítems seleccionados (en modo por ítems) */}
                    {tableQR.splitMode === SPLIT_MODES.BY_ITEMS && participant.selectedItems?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <p className="text-xs text-slate-600 mb-2">Ítems seleccionados:</p>
                        <div className="flex flex-wrap gap-1">
                          {participant.selectedItems.map(itemId => {
                            const item = tableQR.items?.find(i => i.id === itemId);
                            return item ? (
                              <span key={itemId} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                                {item.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historial de pagos */}
          {showPaymentHistory && (
            <div className="mt-6 glass-card-sm p-4">
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <History className="w-4 h-4" />
                Historial de Pagos
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {/* Ejemplo de historial - en implementación real vendría del backend */}
                <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-slate-700">Ana García pagó su parte</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date().toLocaleTimeString('es-ES')}
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-slate-700">Recordatorio enviado a Carlos López</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(Date.now() - 5 * 60 * 1000).toLocaleTimeString('es-ES')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer con acciones */}
          <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-200">
            <div className="text-sm text-slate-600">
              Última actualización: {new Date().toLocaleTimeString('es-ES')}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
              >
                Cerrar
              </Button>
              {tableQR.pendingAmount > 0 && (
                <Button
                  onClick={() => handleMarkPaid()}
                  icon={CheckCircle}
                >
                  Completar Pago
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentStatusModal;