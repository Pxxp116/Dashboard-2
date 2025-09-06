import React from 'react';
import { isFeatureEnabled } from '../../config/features';

/**
 * Componente wrapper para mostrar contenido basado en feature flags
 * 
 * @param {Object} props
 * @param {string} props.feature - Nombre de la feature requerida
 * @param {React.ReactNode} props.children - Contenido a mostrar si la feature está habilitada
 * @param {React.ReactNode} props.fallback - Contenido alternativo si la feature está deshabilitada
 * @param {boolean} props.showFallback - Si mostrar fallback cuando está deshabilitada (default: false)
 * 
 * @example
 * <FeatureWrapper feature="LOYALTY">
 *   <LoyaltyProgram />
 * </FeatureWrapper>
 */
const FeatureWrapper = ({ 
  feature, 
  children, 
  fallback = null, 
  showFallback = false 
}) => {
  const enabled = isFeatureEnabled(feature);

  if (enabled) {
    return <>{children}</>;
  }

  if (showFallback && fallback) {
    return <>{fallback}</>;
  }

  return null;
};

/**
 * Componente para mostrar contenido solo cuando múltiples features están habilitadas
 * 
 * @param {Object} props
 * @param {string[]} props.features - Array de nombres de features requeridas
 * @param {string} props.mode - 'all' (todas requeridas) o 'any' (al menos una) 
 * @param {React.ReactNode} props.children - Contenido a mostrar
 */
export const MultiFeatureWrapper = ({ 
  features, 
  mode = 'all', 
  children 
}) => {
  const checkFeatures = () => {
    if (mode === 'all') {
      return features.every(feature => isFeatureEnabled(feature));
    } else if (mode === 'any') {
      return features.some(feature => isFeatureEnabled(feature));
    }
    return false;
  };

  return checkFeatures() ? <>{children}</> : null;
};

/**
 * HOC para envolver componentes con feature flags
 * 
 * @param {React.Component} Component - Componente a envolver
 * @param {string} featureName - Nombre de la feature requerida
 * @returns {React.Component} Componente envuelto
 */
export const withFeature = (Component, featureName) => {
  return (props) => (
    <FeatureWrapper feature={featureName}>
      <Component {...props} />
    </FeatureWrapper>
  );
};

/**
 * Hook para verificar features en componentes funcionales
 * 
 * @param {string} featureName - Nombre de la feature
 * @returns {boolean} Si la feature está habilitada
 */
export const useFeature = (featureName) => {
  return isFeatureEnabled(featureName);
};

export default FeatureWrapper;