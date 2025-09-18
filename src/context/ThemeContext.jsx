/**
 * @fileoverview Contexto de Temas para GastroBot Dashboard
 * Maneja el sistema de colores dinámico y modo claro/oscuro
 */

import React, { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Definición de temas disponibles
export const THEME_COLORS = {
  blue: {
    id: 'blue',
    name: 'Azul Profesional',
    description: 'Tema clásico y profesional',
    primary: '#2563eb',
    primaryLight: '#3b82f6',
    primaryDark: '#1d4ed8',
    gradient: 'from-blue-500 to-blue-700',
    preview: 'bg-gradient-to-br from-blue-500 to-blue-700'
  },
  emerald: {
    id: 'emerald',
    name: 'Verde Natura',
    description: 'Fresco y natural',
    primary: '#059669',
    primaryLight: '#10b981',
    primaryDark: '#047857',
    gradient: 'from-emerald-500 to-emerald-700',
    preview: 'bg-gradient-to-br from-emerald-500 to-emerald-700'
  },
  violet: {
    id: 'violet',
    name: 'Violeta Elegante',
    description: 'Moderno y sofisticado',
    primary: '#7c3aed',
    primaryLight: '#8b5cf6',
    primaryDark: '#6d28d9',
    gradient: 'from-violet-500 to-violet-700',
    preview: 'bg-gradient-to-br from-violet-500 to-violet-700'
  },
  rose: {
    id: 'rose',
    name: 'Rosa Moderno',
    description: 'Cálido y acogedor',
    primary: '#e11d48',
    primaryLight: '#f43f5e',
    primaryDark: '#be123c',
    gradient: 'from-rose-500 to-rose-700',
    preview: 'bg-gradient-to-br from-rose-500 to-rose-700'
  },
  orange: {
    id: 'orange',
    name: 'Naranja Energético',
    description: 'Vibrante y dinámico',
    primary: '#ea580c',
    primaryLight: '#f97316',
    primaryDark: '#c2410c',
    gradient: 'from-orange-500 to-orange-700',
    preview: 'bg-gradient-to-br from-orange-500 to-orange-700'
  },
  cyan: {
    id: 'cyan',
    name: 'Cyan Cristalino',
    description: 'Fresco y tecnológico',
    primary: '#0891b2',
    primaryLight: '#06b6d4',
    primaryDark: '#0e7490',
    gradient: 'from-cyan-500 to-cyan-700',
    preview: 'bg-gradient-to-br from-cyan-500 to-cyan-700'
  }
};

// Configuración inicial del tema
const DEFAULT_THEME = {
  colorScheme: 'blue', // Tema de color por defecto
  mode: 'light', // 'light' o 'dark'
  glassmorphism: true, // Activar efectos glassmorphism
  animations: true, // Activar animaciones
  reducedMotion: false // Respetar preferencia de movimiento reducido
};

// Crear el contexto
const ThemeContext = createContext(undefined);

/**
 * Provider del contexto de temas
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useLocalStorage('gastrobot-theme', DEFAULT_THEME);

  // Detectar preferencia de modo oscuro del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (theme.mode === 'auto') {
        applyThemeToDOM({ ...theme, mode: e.matches ? 'dark' : 'light' });
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Detectar preferencia de movimiento reducido
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e) => {
      setTheme(prev => ({ ...prev, reducedMotion: e.matches }));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [setTheme]);

  // Aplicar tema al DOM cuando cambie
  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  /**
   * Aplicar variables CSS del tema al DOM
   */
  const applyThemeToDOM = (currentTheme) => {
    const root = document.documentElement;
    const colorConfig = THEME_COLORS[currentTheme.colorScheme];

    if (!colorConfig) return;

    // Aplicar colores del tema
    root.style.setProperty('--color-theme-primary', colorConfig.primary);
    root.style.setProperty('--color-theme-primary-light', colorConfig.primaryLight);
    root.style.setProperty('--color-theme-primary-dark', colorConfig.primaryDark);

    // Aplicar modo (claro/oscuro)
    const isDark = currentTheme.mode === 'dark' ||
      (currentTheme.mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    root.setAttribute('data-theme', currentTheme.colorScheme);
    root.setAttribute('data-mode', isDark ? 'dark' : 'light');
    root.setAttribute('data-glassmorphism', currentTheme.glassmorphism ? 'enabled' : 'disabled');
    root.setAttribute('data-animations', currentTheme.animations ? 'enabled' : 'disabled');

    // Aplicar clases dinámicas
    document.body.className = document.body.className
      .replace(/theme-\w+/g, '')
      .replace(/mode-\w+/g, '') +
      ` theme-${currentTheme.colorScheme} mode-${isDark ? 'dark' : 'light'}`;

    // Notificar cambio de tema a otros componentes
    window.dispatchEvent(new CustomEvent('theme-changed', {
      detail: { theme: currentTheme, isDark }
    }));
  };

  /**
   * Cambiar esquema de colores
   */
  const setColorScheme = (colorScheme) => {
    setTheme(prev => ({ ...prev, colorScheme }));
  };

  /**
   * Cambiar modo (claro/oscuro/auto)
   */
  const setMode = (mode) => {
    setTheme(prev => ({ ...prev, mode }));
  };

  /**
   * Toggle entre modo claro y oscuro
   */
  const toggleMode = () => {
    setTheme(prev => ({
      ...prev,
      mode: prev.mode === 'light' ? 'dark' : 'light'
    }));
  };

  /**
   * Activar/desactivar efectos glassmorphism
   */
  const toggleGlassmorphism = () => {
    setTheme(prev => ({ ...prev, glassmorphism: !prev.glassmorphism }));
  };

  /**
   * Activar/desactivar animaciones
   */
  const toggleAnimations = () => {
    setTheme(prev => ({ ...prev, animations: !prev.animations }));
  };

  /**
   * Resetear tema a valores por defecto
   */
  const resetTheme = () => {
    setTheme(DEFAULT_THEME);
  };

  /**
   * Obtener configuración del tema actual
   */
  const getCurrentThemeConfig = () => {
    return THEME_COLORS[theme.colorScheme];
  };

  /**
   * Verificar si el modo actual es oscuro
   */
  const isDarkMode = () => {
    return theme.mode === 'dark' ||
      (theme.mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  };

  // Valor del contexto
  const contextValue = {
    // Estado actual
    theme,
    currentThemeConfig: getCurrentThemeConfig(),
    isDark: isDarkMode(),

    // Temas disponibles
    availableThemes: Object.values(THEME_COLORS),

    // Funciones de control
    setColorScheme,
    setMode,
    toggleMode,
    toggleGlassmorphism,
    toggleAnimations,
    resetTheme,

    // Utilities
    getCurrentThemeConfig,
    isDarkMode
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook para usar el contexto de temas
 */
export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }

  return context;
}

export default ThemeContext;