/**
 * @fileoverview Interfaz optimizada para camareros en gestión de QR de mesas
 * Proporciona controles simplificados y flujo de trabajo específico para personal del restaurante
 */

import React, { useState } from 'react';
import {
  Plus,
  Settings,
  QrCode,
  CheckCircle,
  Clock,
  Users,
  ShoppingCart,
  DollarSign,
  ChefHat
} from 'lucide-react';
import Button from '../ui/Button';
import TableOrderSummary from './TableOrderSummary';
import PaymentSplitModal from './PaymentSplitModal';

/**
 * Interfaz optimizada para camareros
 * @param {Object} props - Props del componente
 * @param {Object} props.tableQR - Datos del QR de mesa
 * @param {Function} props.onTableOrderUpdate - Callback cuando se actualiza la cuenta
 * @param {Function} props.onRefresh - Callback para refrescar datos
 * @returns {JSX.Element} Componente WaiterInterface
 */
const WaiterInterface = ({ tableQR, onTableOrderUpdate, onRefresh }) => {
  const [showConfigModal, setShowConfigModal] = useState(false);

  /**
   * Obtiene el color del estado
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'configuring': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'ready_for_customers': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'in_progress': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'completed': return 'text-slate-600 bg-slate-50 border-slate-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  /**
   * Obtiene el texto del estado
   */
  const getStatusText = (status) => {
    switch (status) {
      case 'configuring': return 'Configurando cuenta';
      case 'ready_for_customers': return 'Lista para escanear';
      case 'in_progress': return 'Pagos en progreso';
      case 'completed': return 'Cuenta completada';
      default: return 'Sin configurar';
    }
  };

  /**
   * Obtiene el icono del estado
   */
  const getStatusIcon = (status) => {
    switch (status) {
      case 'configuring': return Settings;
      case 'ready_for_customers': return QrCode;
      case 'in_progress': return Clock;
      case 'completed': return CheckCircle;
      default: return Settings;
    }
  };

  /**
   * Maneja la configuración de la cuenta de mesa
   */
  const handleConfigureTable = () => {
    setShowConfigModal(true);
  };

  /**
   * Maneja la actualización de la cuenta
   */
  const handleTableOrderSave = async (orderData) => {
    if (onTableOrderUpdate) {
      await onTableOrderUpdate(tableQR.mesa_id, orderData);
    }
    setShowConfigModal(false);
    if (onRefresh) {
      onRefresh();
    }
  };

  const status = tableQR?.status || 'configuring';
  const StatusIcon = getStatusIcon(status);
  const items = tableQR?.items || [];
  const total = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);

  return (
    <div className="bg-white rounded-lg shadow-md border border-slate-200">
      {/* Header de mesa */}
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex-center">
              <ChefHat className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Mesa {tableQR?.mesa_numero}
              </h3>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(status)}`}>
                <StatusIcon className="w-4 h-4" />
                {getStatusText(status)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Total de la mesa */}
            <div className="text-right">
              <p className="text-sm text-slate-600">Total Mesa</p>
              <p className="text-2xl font-bold text-emerald-600">
                {total.toFixed(2)}€
              </p>
            </div>

            {/* Acciones principales */}
            <div className="flex gap-2">
              {status === 'configuring' || status === 'ready_for_customers' ? (
                <Button
                  onClick={handleConfigureTable}
                  icon={status === 'configuring' ? Plus : Settings}
                  size="lg"
                >
                  {status === 'configuring' ? 'Configurar Cuenta' : 'Modificar Cuenta'}
                </Button>
              ) : (
                <Button
                  onClick={onRefresh}
                  variant="outline"
                  icon={QrCode}
                  size="lg"
                >
                  Ver Estado
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-6">
        {status === 'configuring' && items.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-slate-900 mb-2">
              Mesa {tableQR?.mesa_numero} sin configurar
            </h4>
            <p className="text-slate-600 mb-6">
              Configure la cuenta agregando productos del menú para que los comensales puedan realizar el pago
            </p>
            <Button onClick={handleConfigureTable} icon={Plus} size="lg">
              Empezar a configurar cuenta
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Resumen de productos */}
            <div className="lg:col-span-2">
              <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Productos en la cuenta ({items.length})
              </h4>

              {items.length === 0 ? (
                <div className="bg-slate-50 rounded-lg p-8 text-center">
                  <ShoppingCart className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600">No hay productos en la cuenta</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.slice(0, 5).map((item, index) => (
                    <div key={item.id || index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <h5 className="font-medium text-slate-900">{item.name}</h5>
                        <p className="text-sm text-slate-600">{item.category}</p>
                      </div>
                      <span className="font-semibold text-emerald-600">
                        {parseFloat(item.price).toFixed(2)}€
                      </span>
                    </div>
                  ))}
                  {items.length > 5 && (
                    <div className="text-center py-2">
                      <span className="text-sm text-slate-500">
                        ... y {items.length - 5} productos más
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Estado y acciones */}
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <h5 className="font-medium text-slate-900 mb-3">Resumen</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Productos:</span>
                    <span className="font-medium">{items.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-bold text-lg text-emerald-600">
                      {total.toFixed(2)}€
                    </span>
                  </div>
                </div>
              </div>

              {status === 'ready_for_customers' && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-emerald-800 mb-2">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">QR listo para clientes</span>
                  </div>
                  <p className="text-sm text-emerald-700">
                    Los comensales pueden escanear el código QR para ver los productos y seleccionar los suyos.
                  </p>
                </div>
              )}

              {status === 'in_progress' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-amber-800 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">Pagos en curso</span>
                  </div>
                  <p className="text-sm text-amber-700">
                    Los comensales están procesando sus pagos individuales.
                  </p>
                </div>
              )}

              {items.length > 0 && (
                <Button
                  onClick={handleConfigureTable}
                  variant="outline"
                  icon={Settings}
                  className="w-full"
                >
                  {status === 'configuring' ? 'Continuar configuración' : 'Modificar cuenta'}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de configuración */}
      <PaymentSplitModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onSave={handleTableOrderSave}
        tableQR={tableQR}
      />
    </div>
  );
};

export default WaiterInterface;