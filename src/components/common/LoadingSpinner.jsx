/**
 * @fileoverview Componente de spinner de carga
 * Indicador visual de carga reutilizable
 */

import React from 'react';
import { RefreshCw } from 'lucide-react';

/**
 * Spinner de carga animado
 * @param {Object} props - Props del componente
 * @param {string} [props.size='md'] - Tamaño del spinner (sm, md, lg)
 * @param {string} [props.text] - Texto opcional a mostrar
 * @param {boolean} [props.fullScreen=false] - Si debe ocupar toda la pantalla
 * @returns {JSX.Element} Componente LoadingSpinner
 */
function LoadingSpinner({ size = 'md', text, fullScreen = false }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <RefreshCw className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      {text && (
        <p className="mt-2 text-sm text-gray-600">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

export default LoadingSpinner;