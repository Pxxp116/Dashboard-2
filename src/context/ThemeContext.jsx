/**
 * @fileoverview Contexto de Temas para GastroBot Dashboard
 * Maneja el sistema de colores dinámico y modo claro/oscuro
 */

import React, { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Definición de temas glassmorphism disponibles (3 temas principales)
export const THEME_COLORS = {
  blue: {
    id: 'blue',
    name: 'Azul Océano',
    description: 'Profesional y confiable como el océano',
    primary: '#3b82f6',
    primaryLight: '#93c5fd',
    primaryDark: '#2563eb',
    gradient: 'linear-gradient(135deg, #93c5fd 0%, #2563eb 100%)',
    gradientClass: 'bg-gradient-to-br from-blue-300 to-blue-600',
    preview: 'theme-preview blue',
    glassBg: 'rgba(59, 130, 246, 0.1)',
    glassBorder: 'rgba(59, 130, 246, 0.2)'
  },
  violet: {
    id: 'violet',
    name: 'Violeta Místico',
    description: 'Elegante y sofisticado',
    primary: '#8b5cf6',
    primaryLight: '#a78bfa',
    primaryDark: '#6366f1',
    gradient: 'linear-gradient(135deg, #a78bfa 0%, #6366f1 100%)',
    gradientClass: 'bg-gradient-to-br from-violet-300 to-indigo-500',
    preview: 'theme-preview violet',
    glassBg: 'rgba(139, 92, 246, 0.1)',
    glassBorder: 'rgba(139, 92, 246, 0.2)'
  },
  emerald: {
    id: 'emerald',
    name: 'Verde Natura',
    description: 'Fresco y natural como un bosque',
    primary: '#10b981',
    primaryLight: '#6ee7b7',
    primaryDark: '#16a34a',
    gradient: 'linear-gradient(135deg, #6ee7b7 0%, #16a34a 100%)',
    gradientClass: 'bg-gradient-to-br from-emerald-300 to-green-600',
    preview: 'theme-preview emerald',
    glassBg: 'rgba(16, 185, 129, 0.1)',
    glassBorder: 'rgba(16, 185, 129, 0.2)'
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
   * Aplicar variables CSS del tema al DOM para glassmorphism
   */
  const applyThemeToDOM = (currentTheme) => {
    const root = document.documentElement;
    const colorConfig = THEME_COLORS[currentTheme.colorScheme];

    if (!colorConfig) return;

    // Aplicar colores del tema como CSS Custom Properties
    root.style.setProperty('--theme-primary', colorConfig.primary);
    root.style.setProperty('--theme-primary-light', colorConfig.primaryLight);
    root.style.setProperty('--theme-primary-dark', colorConfig.primaryDark);
    root.style.setProperty('--theme-gradient', colorConfig.gradient);
    root.style.setProperty('--theme-glass-bg', colorConfig.glassBg);
    root.style.setProperty('--theme-glass-border', colorConfig.glassBorder);

    // Aplicar modo (claro/oscuro)
    const isDark = currentTheme.mode === 'dark' ||
      (currentTheme.mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Aplicar data attributes para CSS targeting
    root.setAttribute('data-theme', currentTheme.colorScheme);
    root.setAttribute('data-mode', isDark ? 'dark' : 'light');
    root.setAttribute('data-glassmorphism', currentTheme.glassmorphism ? 'enabled' : 'disabled');
    root.setAttribute('data-animations', currentTheme.animations ? 'enabled' : 'disabled');

    // Aplicar clases dinámicas al body
    const baseClasses = document.body.className
      .split(' ')
      .filter(cls => !cls.startsWith('theme-') && !cls.startsWith('mode-'))
      .join(' ');

    document.body.className = `${baseClasses} theme-${currentTheme.colorScheme} mode-${isDark ? 'dark' : 'light'}`.trim();

    // Guardar configuración en localStorage con formato actualizado
    try {
      localStorage.setItem('gastrobot-theme-config', JSON.stringify({
        ...currentTheme,
        appliedAt: new Date().toISOString()
      }));
    } catch (error) {
      console.warn('No se pudo guardar la configuración del tema:', error);
    }

    // Notificar cambio de tema a otros componentes
    window.dispatchEvent(new CustomEvent('theme-changed', {
      detail: {
        theme: currentTheme,
        colorConfig,
        isDark,
        timestamp: Date.now()
      }
    }));

    // Debug info en development
    if (process.env.NODE_ENV === 'development') {
      console.log('🎨 Tema aplicado:', {
        colorScheme: currentTheme.colorScheme,
        name: colorConfig.name,
        isDark,
        glassmorphism: currentTheme.glassmorphism,
        animations: currentTheme.animations
      });
    }
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