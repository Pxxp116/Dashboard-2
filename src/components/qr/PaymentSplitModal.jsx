/**
 * @fileoverview Modal para configurar la división de pagos de mesa
 * Permite configurar participantes, ítems y modos de división
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Plus,
  Trash2,
  Calculator,
  DollarSign,
  Split,
  Save,
  AlertTriangle,
  CheckCircle,
  User,
  ShoppingCart,
  Edit2,
  Phone
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import {
  SPLIT_MODES,
  calculateEqualSplit,
  calculateItemBasedSplit,
  formatCurrency,
  validateSplitPaymentData,
  generateDemoPaymentData
} from '../../utils/tableQRGenerator';

/**
 * Modal para configurar división de pagos
 * @param {Object} props - Props del componente
 * @param {boolean} props.isOpen - Estado del modal
 * @param {Function} props.onClose - Callback para cerrar
 * @param {Function} props.onSave - Callback para guardar configuración
 * @param {Object} props.tableQR - QR de mesa
 * @returns {JSX.Element} Componente PaymentSplitModal
 */
const PaymentSplitModal = ({ isOpen, onClose, onSave, tableQR = null }) => {
  const [splitMode, setSplitMode] = useState(SPLIT_MODES.EQUAL);
  const [totalAmount, setTotalAmount] = useState(0);
  const [participants, setParticipants] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);

  // Resetear formulario cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen && tableQR) {
      // Si hay datos existentes, cargarlos
      if (tableQR.totalAmount > 0) {
        setTotalAmount(tableQR.totalAmount);
        setParticipants(tableQR.participants || []);
        setItems(tableQR.items || []);
        setSplitMode(tableQR.splitMode || SPLIT_MODES.EQUAL);
      } else {
        // Inicializar con configuración vacía
        setTotalAmount(0);
        setItems([]);
        setParticipants([]);
        setSplitMode(SPLIT_MODES.EQUAL);
      }
      setErrors({});
      setShowPreview(false);
    }
  }, [isOpen, tableQR]);

  /**
   * Agrega un nuevo participante
   */
  const addParticipant = () => {
    const newParticipant = {
      id: Date.now(),
      name: '',
      phone: '',
      selectedItems: [],
      amount: 0
    };
    setParticipants(prev => [...prev, newParticipant]);
  };

  /**
   * Actualiza un participante
   */
  const updateParticipant = (index, field, value) => {
    setParticipants(prev => prev.map((participant, i) =>
      i === index ? { ...participant, [field]: value } : participant
    ));
  };

  /**
   * Elimina un participante
   */
  const removeParticipant = (index) => {
    setParticipants(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * Agrega un nuevo ítem
   */
  const addItem = () => {
    const newItem = {
      id: Date.now(),
      name: '',
      price: 0,
      category: 'General'
    };
    setItems(prev => [...prev, newItem]);
  };

  /**
   * Actualiza un ítem
   */
  const updateItem = (index, field, value) => {
    setItems(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: field === 'price' ? parseFloat(value) || 0 : value } : item
    ));
  };

  /**
   * Elimina un ítem
   */
  const removeItem = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
    // Eliminar el ítem de las selecciones de participantes
    const itemId = items[index]?.id;
    if (itemId) {
      setParticipants(prev => prev.map(participant => ({
        ...participant,
        selectedItems: participant.selectedItems.filter(id => id !== itemId)
      })));
    }
  };

  /**
   * Maneja la selección/deselección de ítems por participante
   */
  const toggleItemSelection = (participantIndex, itemId) => {
    setParticipants(prev => prev.map((participant, i) => {
      if (i === participantIndex) {
        const selectedItems = participant.selectedItems.includes(itemId)
          ? participant.selectedItems.filter(id => id !== itemId)
          : [...participant.selectedItems, itemId];
        return { ...participant, selectedItems };
      }
      return participant;
    }));
  };

  /**
   * Calcula la división de pagos
   */
  const calculateSplit = () => {
    if (splitMode === SPLIT_MODES.EQUAL) {
      return calculateEqualSplit(totalAmount, participants.length);
    } else {
      return calculateItemBasedSplit(items, participants);
    }
  };

  /**
   * Valida la configuración
   */
  const validateConfiguration = () => {
    const paymentData = {
      totalAmount,
      participants,
      items,
      splitMode
    };

    return validateSplitPaymentData(paymentData);
  };

  /**
   * Maneja el guardado de la configuración
   */
  const handleSave = async () => {
    const validation = validateConfiguration();

    if (!validation.valid) {
      setErrors({ general: validation.errors.join(', ') });
      return;
    }

    setLoading(true);

    try {
      const paymentData = {
        totalAmount,
        participants: splitMode === SPLIT_MODES.EQUAL
          ? participants.map((p, i) => ({ ...p, amount: calculateSplit().perPerson }))
          : calculateSplit().participants,
        items,
        splitMode,
        lastUpdated: new Date().toISOString()
      };

      await onSave(paymentData);
      onClose();
    } catch (error) {
      setErrors({ general: 'Error al guardar la configuración' });
    } finally {
      setLoading(false);
    }
  };


  const splitResult = calculateSplit();
  const validation = validateConfiguration();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-theme-gradient rounded-lg flex-center">
                <Split className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Configurar División de Pago
                </h2>
                <p className="text-sm text-slate-600">
                  Mesa {tableQR?.mesa_numero} - Configure cómo dividir la cuenta
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Configuración principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Monto total y modo de división */}
              <div className="glass-card-sm p-4 space-y-4">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Información General
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Monto Total (€)"
                    type="number"
                    step="0.01"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)}
                    placeholder="89.50"
                  />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Modo de División
                    </label>
                    <select
                      value={splitMode}
                      onChange={(e) => setSplitMode(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={SPLIT_MODES.EQUAL}>División Igualitaria</option>
                      <option value={SPLIT_MODES.BY_ITEMS}>Por Ítems Seleccionados</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                    icon={Calculator}
                  >
                    {showPreview ? 'Ocultar' : 'Ver'} Vista Previa
                  </Button>
                </div>
              </div>

              {/* Participantes */}
              <div className="glass-card-sm p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Participantes ({participants.length})
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addParticipant}
                    icon={Plus}
                  >
                    Agregar
                  </Button>
                </div>

                {participants.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50/50">
                    <Users className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                    <p className="text-slate-800 font-semibold mb-1">Configura tu cuenta para esta mesa</p>
                    <p className="text-sm text-slate-600 mb-4">Agrega participantes para comenzar a dividir la cuenta</p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={addParticipant}
                      icon={Plus}
                    >
                      Agregar primer participante
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {participants.map((participant, index) => (
                    <div key={participant.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                      <User className="w-4 h-4 text-slate-400" />
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <Input
                          placeholder="Nombre"
                          value={participant.name}
                          onChange={(e) => updateParticipant(index, 'name', e.target.value)}
                          size="sm"
                        />
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <Input
                            placeholder="Teléfono (opcional)"
                            value={participant.phone}
                            onChange={(e) => updateParticipant(index, 'phone', e.target.value)}
                            size="sm"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => removeParticipant(index)}
                        className="p-1 text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  </div>
                )}
              </div>

              {/* Ítems (solo en modo por ítems) */}
              {splitMode === SPLIT_MODES.BY_ITEMS && (
                <div className="glass-card-sm p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      Ítems de la Cuenta ({items.length})
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addItem}
                      icon={Plus}
                    >
                      Agregar
                    </Button>
                  </div>

                  {items.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-emerald-300 rounded-lg bg-emerald-50/50">
                      <ShoppingCart className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                      <p className="text-slate-800 font-semibold mb-1">No hay productos en la cuenta</p>
                      <p className="text-sm text-slate-600 mb-4">Agrega productos para comenzar</p>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={addItem}
                        icon={Plus}
                      >
                        Agregar primer producto
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {items.map((item, index) => (
                      <div key={item.id} className="p-3 bg-white rounded-lg border">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                            <Input
                              placeholder="Nombre del ítem"
                              value={item.name}
                              onChange={(e) => updateItem(index, 'name', e.target.value)}
                              size="sm"
                            />
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Precio"
                              value={item.price}
                              onChange={(e) => updateItem(index, 'price', e.target.value)}
                              size="sm"
                            />
                            <Input
                              placeholder="Categoría"
                              value={item.category}
                              onChange={(e) => updateItem(index, 'category', e.target.value)}
                              size="sm"
                            />
                          </div>
                          <button
                            onClick={() => removeItem(index)}
                            className="p-1 text-red-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Selección por participante */}
                        <div className="flex flex-wrap gap-2">
                          {participants.map((participant, pIndex) => (
                            <button
                              key={participant.id}
                              onClick={() => toggleItemSelection(pIndex, item.id)}
                              className={`px-2 py-1 rounded text-xs transition-colors ${
                                participant.selectedItems.includes(item.id)
                                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {participant.name || `Persona ${pIndex + 1}`}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    </div>
                  )}
                </div>
              )}

              {/* Errores */}
              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}

              {/* Advertencias */}
              {validation.warnings.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                    <div>
                      {validation.warnings.map((warning, index) => (
                        <p key={index} className="text-sm text-amber-700">{warning}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Vista previa */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Vista Previa del Cálculo
              </h3>

              {showPreview && splitResult && (
                <div className="glass-card-sm p-4 space-y-4">
                  {splitMode === SPLIT_MODES.EQUAL ? (
                    <div>
                      <h4 className="font-medium text-slate-900 mb-3">División Igualitaria</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total:</span>
                          <span className="font-medium">{formatCurrency(totalAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Por persona:</span>
                          <span className="font-medium text-blue-600">
                            {formatCurrency(splitResult.perPerson)}
                          </span>
                        </div>
                        {splitResult.remainder > 0 && (
                          <div className="flex justify-between text-amber-600">
                            <span>Restante:</span>
                            <span>{formatCurrency(splitResult.remainder)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-medium text-slate-900 mb-3">División por Ítems</h4>
                      <div className="space-y-2">
                        {splitResult.participants?.map((participant, index) => (
                          <div key={participant.id} className="flex justify-between text-sm">
                            <span className="truncate">{participant.name || `Persona ${index + 1}`}</span>
                            <span className="font-medium text-blue-600 ml-2">
                              {formatCurrency(participant.amount)}
                            </span>
                          </div>
                        ))}
                        {splitResult.unassignedAmount > 0 && (
                          <div className="pt-2 border-t border-amber-200">
                            <div className="flex justify-between text-amber-600 text-sm">
                              <span>Sin asignar:</span>
                              <span>{formatCurrency(splitResult.unassignedAmount)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Estado de validación */}
              <div className={`p-3 rounded-lg border ${
                validation.valid
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  {validation.valid ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    validation.valid ? 'text-emerald-700' : 'text-red-700'
                  }`}>
                    {validation.valid ? 'Configuración válida' : 'Configuración incompleta'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              loading={loading}
              disabled={!validation.valid}
              icon={Save}
            >
              Guardar Configuración
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentSplitModal;