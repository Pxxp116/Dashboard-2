/**
 * @fileoverview Componente ThemeSwitcher para GastroBot Dashboard
 * Permite cambiar entre diferentes temas de color y modo claro/oscuro
 */

import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  Palette,
  Sun,
  Moon,
  Monitor,
  Sparkles,
  Settings,
  Eye,
  EyeOff,
  RotateCcw,
  Check
} from 'lucide-react';

/**
 * Componente principal del selector de temas
 */
export function ThemeSwitcher({ trigger = 'button', className = '' }) {
  const {
    theme,
    currentThemeConfig,
    isDark,
    availableThemes,
    setColorScheme,
    setMode,
    toggleMode,
    toggleGlassmorphism,
    toggleAnimations,
    resetTheme
  } = useTheme();

  const [isOpen, setIsOpen] = useState(false);

  const modeOptions = [
    { value: 'light', icon: Sun, label: 'Claro' },
    { value: 'dark', icon: Moon, label: 'Oscuro' },
    { value: 'auto', icon: Monitor, label: 'Auto' }
  ];

  const handleThemeChange = (colorScheme) => {
    setColorScheme(colorScheme);
    // Opcional: cerrar el panel después de seleccionar
    // setIsOpen(false);
  };

  // Trigger como botón flotante
  if (trigger === 'floating') {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-white/80 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center group"
          aria-label="Abrir selector de temas"
        >
          <Palette className="w-6 h-6 text-gray-700 group-hover:text-current transition-colors" style={{ color: currentThemeConfig?.primary }} />
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <div className="absolute bottom-16 right-0 w-80">
              <ThemeSwitcherPanel
                onClose={() => setIsOpen(false)}
                theme={theme}
                currentThemeConfig={currentThemeConfig}
                isDark={isDark}
                availableThemes={availableThemes}
                modeOptions={modeOptions}
                onThemeChange={handleThemeChange}
                setMode={setMode}
                toggleGlassmorphism={toggleGlassmorphism}
                toggleAnimations={toggleAnimations}
                resetTheme={resetTheme}
              />
            </div>
          </>
        )}
      </div>
    );
  }

  // Trigger como botón en header
  if (trigger === 'button') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn btn-ghost btn-icon relative"
          aria-label="Selector de temas"
        >
          <Palette className="w-5 h-5" />
          {/* Indicador del tema actual */}
          <div
            className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
            style={{ backgroundColor: currentThemeConfig?.primary }}
          />
        </button>

        {isOpen && (
          <>
            {/* Backdrop para mobile */}
            <div
              className="fixed inset-0 bg-transparent z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel dropdown */}
            <div className="absolute top-full right-0 mt-2 w-80 z-50">
              <ThemeSwitcherPanel
                onClose={() => setIsOpen(false)}
                theme={theme}
                currentThemeConfig={currentThemeConfig}
                isDark={isDark}
                availableThemes={availableThemes}
                modeOptions={modeOptions}
                onThemeChange={handleThemeChange}
                setMode={setMode}
                toggleGlassmorphism={toggleGlassmorphism}
                toggleAnimations={toggleAnimations}
                resetTheme={resetTheme}
              />
            </div>
          </>
        )}
      </div>
    );
  }

  // Trigger inline (para settings page)
  return (
    <div className={`space-y-6 ${className}`}>
      <ThemeSwitcherPanel
        inline={true}
        theme={theme}
        currentThemeConfig={currentThemeConfig}
        isDark={isDark}
        availableThemes={availableThemes}
        modeOptions={modeOptions}
        onThemeChange={handleThemeChange}
        setMode={setMode}
        toggleGlassmorphism={toggleGlassmorphism}
        toggleAnimations={toggleAnimations}
        resetTheme={resetTheme}
      />
    </div>
  );
}

/**
 * Panel del selector de temas
 */
function ThemeSwitcherPanel({
  inline = false,
  onClose,
  theme,
  currentThemeConfig,
  isDark,
  availableThemes,
  modeOptions,
  onThemeChange,
  setMode,
  toggleGlassmorphism,
  toggleAnimations,
  resetTheme
}) {
  const panelClasses = inline
    ? 'space-y-6'
    : 'card-glass p-6 animate-scaleIn';

  return (
    <div className={panelClasses}>
      {!inline && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: currentThemeConfig?.primary + '20' }}
            >
              <Palette className="w-4 h-4" style={{ color: currentThemeConfig?.primary }} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Personalización</h3>
              <p className="text-xs text-gray-500">Temas y apariencia</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="btn btn-ghost btn-icon w-8 h-8"
            >
              ×
            </button>
          )}
        </div>
      )}

      {/* Selector de esquema de colores */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Esquema de Colores</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {availableThemes.map((themeOption) => (
            <button
              key={themeOption.id}
              onClick={() => onThemeChange(themeOption.id)}
              className={`relative group p-3 rounded-xl border-2 transition-all duration-200 ${
                theme.colorScheme === themeOption.id
                  ? 'border-current shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              style={{
                borderColor: theme.colorScheme === themeOption.id ? themeOption.primary : undefined
              }}
              title={themeOption.description}
            >
              {/* Preview del color */}
              <div
                className={`w-full h-8 rounded-lg mb-2 ${themeOption.preview}`}
              />

              {/* Nombre del tema */}
              <div className="text-xs font-medium text-gray-700 leading-tight">
                {themeOption.name}
              </div>

              {/* Indicador de selección */}
              {theme.colorScheme === themeOption.id && (
                <div
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                  style={{ backgroundColor: themeOption.primary }}
                >
                  <Check className="w-3 h-3" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Selector de modo */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sun className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Modo de Apariencia</span>
        </div>

        <div className="flex rounded-xl border border-gray-200 p-1 bg-gray-50">
          {modeOptions.map((mode) => {
            const Icon = mode.icon;
            const isActive = theme.mode === mode.value;

            return (
              <button
                key={mode.value}
                onClick={() => setMode(mode.value)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Opciones adicionales */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Efectos Visuales</span>
        </div>

        <div className="space-y-2">
          {/* Toggle Glassmorphism */}
          <button
            onClick={toggleGlassmorphism}
            className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-gray-600" />
              <div className="text-left">
                <div className="text-sm font-medium text-gray-700">Glassmorphism</div>
                <div className="text-xs text-gray-500">Efectos de cristal translúcido</div>
              </div>
            </div>
            <div
              className={`w-10 h-6 rounded-full border-2 transition-all duration-200 ${
                theme.glassmorphism
                  ? 'bg-current border-current'
                  : 'bg-gray-100 border-gray-300'
              }`}
              style={{
                backgroundColor: theme.glassmorphism ? currentThemeConfig?.primary : undefined,
                borderColor: theme.glassmorphism ? currentThemeConfig?.primary : undefined
              }}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                  theme.glassmorphism ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
          </button>

          {/* Toggle Animaciones */}
          <button
            onClick={toggleAnimations}
            className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center gap-3">
              {theme.animations ? (
                <Eye className="w-4 h-4 text-gray-600" />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-600" />
              )}
              <div className="text-left">
                <div className="text-sm font-medium text-gray-700">Animaciones</div>
                <div className="text-xs text-gray-500">Transiciones y micro-interacciones</div>
              </div>
            </div>
            <div
              className={`w-10 h-6 rounded-full border-2 transition-all duration-200 ${
                theme.animations
                  ? 'bg-current border-current'
                  : 'bg-gray-100 border-gray-300'
              }`}
              style={{
                backgroundColor: theme.animations ? currentThemeConfig?.primary : undefined,
                borderColor: theme.animations ? currentThemeConfig?.primary : undefined
              }}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                  theme.animations ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Reset */}
      {!inline && (
        <div className="pt-3 border-t border-gray-200">
          <button
            onClick={resetTheme}
            className="btn btn-ghost w-full justify-start text-gray-600 hover:text-gray-900"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Restaurar configuración
          </button>
        </div>
      )}
    </div>
  );
}

export default ThemeSwitcher;