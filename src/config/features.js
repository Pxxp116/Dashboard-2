/**
 * Sistema de Feature Flags para GastroBot
 * Permite habilitar/deshabilitar funcionalidades por restaurante
 * mediante variables de entorno en Railway
 */

// Configuración de features disponibles
const AVAILABLE_FEATURES = {
  // Features principales del sistema
  RESERVATIONS: 'REACT_APP_FEATURE_RESERVATIONS',
  MENU: 'REACT_APP_FEATURE_MENU', 
  TABLES: 'REACT_APP_FEATURE_TABLES',
  POLICIES: 'REACT_APP_FEATURE_POLICIES',
  MIRROR: 'REACT_APP_FEATURE_MIRROR',
  
  // Features adicionales/premium
  ANALYTICS: 'REACT_APP_FEATURE_ANALYTICS',
  LOYALTY: 'REACT_APP_FEATURE_LOYALTY',
  DELIVERY: 'REACT_APP_FEATURE_DELIVERY',
  CUSTOM_BRANDING: 'REACT_APP_FEATURE_BRANDING',
  INVENTORY: 'REACT_APP_FEATURE_INVENTORY',
  REPORTS: 'REACT_APP_FEATURE_REPORTS',
  
  // Features de integración
  WHATSAPP: 'REACT_APP_FEATURE_WHATSAPP',
  EMAIL_NOTIFICATIONS: 'REACT_APP_FEATURE_EMAIL',
  SMS_NOTIFICATIONS: 'REACT_APP_FEATURE_SMS',
  SOCIAL_LOGIN: 'REACT_APP_FEATURE_SOCIAL_LOGIN'
};

// Configuración por defecto (features básicas habilitadas)
const DEFAULT_FEATURES = {
  RESERVATIONS: true,
  MENU: true,
  TABLES: true,
  POLICIES: false,
  MIRROR: true,
  ANALYTICS: false,
  LOYALTY: false,
  DELIVERY: false,
  CUSTOM_BRANDING: false,
  INVENTORY: false,
  REPORTS: false,
  WHATSAPP: false,
  EMAIL_NOTIFICATIONS: false,
  SMS_NOTIFICATIONS: false,
  SOCIAL_LOGIN: false
};

/**
 * Obtiene la configuración de features para el restaurante actual
 * @returns {Object} Objeto con las features habilitadas/deshabilitadas
 */
export const getFeatureConfig = () => {
  const config = {};
  
  Object.keys(AVAILABLE_FEATURES).forEach(featureKey => {
    const envVar = AVAILABLE_FEATURES[featureKey];
    const envValue = process.env[envVar];
    
    // Si la variable de entorno está definida, usa su valor
    // Si no, usa el valor por defecto
    if (envValue !== undefined) {
      config[featureKey] = envValue === 'true';
    } else {
      config[featureKey] = DEFAULT_FEATURES[featureKey];
    }
  });
  
  return config;
};

/**
 * Verifica si una feature específica está habilitada
 * @param {string} featureName - Nombre de la feature
 * @returns {boolean} True si está habilitada
 */
export const isFeatureEnabled = (featureName) => {
  const config = getFeatureConfig();
  return config[featureName] || false;
};

/**
 * Hook personalizado para usar features en componentes React
 * @returns {Object} Objeto con features y función helper
 */
export const useFeatures = () => {
  const features = getFeatureConfig();
  
  return {
    features,
    isEnabled: (featureName) => features[featureName] || false,
    hasFeature: (featureName) => features[featureName] === true
  };
};

/**
 * Obtiene las features habilitadas como array
 * @returns {Array} Array con nombres de features habilitadas
 */
export const getEnabledFeatures = () => {
  const config = getFeatureConfig();
  return Object.keys(config).filter(key => config[key]);
};

/**
 * Configuración de API dinámica
 */
export const getApiConfig = () => {
  // Usar Railway variables o fallback para desarrollo
  const baseUrl = process.env.RAILWAY_STATIC_URL || 
                  process.env.REACT_APP_API_URL || 
                  'http://localhost:3002/api';
  
  return {
    BASE_URL: baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`,
    TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000,
    RETRY_ATTEMPTS: parseInt(process.env.REACT_APP_API_RETRY_ATTEMPTS) || 3
  };
};

/**
 * Configuración de branding personalizado
 */
export const getBrandingConfig = () => {
  return {
    RESTAURANT_NAME: process.env.REACT_APP_RESTAURANT_NAME || 'GastroBot',
    PRIMARY_COLOR: process.env.REACT_APP_PRIMARY_COLOR || '#1976d2',
    SECONDARY_COLOR: process.env.REACT_APP_SECONDARY_COLOR || '#dc004e',
    LOGO_URL: process.env.REACT_APP_LOGO_URL || null,
    FAVICON_URL: process.env.REACT_APP_FAVICON_URL || null,
    CUSTOM_CSS: process.env.REACT_APP_CUSTOM_CSS || null
  };
};

/**
 * Log de configuración para debugging
 */
export const logFeatureConfig = () => {
  if (process.env.NODE_ENV === 'development') {
    console.group('🏪 GastroBot Feature Configuration');
    console.log('📊 Features:', getFeatureConfig());
    console.log('🌐 API Config:', getApiConfig());
    console.log('🎨 Branding:', getBrandingConfig());
    console.log('✅ Enabled Features:', getEnabledFeatures());
    console.groupEnd();
  }
};

export default {
  getFeatureConfig,
  isFeatureEnabled,
  useFeatures,
  getEnabledFeatures,
  getApiConfig,
  getBrandingConfig,
  logFeatureConfig,
  AVAILABLE_FEATURES,
  DEFAULT_FEATURES
};