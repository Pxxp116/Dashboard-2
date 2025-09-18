/**
 * @fileoverview Página de pago para clientes que escanean QR de mesa
 * Interfaz responsiva para móviles con opciones de división de pago
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  CreditCard,
  Calculator,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  ShoppingCart,
  User,
  Phone,
  Plus,
  Minus,
  ArrowLeft,
  Clock,
  Smartphone,
  Split,
  Receipt,
  Shield,
  Check,
  X
} from 'lucide-react';
import {
  SPLIT_MODES,
  formatCurrency,
  calculateEqualSplit,
  calculateItemBasedSplit,
  generateDemoPaymentData
} from '../utils/tableQRGenerator';

/**
 * Página de pago para clientes
 * @param {Object} props - Props del componente
 * @param {string} props.mesaId - ID de la mesa desde la URL
 * @returns {JSX.Element} Componente TablePaymentPage
 */
const TablePaymentPage = ({ mesaId }) => {
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState('details'); // 'details' | 'split' | 'payment' | 'success'
  const [tableData, setTableData] = useState(null);
  const [splitMode, setSplitMode] = useState(SPLIT_MODES.EQUAL);
  const [numParticipants, setNumParticipants] = useState(2);
  const [participants, setParticipants] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [error, setError] = useState(null);

  // Simular carga de datos de la mesa
  useEffect(() => {
    const loadTableData = async () => {
      setLoading(true);
      try {
        // En implementación real, esto vendría del backend
        const demoData = generateDemoPaymentData(mesaId);
        setTableData({
          mesa_numero: mesaId || '1',
          mesa_id: mesaId || 1,
          ...demoData
        });

        // Inicializar participantes por defecto
        setParticipants([
          { id: 1, name: '', phone: '', selectedItems: [], amount: 0 }
        ]);
      } catch (err) {
        setError('Error al cargar los datos de la mesa');
      } finally {
        setLoading(false);
      }
    };

    loadTableData();
  }, [mesaId]);

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
    setNumParticipants(prev => prev + 1);
  };

  /**
   * Elimina un participante
   */
  const removeParticipant = (index) => {
    setParticipants(prev => prev.filter((_, i) => i !== index));
    setNumParticipants(prev => Math.max(1, prev - 1));
  };

  /**
   * Actualiza información de participante
   */
  const updateParticipant = (index, field, value) => {
    setParticipants(prev => prev.map((participant, i) =>
      i === index ? { ...participant, [field]: value } : participant
    ));
  };

  /**
   * Selecciona/deselecciona un ítem para un participante
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
   * Calcula el total a pagar según el modo
   */
  const calculateTotal = () => {
    if (!tableData) return { total: 0, perPerson: 0 };

    if (splitMode === SPLIT_MODES.EQUAL) {
      const result = calculateEqualSplit(tableData.totalAmount, numParticipants);
      return {
        total: tableData.totalAmount,
        perPerson: result.perPerson,
        remainder: result.remainder
      };
    } else {
      const result = calculateItemBasedSplit(tableData.items, participants);
      const customerParticipant = result.participants.find(p => p.name === customerInfo.name);
      return {
        total: tableData.totalAmount,
        perPerson: customerParticipant?.amount || 0,
        breakdown: result.participants
      };
    }
  };

  /**
   * Procesa el pago
   */
  const processPayment = async () => {
    setLoading(true);
    try {
      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCurrentStep('success');
    } catch (err) {
      setError('Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !tableData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información de la mesa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const totals = calculateTotal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border-b p-4">
          <div className="flex items-center gap-3">
            {currentStep !== 'details' && (
              <button
                onClick={() => {
                  if (currentStep === 'split') setCurrentStep('details');
                  else if (currentStep === 'payment') setCurrentStep('split');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900">Mesa {tableData?.mesa_numero}</h1>
              <p className="text-sm text-gray-600">
                {currentStep === 'details' && 'Detalles de la cuenta'}
                {currentStep === 'split' && 'Dividir el pago'}
                {currentStep === 'payment' && 'Información de pago'}
                {currentStep === 'success' && 'Pago completado'}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Receipt className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Progreso */}
        <div className="bg-white border-b p-4">
          <div className="flex items-center justify-between">
            {['details', 'split', 'payment', 'success'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step
                    ? 'bg-blue-500 text-white'
                    : index < ['details', 'split', 'payment', 'success'].indexOf(currentStep)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {index < ['details', 'split', 'payment', 'success'].indexOf(currentStep) ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 3 && (
                  <div className={`w-8 h-1 mx-2 ${
                    index < ['details', 'split', 'payment', 'success'].indexOf(currentStep)
                      ? 'bg-green-500'
                      : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Paso 1: Detalles de la cuenta */}
          {currentStep === 'details' && (
            <div className="space-y-4">
              {/* Resumen total */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {formatCurrency(tableData.totalAmount)}
                  </h2>
                  <p className="text-gray-600">Total de la cuenta</p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Ítems de la cuenta
                  </h3>
                  <div className="space-y-2">
                    {tableData.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.name}</span>
                        <span className="font-medium">{formatCurrency(item.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Información del cliente */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Tu información
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono (opcional)
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+34 600 000 000"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => setCurrentStep('split')}
                disabled={!customerInfo.name.trim()}
                className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar
              </button>
            </div>
          )}

          {/* Paso 2: División del pago */}
          {currentStep === 'split' && (
            <div className="space-y-4">
              {/* Selector de modo */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Split className="w-4 h-4" />
                  ¿Cómo quieres dividir la cuenta?
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setSplitMode(SPLIT_MODES.EQUAL)}
                    className={`w-full p-4 rounded-lg border-2 transition-colors ${
                      splitMode === SPLIT_MODES.EQUAL
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Calculator className="w-5 h-5 text-gray-600 mt-0.5" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">División igualitaria</p>
                        <p className="text-sm text-gray-600">Dividir el total entre todos por igual</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setSplitMode(SPLIT_MODES.BY_ITEMS)}
                    className={`w-full p-4 rounded-lg border-2 transition-colors ${
                      splitMode === SPLIT_MODES.BY_ITEMS
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <ShoppingCart className="w-5 h-5 text-gray-600 mt-0.5" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Por ítems seleccionados</p>
                        <p className="text-sm text-gray-600">Cada persona paga solo lo que consumió</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* División igualitaria */}
              {splitMode === SPLIT_MODES.EQUAL && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Número de personas</h4>
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <button
                      onClick={() => setNumParticipants(Math.max(1, numParticipants - 1))}
                      className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-2xl font-bold text-gray-900 w-12 text-center">
                      {numParticipants}
                    </span>
                    <button
                      onClick={() => setNumParticipants(numParticipants + 1)}
                      className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">Cada persona pagará:</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(totals.perPerson)}
                    </p>
                    {totals.remainder > 0 && (
                      <p className="text-xs text-amber-600 mt-1">
                        + {formatCurrency(totals.remainder)} de redondeo
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* División por ítems */}
              {splitMode === SPLIT_MODES.BY_ITEMS && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Selecciona tus ítems</h4>
                  <div className="space-y-3">
                    {tableData.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSelectedItems(prev =>
                            prev.includes(item.id)
                              ? prev.filter(id => id !== item.id)
                              : [...prev, item.id]
                          );
                        }}
                        className={`w-full p-3 rounded-lg border-2 transition-colors text-left ${
                          selectedItems.includes(item.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-600">{item.category}</p>
                          </div>
                          <p className="font-bold text-gray-900">{formatCurrency(item.price)}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {selectedItems.length > 0 && (
                    <div className="mt-4 bg-blue-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600 mb-1">Tu total:</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(
                          tableData.items
                            .filter(item => selectedItems.includes(item.id))
                            .reduce((sum, item) => sum + item.price, 0)
                        )}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => setCurrentStep('payment')}
                disabled={
                  splitMode === SPLIT_MODES.BY_ITEMS && selectedItems.length === 0
                }
                className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar al pago
              </button>
            </div>
          )}

          {/* Paso 3: Pago */}
          {currentStep === 'payment' && (
            <div className="space-y-4">
              {/* Resumen del pago */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-medium text-gray-900 mb-4">Resumen del pago</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tu parte:</span>
                    <span className="font-medium">{formatCurrency(totals.perPerson)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Método:</span>
                    <span className="font-medium">
                      {splitMode === SPLIT_MODES.EQUAL ? 'División igual' : 'Por ítems'}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Total a pagar:</span>
                    <span>{formatCurrency(totals.perPerson)}</span>
                  </div>
                </div>
              </div>

              {/* Métodos de pago */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-medium text-gray-900 mb-4">Método de pago</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`w-full p-4 rounded-lg border-2 transition-colors ${
                      paymentMethod === 'card'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-gray-600" />
                      <span className="font-medium">Tarjeta de crédito/débito</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('bizum')}
                    className={`w-full p-4 rounded-lg border-2 transition-colors ${
                      paymentMethod === 'bizum'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-gray-600" />
                      <span className="font-medium">Bizum</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Seguridad */}
              <div className="bg-green-50 rounded-xl p-4 flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900">Pago seguro</p>
                  <p className="text-xs text-green-700">
                    Tu información está protegida con cifrado SSL
                  </p>
                </div>
              </div>

              <button
                onClick={processPayment}
                disabled={loading}
                className="w-full bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Pagar {formatCurrency(totals.perPerson)}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Paso 4: Éxito */}
          {currentStep === 'success' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">¡Pago completado!</h2>
                <p className="text-gray-600 mb-4">
                  Tu pago de {formatCurrency(totals.perPerson)} se ha procesado correctamente
                </p>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                  <p>Mesa: {tableData.mesa_numero}</p>
                  <p>Fecha: {new Date().toLocaleDateString('es-ES')}</p>
                  <p>Hora: {new Date().toLocaleTimeString('es-ES')}</p>
                </div>
              </div>

              <button
                onClick={() => window.close()}
                className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TablePaymentPage;