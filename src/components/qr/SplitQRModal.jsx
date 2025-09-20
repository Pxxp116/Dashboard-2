/**
 * @fileoverview Modal para crear y editar códigos QR con funcionalidad SplitQR
 * Incluye vista previa en tiempo real y opciones avanzadas
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  Plus,
  Trash2,
  Eye,
  Save,
  Wand2,
  Link,
  Tag,
  FileText,
  Globe,
  Layers
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import {
  generateCustomQR,
  generateSplitQR,
  QR_TYPES,
  isValidUrl,
  generateQRUrl
} from '../../utils/qrGenerator';

/**
 * Modal para crear/editar códigos QR
 * @param {Object} props - Props del componente
 * @param {boolean} props.isOpen - Estado del modal
 * @param {Function} props.onClose - Callback para cerrar
 * @param {Function} props.onSave - Callback para guardar
 * @param {Object} props.editingQR - QR en edición (null para crear nuevo)
 * @returns {JSX.Element} Componente SplitQRModal
 */
const SplitQRModal = ({ isOpen, onClose, onSave, editingQR = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'menu-completo',
    customUrl: '',
    restaurante: 'GastroBot Restaurant'
  });

  const [splitMode, setSplitMode] = useState(false);
  const [splitSections, setSplitSections] = useState([]);
  const [previewUrl, setPreviewUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Resetear formulario cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      if (editingQR) {
        setFormData({
          name: editingQR.name,
          description: editingQR.description,
          type: editingQR.type || 'menu-completo',
          customUrl: editingQR.publicUrl,
          restaurante: 'GastroBot Restaurant'
        });
        setSplitMode(false);
      } else {
        setFormData({
          name: '',
          description: '',
          type: 'menu-completo',
          customUrl: '',
          restaurante: 'GastroBot Restaurant'
        });
        setSplitMode(false);
        setSplitSections([]);
      }
      setErrors({});
    }
  }, [isOpen, editingQR]);

  // Actualizar vista previa cuando cambian los datos
  useEffect(() => {
    if (formData.customUrl && isValidUrl(formData.customUrl)) {
      setPreviewUrl(generateQRUrl(formData.customUrl, 200));
    } else if (formData.type) {
      const defaultUrl = `${process.env.REACT_APP_PAYMENT_URL || 'https://gastrobot-payment.railway.app'}/${formData.type}`;
      setPreviewUrl(generateQRUrl(defaultUrl, 200));
    }
  }, [formData.customUrl, formData.type]);

  /**
   * Maneja cambios en los campos del formulario
   */
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  /**
   * Agrega una nueva sección para SplitQR
   */
  const addSplitSection = () => {
    const newSection = {
      id: `section_${Date.now()}`,
      name: '',
      description: '',
      url: ''
    };
    setSplitSections(prev => [...prev, newSection]);
  };

  /**
   * Actualiza una sección de SplitQR
   */
  const updateSplitSection = (index, field, value) => {
    setSplitSections(prev => prev.map((section, i) =>
      i === index ? { ...section, [field]: value } : section
    ));
  };

  /**
   * Elimina una sección de SplitQR
   */
  const removeSplitSection = (index) => {
    setSplitSections(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * Agrega secciones predefinidas para SplitQR
   */
  const addPredefinedSections = () => {
    const baseUrl = process.env.REACT_APP_PAYMENT_URL || 'https://gastrobot-payment.railway.app';
    const predefined = [
      { id: 'bebidas', name: 'Carta de Bebidas', description: 'Bebidas y cócteles', url: `${baseUrl}/menu/bebidas` },
      { id: 'postres', name: 'Carta de Postres', description: 'Dulces y postres', url: `${baseUrl}/menu/postres` },
      { id: 'menu-dia', name: 'Menú del Día', description: 'Especiales diarios', url: `${baseUrl}/menu/menu-del-dia` }
    ];
    setSplitSections(predefined);
  };

  /**
   * Valida el formulario
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (formData.customUrl && !isValidUrl(formData.customUrl)) {
      newErrors.customUrl = 'URL no válida';
    }

    if (splitMode && splitSections.length === 0) {
      newErrors.splitSections = 'Agrega al menos una sección para SplitQR';
    }

    if (splitMode) {
      splitSections.forEach((section, index) => {
        if (!section.name.trim()) {
          newErrors[`section_${index}_name`] = 'Nombre requerido';
        }
        if (section.url && !isValidUrl(section.url)) {
          newErrors[`section_${index}_url`] = 'URL no válida';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (splitMode && splitSections.length > 0) {
        // Generar múltiples QRs usando SplitQR
        const splitQRs = generateSplitQR(formData, splitSections);
        onSave(splitQRs);
      } else {
        // Generar QR individual
        const qrData = generateCustomQR(formData);
        onSave([qrData]);
      }

      onClose();
    } catch (error) {
      console.error('Error generando QR:', error);
      setErrors({ general: 'Error al generar el código QR' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-theme-gradient rounded-lg flex-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {editingQR ? 'Editar Código QR' : 'Crear Nuevo Código QR'}
              </h2>
              <p className="text-sm text-slate-600">
                {splitMode ? 'Modo SplitQR - Múltiples códigos' : 'Código QR individual'}
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
          {/* Formulario */}
          <div className="lg:col-span-2 space-y-6">
            {/* Modo SplitQR */}
            {!editingQR && (
              <div className="glass-card-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-violet-500" />
                    <span className="font-medium text-slate-900">Modo SplitQR</span>
                  </div>
                  <button
                    onClick={() => setSplitMode(!splitMode)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      splitMode
                        ? 'bg-violet-100 text-violet-700'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {splitMode ? 'Activado' : 'Desactivado'}
                  </button>
                </div>
                <p className="text-xs text-slate-600">
                  Genera múltiples códigos QR divididos por secciones
                </p>
              </div>
            )}

            {/* Información básica */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Información Básica
              </h3>

              <Input
                label="Nombre del QR"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ej: Menú Principal"
                error={errors.name}
                icon={Tag}
              />

              <Input
                label="Descripción"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Ej: Acceso completo al menú del restaurante"
                error={errors.description}
                multiline
                rows={2}
              />

              {!splitMode && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tipo de QR
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {Object.entries(QR_TYPES).map(([key, type]) => (
                        <option key={key} value={type.id}>
                          {type.name} - {type.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Input
                    label="URL Personalizada (Opcional)"
                    value={formData.customUrl}
                    onChange={(e) => handleInputChange('customUrl', e.target.value)}
                    placeholder="https://tu-restaurante.com/menu"
                    error={errors.customUrl}
                    icon={Link}
                  />
                </>
              )}
            </div>

            {/* Secciones SplitQR */}
            {splitMode && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Secciones SplitQR
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addPredefinedSections}
                      icon={Wand2}
                    >
                      Predefinidas
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addSplitSection}
                      icon={Plus}
                    >
                      Agregar
                    </Button>
                  </div>
                </div>

                {errors.splitSections && (
                  <p className="text-sm text-red-600">{errors.splitSections}</p>
                )}

                <div className="space-y-3">
                  {splitSections.map((section, index) => (
                    <div key={section.id} className="glass-card-sm p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">
                          Sección {index + 1}
                        </span>
                        <button
                          onClick={() => removeSplitSection(index)}
                          className="p-1 text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          placeholder="Nombre de la sección"
                          value={section.name}
                          onChange={(e) => updateSplitSection(index, 'name', e.target.value)}
                          error={errors[`section_${index}_name`]}
                          size="sm"
                        />
                        <Input
                          placeholder="URL (opcional)"
                          value={section.url}
                          onChange={(e) => updateSplitSection(index, 'url', e.target.value)}
                          error={errors[`section_${index}_url`]}
                          size="sm"
                        />
                      </div>

                      <Input
                        placeholder="Descripción"
                        value={section.description}
                        onChange={(e) => updateSplitSection(index, 'description', e.target.value)}
                        size="sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}
          </div>

          {/* Vista previa */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Vista Previa
            </h3>

            {!splitMode && previewUrl && (
              <div className="glass-card-sm p-4 text-center">
                <img
                  src={previewUrl}
                  alt="Vista previa del QR"
                  className="mx-auto mb-3 rounded-lg shadow-md"
                />
                <p className="text-xs text-slate-600">
                  Código QR generado
                </p>
              </div>
            )}

            {splitMode && splitSections.length > 0 && (
              <div className="glass-card-sm p-4">
                <p className="text-sm font-medium text-slate-900 mb-3">
                  Se generarán {splitSections.length} códigos QR:
                </p>
                <div className="space-y-2">
                  {splitSections.map((section, index) => (
                    <div key={section.id} className="flex items-center gap-2 text-xs">
                      <QrCode className="w-3 h-3 text-violet-500" />
                      <span className="text-slate-700">
                        {section.name || `Sección ${index + 1}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            loading={loading}
            icon={Save}
          >
            {editingQR ? 'Actualizar' : (splitMode ? 'Generar QRs' : 'Generar QR')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SplitQRModal;