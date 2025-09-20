/**
 * @fileoverview Componente para mostrar resumen optimizado de cuenta de mesa
 * Diseñado específicamente para camareros con información clara y botones de acción
 */

import React from 'react';
import {
  ShoppingCart,
  Euro,
  Users,
  Clock,
  Edit3,
  Trash2,
  Plus,
  QrCode,
  CheckCircle
} from 'lucide-react';
import Button from '../ui/Button';

/**
 * Resumen de cuenta de mesa optimizado para camareros
 * @param {Object} props - Props del componente
 * @param {Array} props.items - Lista de productos en la cuenta
 * @param {Function} props.onEditItem - Callback para editar ítem
 * @param {Function} props.onRemoveItem - Callback para eliminar ítem
 * @param {Function} props.onAddFromMenu - Callback para agregar del menú
 * @param {Function} props.onFinalize - Callback para finalizar cuenta
 * @param {number} props.tableNumber - Número de mesa
 * @param {string} props.status - Estado actual de la cuenta
 * @returns {JSX.Element} Componente TableOrderSummary
 */
const TableOrderSummary = ({
  items = [],
  onEditItem,
  onRemoveItem,
  onAddFromMenu,
  onFinalize,
  tableNumber,
  status = 'configuring'
}) => {
  /**
   * Calcula el total de la cuenta
   */
  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
  };

  /**
   * Agrupa ítems por categoría
   */
  const groupItemsByCategory = () => {
    const groups = {};
    items.forEach(item => {
      const category = item.category || 'General';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
    });
    return groups;
  };

  /**
   * Obtiene el color del estado
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'configuring': return 'text-blue-600 bg-blue-50';
      case 'ready_for_customers': return 'text-emerald-600 bg-emerald-50';
      case 'in_progress': return 'text-amber-600 bg-amber-50';
      case 'completed': return 'text-slate-600 bg-slate-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  /**
   * Obtiene el texto del estado
   */
  const getStatusText = (status) => {
    switch (status) {
      case 'configuring': return 'Configurando';
      case 'ready_for_customers': return 'Lista para escanear';
      case 'in_progress': return 'Pagos en curso';
      case 'completed': return 'Completada';
      default: return 'Sin configurar';
    }
  };

  const total = calculateTotal();
  const groupedItems = groupItemsByCategory();

  return (
    <div className="bg-white rounded-lg shadow-md border border-slate-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex-center">
              <ShoppingCart className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Mesa {tableNumber} - Cuenta
              </h3>
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                <Clock className="w-3 h-3" />
                {getStatusText(status)}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600">Total</p>
            <p className="text-2xl font-bold text-emerald-600">
              {total.toFixed(2)}€
            </p>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6">
        {items.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-slate-900 mb-2">
              Cuenta vacía
            </h4>
            <p className="text-slate-600 mb-4">
              La mesa no tiene productos agregados
            </p>
            <Button onClick={onAddFromMenu} icon={Plus}>
              Agregar productos del menú
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Lista de productos por categoría */}
            {Object.entries(groupedItems).map(([category, categoryItems]) => (
              <div key={category} className="space-y-3">
                <h4 className="font-medium text-slate-900 text-sm uppercase tracking-wide">
                  {category}
                </h4>
                <div className="space-y-2">
                  {categoryItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <h5 className="font-medium text-slate-900">{item.name}</h5>
                        {item.description && (
                          <p className="text-sm text-slate-600">{item.description}</p>
                        )}
                        {item.fromMenu && (
                          <div className="flex items-center gap-1 mt-1">
                            <QrCode className="w-3 h-3 text-emerald-600" />
                            <span className="text-xs text-emerald-600">Del menú</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-900">
                          {parseFloat(item.price).toFixed(2)}€
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => onEditItem(item, index)}
                            className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                            title="Editar"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onRemoveItem(index)}
                            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Acciones rápidas */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={onAddFromMenu}
                icon={Plus}
                className="flex-1"
              >
                Agregar más productos
              </Button>

              {status === 'configuring' && (
                <Button
                  onClick={onFinalize}
                  icon={CheckCircle}
                  className="flex-1"
                  disabled={items.length === 0}
                >
                  Finalizar cuenta de mesa
                </Button>
              )}
            </div>

            {/* Resumen final */}
            <div className="bg-emerald-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-emerald-800">Productos:</span>
                <span className="text-sm font-medium text-emerald-800">{items.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-emerald-900">Total Mesa:</span>
                <span className="text-lg font-bold text-emerald-900">
                  {total.toFixed(2)}€
                </span>
              </div>

              {status === 'ready_for_customers' && (
                <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Los comensales pueden escanear el QR para seleccionar sus productos
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableOrderSummary;