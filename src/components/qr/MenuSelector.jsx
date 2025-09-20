/**
 * @fileoverview Componente para seleccionar productos del menú del restaurante
 * Permite al camarero añadir productos directamente del menú a la cuenta de mesa
 */

import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  ChefHat,
  Coffee,
  Wine,
  Cookie,
  UtensilsCrossed,
  ArrowLeft,
  Check
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import menuService from '../../services/api/menuService';
import { useAppContext } from '../../context/AppContext';

/**
 * Selector de productos del menú
 * @param {Object} props - Props del componente
 * @param {boolean} props.isOpen - Estado del modal
 * @param {Function} props.onClose - Callback para cerrar
 * @param {Function} props.onAddItem - Callback para agregar ítem seleccionado
 * @param {number} props.tableNumber - Número de mesa
 * @returns {JSX.Element} Componente MenuSelector
 */
const MenuSelector = ({ isOpen, onClose, onAddItem, tableNumber }) => {
  const { datosEspejo } = useAppContext();
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [addedItems, setAddedItems] = useState(new Set());

  // Cargar menú cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadMenu();
      setAddedItems(new Set()); // Limpiar items agregados
    }
  }, [isOpen]);

  /**
   * Carga el menú desde el contexto o API
   */
  const loadMenu = async () => {
    setLoading(true);
    try {
      // Primero intentar usar datos del contexto
      if (datosEspejo?.menu) {
        setMenu(datosEspejo.menu);
      } else {
        // Si no hay datos en contexto, cargar desde API
        const response = await menuService.obtenerMenu();
        if (response.exito) {
          setMenu(response.menu);
        }
      }
    } catch (error) {
      console.error('Error cargando menú:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filtra platos según término de búsqueda
   */
  const filterPlatos = (platos) => {
    if (!searchTerm) return platos;

    return platos.filter(plato =>
      plato.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plato.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  /**
   * Obtiene icono para cada categoría
   */
  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    if (name.includes('bebida') || name.includes('copa') || name.includes('vino')) return Wine;
    if (name.includes('postre') || name.includes('dulce')) return Cookie;
    if (name.includes('café') || name.includes('infusion')) return Coffee;
    if (name.includes('entrada') || name.includes('aperitivo')) return UtensilsCrossed;
    return ChefHat;
  };

  /**
   * Maneja la adición de un plato a la cuenta
   */
  const handleAddPlato = (plato) => {
    const item = {
      id: `menu_${plato.id}_${Date.now()}`,
      name: plato.nombre,
      price: parseFloat(plato.precio),
      category: plato.categoria?.nombre || 'General',
      description: plato.descripcion,
      fromMenu: true,
      menuItemId: plato.id
    };

    onAddItem(item);
    setAddedItems(prev => new Set([...prev, plato.id]));
  };

  /**
   * Renderiza la vista de categorías
   */
  const renderCategoriesView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">
          Seleccionar Categoría - Mesa {tableNumber}
        </h3>
        <Button variant="outline" size="sm" onClick={onClose}>
          Cerrar
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse bg-slate-200 h-24 rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {menu?.categorias?.map((categoria) => {
            const Icon = getCategoryIcon(categoria.nombre);
            const platosDisponibles = categoria.platos?.filter(p => p.disponible) || [];

            return (
              <button
                key={categoria.id}
                onClick={() => setSelectedCategory(categoria)}
                className="p-4 border border-slate-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex-center">
                    <Icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">{categoria.nombre}</h4>
                    <p className="text-sm text-slate-600">
                      {platosDisponibles.length} plato{platosDisponibles.length !== 1 ? 's' : ''} disponible{platosDisponibles.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  /**
   * Renderiza la vista de platos de una categoría
   */
  const renderPlatosView = () => {
    const platosDisponibles = selectedCategory?.platos?.filter(p => p.disponible) || [];
    const platosFiltrados = filterPlatos(platosDisponibles);

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedCategory(null)}
            icon={ArrowLeft}
          >
            Volver
          </Button>
          <h3 className="text-lg font-semibold text-slate-900">
            {selectedCategory.nombre} - Mesa {tableNumber}
          </h3>
        </div>

        {/* Búsqueda */}
        <Input
          placeholder="Buscar platos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={Search}
        />

        {/* Lista de platos */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {platosFiltrados.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <ChefHat className="w-8 h-8 mx-auto mb-2" />
              <p>No se encontraron platos disponibles</p>
            </div>
          ) : (
            platosFiltrados.map((plato) => {
              const isAdded = addedItems.has(plato.id);

              return (
                <div
                  key={plato.id}
                  className="p-4 border border-slate-200 rounded-lg hover:border-emerald-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{plato.nombre}</h4>
                      {plato.descripcion && (
                        <p className="text-sm text-slate-600 mt-1">{plato.descripcion}</p>
                      )}
                      {plato.alergenos && plato.alergenos.length > 0 && (
                        <p className="text-xs text-amber-600 mt-1">
                          Alérgenos: {plato.alergenos.join(', ')}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-semibold text-emerald-600">
                          {parseFloat(plato.precio).toFixed(2)}€
                        </span>
                        {isAdded && (
                          <span className="text-xs text-emerald-600 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Agregado
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddPlato(plato)}
                      disabled={isAdded}
                      icon={isAdded ? Check : Plus}
                      className="ml-3"
                    >
                      {isAdded ? 'Agregado' : 'Añadir'}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        {selectedCategory ? renderPlatosView() : renderCategoriesView()}
      </div>
    </Modal>
  );
};

export default MenuSelector;