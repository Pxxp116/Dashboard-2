/**
 * @fileoverview Tab de políticas del restaurante
 * Muestra y permite editar las políticas y reglas del negocio
 */

import React, { useState } from 'react';
import { Clock, Calendar, AlertCircle, Edit2, PawPrint } from 'lucide-react';
import PoliticasModalSimple from './PoliticasModalSimple';
import { useAppContext } from '../../context/AppContext';
import { useMessage } from '../../hooks/useMessage';

/**
 * Tab de políticas del restaurante
 * @param {Object} props - Props del componente
 * @param {Object} props.politicas - Políticas actuales
 * @returns {JSX.Element} Componente PoliciesTab
 */
function PoliciesTab({ politicas }) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const { actualizarDatosEspejo } = useAppContext();
  const { mostrarMensaje } = useMessage();
  /**
   * Renderiza una fila de política
   * @param {Object} config - Configuración de la política
   * @returns {JSX.Element} Fila de política
   */
  const renderPolicyRow = (config) => {
    const { icon: Icon, label, value, type = 'text', suffix = '' } = config;
    
    let displayValue;
    if (type === 'boolean') {
      displayValue = (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'SÍ' : 'NO'}
        </span>
      );
    } else if (type === 'currency') {
      displayValue = (
        <span className="font-medium text-gray-900">
          {value}€
        </span>
      );
    } else {
      displayValue = (
        <span className="text-gray-600">
          {value}{suffix}
        </span>
      );
    }
    
    return (
      <div className="flex items-center justify-between py-4 border-b last:border-b-0">
        <div className="flex items-center">
          {Icon && <Icon className="w-5 h-5 mr-3 text-gray-400" />}
          <span className="font-medium text-gray-900">{label}</span>
        </div>
        {displayValue}
      </div>
    );
  };

  const policyConfigs = [
    {
      icon: Clock,
      label: 'Tiempo de antelación para cancelar',
      value: politicas.cancelacion_horas || 24,
      suffix: ' horas'
    },
    {
      icon: Calendar,
      label: 'Duración estándar de mesa',
      value: politicas.tiempo_mesa_minutos || 120,
      suffix: ' minutos'
    },
    {
      icon: PawPrint,
      label: 'Mascotas permitidas',
      value: politicas.mascotas_permitidas || false,
      type: 'boolean'
    },
    {
      icon: AlertCircle,
      label: 'Permitir fumadores en terraza',
      value: politicas.fumadores_terraza !== false,
      type: 'boolean'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Políticas principales */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 mr-2 text-blue-600" />
            <h2 className="text-xl font-bold">Políticas del Restaurante</h2>
          </div>
          <button
            onClick={() => setModalAbierto(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Edit2 className="w-4 h-4" />
            <span>Editar Políticas</span>
          </button>
        </div>
        
        <div className="divide-y">
          {policyConfigs.map((config, idx) => (
            <div key={idx}>
              {renderPolicyRow(config)}
            </div>
          ))}
        </div>
      </div>

      {/* Horarios de servicio */}
      {politicas.horarios && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold mb-4">Horarios de Servicio</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(politicas.horarios).map(([dia, horario]) => (
              <HorarioCard key={dia} dia={dia} horario={horario} />
            ))}
          </div>
        </div>
      )}

      {/* Información adicional */}
      {politicas.informacion_adicional && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold mb-4">Información Adicional</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {politicas.informacion_adicional}
            </p>
          </div>
        </div>
      )}

      {/* Restricciones especiales */}
      {politicas.restricciones && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold mb-4">Restricciones Especiales</h3>
          <ul className="space-y-2">
            {politicas.restricciones.map((restriccion, idx) => (
              <li key={idx} className="flex items-start">
                <AlertCircle className="w-4 h-4 mr-2 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{restriccion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modal de edición */}
      <PoliticasModalSimple
        abierto={modalAbierto}
        politicas={politicas}
        onCerrar={() => setModalAbierto(false)}
        onGuardar={async () => {
          mostrarMensaje('Políticas actualizadas correctamente', 'success');
          await actualizarDatosEspejo();
          setModalAbierto(false);
        }}
      />
    </div>
  );
}

/**
 * Tarjeta de horario
 * @param {Object} props - Props del componente
 * @param {string} props.dia - Día de la semana
 * @param {Object} props.horario - Horario del día
 * @returns {JSX.Element} Tarjeta de horario
 */
function HorarioCard({ dia, horario }) {
  const diasSemana = {
    lunes: 'Lunes',
    martes: 'Martes',
    miercoles: 'Miércoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
    sabado: 'Sábado',
    domingo: 'Domingo'
  };

  const nombreDia = diasSemana[dia.toLowerCase()] || dia;
  const esCerrado = horario.cerrado || (!horario.apertura && !horario.cierre);

  return (
    <div className={`border rounded-lg p-3 ${esCerrado ? 'bg-gray-50' : ''}`}>
      <div className="flex justify-between items-center">
        <span className="font-medium">{nombreDia}</span>
        {esCerrado ? (
          <span className="text-sm text-gray-500">Cerrado</span>
        ) : (
          <span className="text-sm">
            {horario.apertura} - {horario.cierre}
            {horario.servicio_continuo && (
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                Servicio continuo
              </span>
            )}
          </span>
        )}
      </div>
    </div>
  );
}

export default PoliciesTab;