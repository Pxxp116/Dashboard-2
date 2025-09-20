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
  X,
  Trash2,
  Edit2,
  ChefHat
} from 'lucide-react';
import {
  SPLIT_MODES,
  formatCurrency,
  calculateEqualSplit,
  calculateItemBasedSplit,
  generateEmptyPaymentData
} from '../utils/tableQRGenerator';
import restaurantDataService from '../services/restaurantDataService';

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

  // Cargar datos reales de la mesa
  useEffect(() => {
    const loadTableData = async () => {
      setLoading(true);
      try {
        console.log(`🔄 [Dashboard] Cargando datos para Mesa ${mesaId}...`);

        // Cargar datos completos del restaurante para esta mesa
        const data = await restaurantDataService.getCompleteTableData(mesaId);

        console.log(`✅ [Dashboard] Datos cargados para Mesa ${mesaId}:`, {
          restaurante: data.restaurante.nombre,
          cuenta_items: data.cuenta.items?.length || 0,
          menu_categorias: data.menu.categorias?.length || 0,
          source: data.metadata?.source
        });

        // Si no hay cuenta específica, permitir configurarla desde el menú
        let initialItems = data.cuenta.items || [];
        let needsConfiguration = data.cuenta.metadata?.needs_configuration || false;

        // Si la cuenta está vacía pero hay menú disponible, mostrar opciones del menú
        if (initialItems.length === 0 && data.menu.categorias?.length > 0) {
          console.log('📋 [Dashboard] Cuenta vacía, permitiendo configuración desde menú del restaurante');
          needsConfiguration = true;
        }

        setTableData({
          mesa_numero: data.mesa.numero,
          mesa_id: data.mesa.id,
          items: initialItems,
          totalAmount: data.cuenta.total || 0,
          restaurante: data.restaurante.nombre,
          tipo_cocina: data.restaurante.tipo_cocina,
          direccion: data.restaurante.direccion,
          telefono: data.restaurante.telefono,
          menu: data.menu, // Incluir menú completo para configuración
          needsConfiguration,
          metadata: data.metadata
        });

        // Inicializar con el cliente actual como primer participante
        setParticipants([
          { id: 1, name: '', phone: '', selectedItems: [], amount: 0 }
        ]);

      } catch (err) {
        console.error('❌ [Dashboard] Error cargando datos de Mesa:', err);
        setError('Error al cargar los datos de la mesa. Intenta recargar la página.');
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
   * Agrega un nuevo producto a la cuenta
   */
  const addItem = () => {
    const newItem = {
      id: Date.now(),
      nombre: '',
      precio: 0,
      categoria: 'General',
      cantidad: 1
    };
    setTableData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  /**
   * Agrega un producto del menú del restaurante a la cuenta
   */
  const addMenuItemToAccount = (plato, categoria) => {
    console.log(`📝 [Dashboard] Agregando ${plato.nombre} a la cuenta de Mesa ${tableData.mesa_numero}`);

    const newItem = {
      id: Date.now(),
      menu_id: plato.id,
      nombre: plato.nombre,
      precio: Number(plato.precio),
      categoria: categoria.nombre,
      descripcion: plato.descripcion || '',
      cantidad: 1,
      alergenos: plato.alergenos || []
    };

    setTableData(prev => {
      const updatedItems = [...prev.items, newItem];
      const newTotal = updatedItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

      return {
        ...prev,
        items: updatedItems,
        totalAmount: newTotal
      };
    });
  };

  /**
   * Actualiza un producto
   */
  const updateItem = (index, field, value) => {
    setTableData(prev => {
      const updatedItems = prev.items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item };
          if (field === 'precio' || field === 'cantidad') {
            updatedItem[field] = parseFloat(value) || 0;
          } else {
            updatedItem[field] = value;
          }
          return updatedItem;
        }
        return item;
      });

      // Recalcular total
      const newTotal = updatedItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

      return {
        ...prev,
        items: updatedItems,
        totalAmount: newTotal
      };
    });
  };

  /**
   * Elimina un producto
   */
  const removeItem = (index) => {
    setTableData(prev => {
      const newItems = prev.items.filter((_, i) => i !== index);
      const newTotal = newItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

      return {
        ...prev,
        items: newItems,
        totalAmount: newTotal
      };
    });

    // Eliminar el ítem de las selecciones de participantes
    const itemId = tableData.items[index]?.id;
    if (itemId) {
      setParticipants(prev => prev.map(participant => ({
        ...participant,
        selectedItems: participant.selectedItems.filter(id => id !== itemId)
      })));
    }
  };

  /**
   * Guarda la cuenta configurada en el backend
   */
  const saveAccountToBackend = async () => {
    try {
      console.log(`💾 [Dashboard] Guardando cuenta de Mesa ${tableData.mesa_numero}...`);

      const accountData = {
        items: tableData.items,
        total: tableData.totalAmount,
        subtotal: tableData.totalAmount,
        participants: participants,
        split_mode: splitMode,
        status: 'active'
      };

      await restaurantDataService.updateTableAccount(tableData.mesa_id, accountData);

      console.log(`✅ [Dashboard] Cuenta de Mesa ${tableData.mesa_numero} guardada`);

      // Mostrar mensaje de éxito
      alert(`Cuenta de Mesa ${tableData.mesa_numero} guardada correctamente`);

    } catch (error) {
      console.error('❌ [Dashboard] Error guardando cuenta:', error);
      alert('Error al guardar la cuenta. Intenta de nuevo.');
    }
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
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      Productos de la cuenta
                      {tableData?.restaurante && (
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                          {tableData.restaurante}
                        </span>
                      )}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={addItem}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Manual
                      </button>
                      {tableData?.menu?.categorias?.length > 0 && (
                        <button
                          onClick={() => setCurrentStep('menu')}
                          className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center gap-1"
                        >
                          <ChefHat className="w-3 h-3" />
                          Del Menú
                        </button>
                      )}
                    </div>
                  </div>
                  {tableData.items.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-blue-300 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                      <ShoppingCart className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <p className="text-blue-700 font-semibold mb-1">Configura tu cuenta para esta mesa</p>
                      <p className="text-blue-600 text-sm mb-3">Agrega productos para comenzar a dividir la cuenta</p>
                      <button
                        onClick={addItem}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                      >
                        Agregar primer producto
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tableData.items.map((item, index) => (
                        <div key={item.id} className="bg-white rounded-lg p-3 border">
                          <div className="grid grid-cols-4 gap-2 mb-2">
                            <input
                              type="text"
                              value={item.nombre || ''}
                              onChange={(e) => updateItem(index, 'nombre', e.target.value)}
                              placeholder="Nombre del producto"
                              className="text-sm px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <input
                              type="number"
                              step="0.01"
                              value={item.precio || 0}
                              onChange={(e) => updateItem(index, 'precio', e.target.value)}
                              placeholder="Precio"
                              className="text-sm px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <input
                              type="number"
                              min="1"
                              value={item.cantidad || 1}
                              onChange={(e) => updateItem(index, 'cantidad', e.target.value)}
                              placeholder="Cant."
                              className="text-sm px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                              onClick={() => removeItem(index)}
                              className="text-red-500 hover:text-red-700 text-xs flex items-center justify-center"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          {item.nombre && item.precio > 0 && (
                            <div className="flex justify-between text-sm">
                              <div>
                                <span className="text-gray-700">{item.nombre}</span>
                                {item.categoria && (
                                  <span className="text-xs text-gray-500 ml-2">• {item.categoria}</span>
                                )}
                              </div>
                              <span className="font-medium">
                                {item.cantidad > 1 && `${item.cantidad}x `}
                                {formatCurrency(item.precio * (item.cantidad || 1))}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
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
                disabled={!customerInfo.name.trim() || tableData.items.length === 0}
                className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!customerInfo.name.trim() ? 'Ingresa tu nombre para continuar' :
                 tableData.items.length === 0 ? 'Agrega productos para continuar' :
                 'Continuar a división de pago'}
              </button>
            </div>
          )}

          {/* Sección Especial: Seleccionar del Menú del Restaurante */}
          {currentStep === 'menu' && tableData?.menu?.categorias?.length > 0 && (
            <div className="space-y-4">
              {/* Header del menú */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      <ChefHat className="w-4 h-4" />
                      Menú de {tableData.restaurante}
                    </h3>
                    {tableData.tipo_cocina && (
                      <p className="text-sm text-gray-600">{tableData.tipo_cocina}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setCurrentStep('details')}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Categorías del menú */}
                <div className="space-y-4">
                  {tableData.menu.categorias.map((categoria) => (
                    <div key={categoria.id} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {categoria.nombre}
                        {categoria.descripcion && (
                          <span className="text-sm text-gray-600 font-normal ml-2">
                            • {categoria.descripcion}
                          </span>
                        )}
                      </h4>

                      {categoria.platos && categoria.platos.length > 0 ? (
                        <div className="grid gap-3">
                          {categoria.platos
                            .filter(plato => plato.disponible !== false)
                            .map((plato) => (
                              <div
                                key={plato.id}
                                className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h5 className="font-medium text-gray-900">{plato.nombre}</h5>
                                    {plato.descripcion && (
                                      <p className="text-sm text-gray-600 mt-1">{plato.descripcion}</p>
                                    )}
                                    {plato.alergenos && plato.alergenos.length > 0 && (
                                      <p className="text-xs text-amber-600 mt-1">
                                        Alérgenos: {plato.alergenos.join(', ')}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 ml-4">
                                    <span className="font-bold text-gray-900">
                                      {formatCurrency(plato.precio)}
                                    </span>
                                    <button
                                      onClick={() => {
                                        addMenuItemToAccount(plato, categoria);
                                        // Volver a detalles después de agregar
                                        setCurrentStep('details');
                                      }}
                                      className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors text-sm font-medium flex items-center gap-1"
                                    >
                                      <Plus className="w-3 h-3" />
                                      Agregar
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No hay platos disponibles en esta categoría</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Botón para guardar cuenta */}
                {tableData.items?.length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <button
                      onClick={saveAccountToBackend}
                      className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                      💾 Guardar Cuenta Configurada
                    </button>
                  </div>
                )}
              </div>
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
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Selecciona tus ítems</h4>
                    <button
                      onClick={addItem}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Agregar producto
                    </button>
                  </div>

                  {tableData.items.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-purple-300 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50">
                      <ShoppingCart className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                      <p className="text-purple-700 font-semibold mb-1">No hay productos en la cuenta</p>
                      <p className="text-sm text-purple-600 mb-4">Agrega productos para poder seleccionar los tuyos</p>
                      <button
                        onClick={addItem}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                      >
                        Agregar primer producto
                      </button>
                    </div>
                  ) : (
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
                          disabled={!item.name || item.price <= 0}
                          className={`w-full p-3 rounded-lg border-2 transition-colors text-left ${
                            selectedItems.includes(item.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          } ${(!item.name || item.price <= 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-900">
                                {item.name || 'Sin nombre'}
                              </p>
                              <p className="text-sm text-gray-600">{item.category}</p>
                            </div>
                            <p className="font-bold text-gray-900">{formatCurrency(item.price)}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

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