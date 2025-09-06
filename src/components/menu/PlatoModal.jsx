/**
 * @fileoverview Modal para crear/editar platos
 * Gestiona el formulario de platos con validación
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Save, RefreshCw, Plus, Trash2, Upload } from 'lucide-react';
import { VALIDATION_RULES } from '../../services/utils/constants';
import { getApiConfig } from '../../config/features';
import { useMessage } from '../../hooks/useMessage';
import { useAppContext } from '../../context/AppContext';

// Configuración de API dinámica
const API_CONFIG = getApiConfig();

/**
 * Modal para gestionar platos
 * @param {Object} props - Props del componente
 * @param {boolean} props.abierto - Si el modal está abierto
 * @param {string} props.modo - Modo del modal ('crear' o 'editar')
 * @param {Object} props.plato - Datos del plato (para editar)
 * @param {Array} props.categorias - Lista de categorías
 * @param {number} props.categoriaInicialId - ID de categoría preseleccionada
 * @param {Function} props.onCerrar - Callback al cerrar
 * @param {Function} props.onGuardar - Callback al guardar
 * @returns {JSX.Element} Componente PlatoModal
 */
function PlatoModal({ abierto, modo = 'crear', plato, categorias, categoriaInicialId, onCerrar, onGuardar }) {
  const [formData, setFormData] = useState({
    categoria_id: categoriaInicialId || categorias[0]?.id || 1,
    nombre: '',
    descripcion: '',
    precio: '',
    imagen_url: '',
    alergenos: [],
    disponible: true,
    vegetariano: false,
    vegano: false,
    sin_gluten: false,
    picante: false,
    recomendado: false
  });
  const [alergenoNuevo, setAlergenoNuevo] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [validandoNombre, setValidandoNombre] = useState(false);
  const [nombreDuplicado, setNombreDuplicado] = useState(false);
  const [mensajeValidacion, setMensajeValidacion] = useState('');
  const [formularioInicializado, setFormularioInicializado] = useState(false);
  const [datosOriginales, setDatosOriginales] = useState(null);
  const fileInputRef = useRef(null);
  
  const { actualizarDatosEspejo } = useAppContext();
  const { mostrarMensaje } = useMessage();
  
  // Lista de alérgenos comunes
  const alergenosComunes = [
    'Gluten', 'Lácteos', 'Huevos', 'Pescado', 'Mariscos',
    'Frutos secos', 'Soja', 'Apio', 'Mostaza', 'Sésamo',
    'Sulfitos', 'Moluscos', 'Altramuces', 'Cacahuetes'
  ];

  // Inicializar formulario solo cuando se abre el modal
  useEffect(() => {
    if (abierto && !formularioInicializado && categorias.length > 0) {
      console.log('🔧 Inicializando formulario PlatoModal', { 
        modo, 
        plato: plato?.nombre, 
        categoriaInicialId, 
        categoriasDisponibles: categorias.length 
      });
      
      let nuevoFormData;
      if (modo === 'editar' && plato) {
        nuevoFormData = {
          categoria_id: plato.categoria_id || categorias[0]?.id || 1,
          nombre: plato.nombre || '',
          descripcion: plato.descripcion || '',
          precio: plato.precio || '',
          imagen_url: plato.imagen_url || '',
          alergenos: plato.alergenos || [],
          disponible: plato.disponible !== false,
          vegetariano: plato.vegetariano || false,
          vegano: plato.vegano || false,
          sin_gluten: plato.sin_gluten || false,
          picante: plato.picante || false,
          recomendado: plato.recomendado || false
        };
      } else {
        nuevoFormData = {
          categoria_id: categoriaInicialId || categorias[0]?.id || 1,
          nombre: '',
          descripcion: '',
          precio: '',
          imagen_url: '',
          alergenos: [],
          disponible: true,
          vegetariano: false,
          vegano: false,
          sin_gluten: false,
          picante: false,
          recomendado: false
        };
      }
      
      console.log('📊 FormData inicial establecido:', nuevoFormData);
      setFormData(nuevoFormData);
      setDatosOriginales(nuevoFormData);
      setFormularioInicializado(true);
      setAlergenoNuevo('');
      
      // Resetear estados de validación
      setNombreDuplicado(false);
      setMensajeValidacion('');
      setValidandoNombre(false);
    }
  }, [abierto, modo, plato?.id, categoriaInicialId, formularioInicializado, categorias.length]);

  // Resetear estado cuando se cierra el modal
  useEffect(() => {
    if (!abierto) {
      console.log('🔧 Reseteando estado PlatoModal al cerrar');
      setFormularioInicializado(false);
      setDatosOriginales(null);
      setNombreDuplicado(false);
      setMensajeValidacion('');
      setValidandoNombre(false);
    }
  }, [abierto]);

  /**
   * Valida si el nombre del plato ya existe
   * @param {string} nombre - Nombre del plato
   * @param {number} categoriaId - ID de la categoría
   */
  const validarNombrePlato = async (nombre, categoriaId) => {
    if (!nombre.trim() || !categoriaId) {
      setNombreDuplicado(false);
      setMensajeValidacion('');
      return;
    }

    setValidandoNombre(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/menu/plato/validar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          categoria_id: categoriaId,
          plato_id: modo === 'editar' ? plato?.id : null
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.exito) {
        setNombreDuplicado(data.duplicado);
        setMensajeValidacion(data.mensaje);
      }
    } catch (error) {
      console.error('Error validando nombre:', error);
      setNombreDuplicado(false);
      setMensajeValidacion('');
    } finally {
      setValidandoNombre(false);
    }
  };

  // Efecto para validar el nombre cuando cambie (solo si el formulario está inicializado)
  useEffect(() => {
    if (!formularioInicializado) return;
    
    const timeoutId = setTimeout(() => {
      if (formData.nombre?.trim() && formData.categoria_id) {
        console.log('🔍 Validando nombre:', formData.nombre);
        validarNombrePlato(formData.nombre, formData.categoria_id);
      } else {
        // Limpiar validación si no hay nombre
        setNombreDuplicado(false);
        setMensajeValidacion('');
      }
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [formData.nombre, formData.categoria_id, formularioInicializado]);

  /**
   * Maneja el cambio de un campo
   * @param {string} campo - Nombre del campo
   * @param {any} valor - Nuevo valor
   */
  const handleChange = (campo, valor) => {
    console.log(`📝 Cambio en campo "${campo}":`, valor);
    setFormData(prev => {
      const nuevoData = { ...prev, [campo]: valor };
      console.log('📊 FormData actualizado:', nuevoData);
      return nuevoData;
    });
  };

  /**
   * Añade un alérgeno a la lista
   */
  const añadirAlergeno = () => {
    if (alergenoNuevo && !formData.alergenos?.includes(alergenoNuevo)) {
      handleChange('alergenos', [...(formData.alergenos || []), alergenoNuevo]);
      setAlergenoNuevo('');
    }
  };

  /**
   * Elimina un alérgeno de la lista
   * @param {number} index - Índice del alérgeno
   */
  const eliminarAlergeno = (index) => {
    const nuevosAlergenos = formData.alergenos.filter((_, i) => i !== index);
    handleChange('alergenos', nuevosAlergenos);
  };

  /**
   * Sube imagen del plato
   * @param {File} file - Archivo de imagen
   */
  const subirImagen = async (file) => {
    if (!file) return;
    
    setSubiendoImagen(true);
    try {
      // Crear una URL temporal para vista previa inmediata
      const imageURL = URL.createObjectURL(file);
      handleChange('imagen_url', imageURL);
      
      // Subir archivo real al servidor
      const formDataImg = new FormData();
      formDataImg.append('imagen', file);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/menu/plato/imagen`, {
        method: 'POST',
        body: formDataImg
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.exito) {
        // Reemplazar URL blob temporal con URL pública permanente
        handleChange('imagen_url', data.imagen_url);
        mostrarMensaje('Imagen subida correctamente', 'success');
        console.log('🔄 URL actualizada de blob: a pública:', data.imagen_url);
      } else {
        mostrarMensaje(data.mensaje || 'Error al subir imagen', 'error');
      }
      
    } catch (error) {
      console.error('Error procesando imagen:', error);
      mostrarMensaje('Error al procesar imagen: ' + error.message, 'error');
    } finally {
      setSubiendoImagen(false);
    }
  };

  /**
   * Maneja la selección de archivo
   * @param {Event} e - Evento de cambio
   */
  const manejarArchivoSeleccionado = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        mostrarMensaje('Por favor selecciona un archivo de imagen válido', 'error');
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        mostrarMensaje('La imagen debe ser menor a 5MB', 'error');
        return;
      }
      
      subirImagen(file);
    }
  };

  /**
   * Guarda el plato
   */
  const guardarPlato = async () => {
    console.log('💾 Intentando guardar plato:', { modo, formData });
    
    if (!esFormularioValido()) {
      console.log('❌ Validación falló:', {
        nombre: formData.nombre?.trim().length > 0,
        descripcion: formData.descripcion?.trim().length > 0,
        precio: !isNaN(parseFloat(formData.precio)),
        nombreDuplicado,
        validandoNombre
      });
      mostrarMensaje('Por favor completa todos los campos requeridos', 'error');
      return;
    }
    
    setGuardando(true);
    try {
      const url = modo === 'crear' 
        ? `${API_CONFIG.BASE_URL}/admin/menu/plato`
        : `${API_CONFIG.BASE_URL}/admin/menu/plato/${plato.id}`;
      
      const method = modo === 'crear' ? 'POST' : 'PUT';
      
      console.log('📡 Enviando request:', { url, method, formData });
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Response data:', data);
      
      if (data.exito) {
        mostrarMensaje(
          `Plato ${modo === 'crear' ? 'creado' : 'actualizado'} correctamente`, 
          'success'
        );
        await actualizarDatosEspejo();
        if (onGuardar) onGuardar(data.plato || formData);
      } else {
        console.log('❌ Backend error:', data);
        mostrarMensaje(data.mensaje || 'Error al guardar plato', 'error');
      }
    } catch (error) {
      console.error('❌ Error guardando plato:', error);
      mostrarMensaje('Error al guardar plato: ' + error.message, 'error');
    } finally {
      setGuardando(false);
    }
  };

  /**
   * Valida si el formulario es válido
   * @returns {boolean} True si es válido
   */
  const esFormularioValido = () => {
    const precio = parseFloat(formData.precio);
    const validaciones = {
      tieneNombre: formData.nombre?.trim().length > 0,
      tieneDescripcion: formData.descripcion?.trim().length > 0,
      precioValido: !isNaN(precio) && precio >= VALIDATION_RULES.MIN_PRICE && precio <= VALIDATION_RULES.MAX_PRICE,
      sinDuplicado: !nombreDuplicado,
      noValidando: !validandoNombre
    };
    
    const esValido = Object.values(validaciones).every(Boolean);
    
    if (!esValido) {
      console.log('❌ Validación formulario:', validaciones);
    }
    
    return esValido;
  };

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold">
              {modo === 'crear' ? 'Nuevo Plato' : 'Editar Plato'}
            </h3>
            <p className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded mt-1">
              Los cambios se guardarán en la base de datos y se sincronizarán con el GPT
            </p>
          </div>
          <button
            onClick={onCerrar}
            className="p-1 hover:bg-gray-100 rounded"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Formulario */}
        <div className="space-y-4">
          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Categoría <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.categoria_id}
              onChange={(e) => handleChange('categoria_id', parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
          </div>
          
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Nombre del Plato <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  nombreDuplicado
                    ? 'border-red-500 focus:ring-red-500'
                    : validandoNombre
                    ? 'border-yellow-500 focus:ring-yellow-500'
                    : 'border-gray-300 focus:ring-green-500'
                }`}
                placeholder="Ej: Paella Valenciana"
                required
              />
              {validandoNombre && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />
                </div>
              )}
            </div>
            {mensajeValidacion && (
              <p className={`text-xs mt-1 ${
                nombreDuplicado ? 'text-red-600' : 'text-green-600'
              }`}>
                {mensajeValidacion}
              </p>
            )}
          </div>
          
          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="3"
              placeholder="Descripción breve del plato..."
              required
            />
          </div>
          
          {/* Precio */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Precio (€) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min={VALIDATION_RULES.MIN_PRICE}
              max={VALIDATION_RULES.MAX_PRICE}
              value={formData.precio}
              onChange={(e) => handleChange('precio', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="12.50"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Mínimo: {VALIDATION_RULES.MIN_PRICE}€ - Máximo: {VALIDATION_RULES.MAX_PRICE}€
            </p>
          </div>
          
          {/* Imagen del plato */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Imagen del plato
            </label>
            
            {/* Vista previa de imagen */}
            {formData.imagen_url && (
              <div className="mb-3 relative">
                <img
                  src={formData.imagen_url}
                  alt="Vista previa"
                  className="w-full h-32 object-cover rounded-lg border"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                {subiendoImagen && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <div className="flex items-center text-white">
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      <span>Procesando imagen...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* URL manual de imagen */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                URL de imagen (opcional)
              </label>
              <input
                type="url"
                value={formData.imagen_url}
                onChange={(e) => handleChange('imagen_url', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>
            
            {/* Subida de imagen */}
            <div className="flex items-center space-x-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={manejarArchivoSeleccionado}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={subiendoImagen}
                className={`flex items-center px-3 py-2 border rounded-lg transition-colors ${
                  subiendoImagen 
                    ? 'border-blue-300 bg-blue-50 text-blue-600 cursor-not-allowed' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {subiendoImagen ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                {subiendoImagen ? 'Procesando...' : 'Seleccionar archivo'}
              </button>
              
              {formData.imagen_url && (
                <button
                  type="button"
                  onClick={() => handleChange('imagen_url', '')}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar imagen"
                  disabled={subiendoImagen}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Puedes subir un archivo local o introducir una URL de imagen.
            </p>
          </div>

          {/* Características del plato */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Características
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.vegetariano}
                  onChange={(e) => handleChange('vegetariano', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Vegetariano</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.vegano}
                  onChange={(e) => handleChange('vegano', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Vegano</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.sin_gluten}
                  onChange={(e) => handleChange('sin_gluten', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Sin gluten</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.picante}
                  onChange={(e) => handleChange('picante', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Picante</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.recomendado}
                  onChange={(e) => handleChange('recomendado', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Recomendado</span>
              </label>
            </div>
          </div>

          {/* Alérgenos */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Alérgenos
            </label>
            
            {/* Lista de alérgenos actuales */}
            {formData.alergenos?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.alergenos.map((alergeno, idx) => (
                  <span 
                    key={idx}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800"
                  >
                    {alergeno}
                    <button
                      onClick={() => eliminarAlergeno(idx)}
                      className="ml-1 hover:text-red-600"
                      type="button"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            {/* Selector de alérgenos */}
            <div className="flex gap-2">
              <select
                value={alergenoNuevo}
                onChange={(e) => setAlergenoNuevo(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Seleccionar alérgeno...</option>
                {alergenosComunes.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <button
                onClick={añadirAlergeno}
                type="button"
                className="px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
                disabled={!alergenoNuevo}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Disponibilidad */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="disponible"
              checked={formData.disponible}
              onChange={(e) => handleChange('disponible', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="disponible" className="text-sm font-medium">
              Disponible inmediatamente
            </label>
          </div>
        </div>
        
        {/* Acciones */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onCerrar}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={guardando}
          >
            Cancelar
          </button>
          <button
            onClick={guardarPlato}
            disabled={guardando || !esFormularioValido()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {guardando ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                {modo === 'crear' ? 'Creando...' : 'Guardando...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {modo === 'crear' ? 'Crear Plato' : 'Guardar Cambios'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlatoModal;