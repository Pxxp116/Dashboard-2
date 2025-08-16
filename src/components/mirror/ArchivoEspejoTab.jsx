/**
 * @fileoverview Tab del archivo espejo
 * Vista técnica del estado completo del sistema
 */

import React, { useState } from 'react';
import { RefreshCw, Eye, Download, Copy, CheckCircle } from 'lucide-react';
import { UPDATE_INTERVALS } from '../../services/utils/constants';

/**
 * Tab de archivo espejo
 * @param {Object} props - Props del componente
 * @param {Object} props.archivoEspejo - Datos del archivo espejo
 * @param {Function} props.onRefresh - Callback para refrescar
 * @returns {JSX.Element} Componente ArchivoEspejoTab
 */
function ArchivoEspejoTab({ archivoEspejo, onRefresh }) {
  const [copiado, setCopiado] = useState(false);
  const [vistaExpandida, setVistaExpandida] = useState(false);
  
  const espejoFresco = archivoEspejo?.edad_segundos <= UPDATE_INTERVALS.MAX_MIRROR_AGE;
  
  /**
   * Copia el JSON al portapapeles
   */
  const copiarJSON = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(archivoEspejo, null, 2));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (error) {
      console.error('Error al copiar:', error);
    }
  };
  
  /**
   * Descarga el JSON como archivo
   */
  const descargarJSON = () => {
    const dataStr = JSON.stringify(archivoEspejo, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `espejo_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  /**
   * Calcula el tamaño del JSON
   * @returns {string} Tamaño formateado
   */
  const calcularTamaño = () => {
    const bytes = new TextEncoder().encode(JSON.stringify(archivoEspejo)).length;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold">Archivo Espejo (Vista Técnica)</h2>
            <p className="text-sm text-gray-500 mt-1">
              Estado completo del sistema sincronizado con el backend
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Indicador de frescura */}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              espejoFresco
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {archivoEspejo?.edad_segundos}s de antigüedad
            </span>
            
            {/* Botón refrescar */}
            <button
              onClick={onRefresh}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refrescar archivo espejo"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Información del archivo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <InfoCard
            label="Última actualización"
            value={archivoEspejo?.ultima_actualizacion || 'N/A'}
          />
          <InfoCard
            label="Tamaño"
            value={calcularTamaño()}
          />
          <InfoCard
            label="Reservas"
            value={archivoEspejo?.reservas?.length || 0}
          />
          <InfoCard
            label="Mesas"
            value={archivoEspejo?.mesas?.length || 0}
          />
        </div>
        
        {/* Controles */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setVistaExpandida(!vistaExpandida)}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center"
            >
              <Eye className="w-4 h-4 mr-1" />
              {vistaExpandida ? 'Contraer' : 'Expandir'} Vista
            </button>
            
            <button
              onClick={copiarJSON}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
            >
              {copiado ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  Copiar JSON
                </>
              )}
            </button>
            
            <button
              onClick={descargarJSON}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
            >
              <Download className="w-4 h-4 mr-1" />
              Descargar
            </button>
          </div>
          
          {!espejoFresco && (
            <div className="text-sm text-red-600">
              ⚠️ Los datos pueden estar desactualizados
            </div>
          )}
        </div>
        
        {/* Visor JSON */}
        <div className={`bg-gray-900 rounded-lg p-4 overflow-auto ${
          vistaExpandida ? 'max-h-none' : 'max-h-96'
        }`}>
          <pre className="text-xs font-mono text-green-400">
            {JSON.stringify(archivoEspejo, null, 2)}
          </pre>
        </div>
        
        {/* Estructura del archivo */}
        <div className="mt-6 border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Estructura del Archivo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {archivoEspejo && Object.keys(archivoEspejo).map(key => (
              <StructureItem
                key={key}
                name={key}
                value={archivoEspejo[key]}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Tarjeta de información
 * @param {Object} props - Props del componente
 * @param {string} props.label - Etiqueta
 * @param {string|number} props.value - Valor
 * @returns {JSX.Element} Tarjeta de información
 */
function InfoCard({ label, value }) {
  return (
    <div className="bg-gray-50 p-3 rounded-lg">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

/**
 * Item de estructura
 * @param {Object} props - Props del componente
 * @param {string} props.name - Nombre del campo
 * @param {any} props.value - Valor del campo
 * @returns {JSX.Element} Item de estructura
 */
function StructureItem({ name, value }) {
  const getType = (val) => {
    if (Array.isArray(val)) return `Array[${val.length}]`;
    if (val === null) return 'null';
    return typeof val;
  };
  
  const type = getType(value);
  
  return (
    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
      <span className="font-mono text-sm">{name}</span>
      <span className="text-xs bg-gray-200 px-2 py-1 rounded">
        {type}
      </span>
    </div>
  );
}

export default ArchivoEspejoTab;