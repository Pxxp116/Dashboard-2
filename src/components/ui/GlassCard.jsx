/**
 * @fileoverview Componente GlassCard reutilizable con efectos glassmorphism
 * Diseñado para mostrar métricas y datos con estilo moderno y elegante
 */

import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

/**
 * Componente GlassCard con efectos glassmorphism avanzados
 * @param {Object} props - Props del componente
 * @param {string} props.title - Título de la tarjeta
 * @param {string|number} props.value - Valor principal a mostrar
 * @param {string} props.subtitle - Subtítulo o descripción
 * @param {React.ComponentType} props.icon - Icono de Lucide React
 * @param {string} props.variant - Variante del diseño: 'default', 'stats', 'metric', 'floating'
 * @param {string} props.size - Tamaño: 'sm', 'md', 'lg'
 * @param {boolean} props.gradient - Si usar gradiente temático de fondo
 * @param {boolean} props.hover - Habilitar efectos hover
 * @param {string} props.trend - Tendencia: 'up', 'down', 'neutral'
 * @param {string} props.trendValue - Valor de la tendencia (ej: "+5%")
 * @param {boolean} props.loading - Estado de carga
 * @param {boolean} props.showProgress - Mostrar barra de progreso
 * @param {number} props.progressValue - Valor del progreso (0-100)
 * @param {function} props.onClick - Función onClick opcional
 * @param {string} props.className - Clases CSS adicionales
 * @returns {JSX.Element} Componente GlassCard
 */
function GlassCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  size = 'md',
  gradient = false,
  hover = true,
  trend,
  trendValue,
  loading = false,
  showProgress = false,
  progressValue = 0,
  onClick,
  className,
  children,
  ...props
}) {
  const { currentThemeConfig, isDark } = useTheme();

  // Clases base según la variante
  const variantClasses = {
    default: 'glass-card p-6',
    stats: 'glass-card p-6 stats-card',
    metric: 'glass-card p-5 border border-white/30',
    floating: 'glass-card-lg p-6 animate-float'
  };

  // Clases de tamaño
  const sizeClasses = {
    sm: 'p-4 min-h-[120px]',
    md: 'p-6 min-h-[140px]',
    lg: 'p-8 min-h-[160px]'
  };

  // Clases de hover
  const hoverClasses = hover ? {
    default: 'glass-card-hover cursor-pointer',
    stats: 'hover:scale-105 hover:shadow-glass-xl hover:bg-white/20 transition-all duration-300',
    metric: 'hover:scale-[1.02] hover:border-white/50 hover:shadow-floating-lg transition-all duration-300',
    floating: 'hover:scale-105 hover:animate-pulse-slow transition-all duration-500'
  } : {};

  // Clases de tendencia
  const trendClasses = {
    up: 'text-emerald-600',
    down: 'text-red-500',
    neutral: 'text-slate-500'
  };

  // Íconos de tendencia
  const TrendIcon = ({ trend }) => {
    if (trend === 'up') return <span className="text-emerald-500">↗</span>;
    if (trend === 'down') return <span className="text-red-500">↘</span>;
    return <span className="text-slate-400">→</span>;
  };

  // Componente de skeleton loading
  if (loading) {
    return (
      <div className={cn(
        variantClasses[variant],
        sizeClasses[size],
        'animate-pulse',
        className
      )}>
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-white/20 rounded w-24"></div>
          <div className="w-8 h-8 bg-white/20 rounded-lg"></div>
        </div>
        <div className="h-8 bg-white/20 rounded w-16 mb-2"></div>
        <div className="h-3 bg-white/20 rounded w-32"></div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        variantClasses[variant],
        sizeClasses[size],
        hover && hoverClasses[variant],
        gradient && 'relative overflow-hidden',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {/* Gradiente de fondo opcional */}
      {gradient && (
        <div
          className="absolute inset-0 opacity-10 rounded-2xl"
          style={{
            background: currentThemeConfig?.gradient || 'linear-gradient(135deg, #93c5fd 0%, #2563eb 100%)'
          }}
        />
      )}

      {/* Contenido principal */}
      <div className="relative z-10">
        {/* Header con título e icono */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-600 font-poppins">
            {title}
          </h3>
          {Icon && (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                background: currentThemeConfig?.gradient || 'linear-gradient(135deg, #93c5fd 0%, #2563eb 100%)'
              }}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        {/* Valor principal */}
        <div className="mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 font-poppins">
              {value}
            </span>
            {trend && trendValue && (
              <div className={cn(
                'flex items-center gap-1 text-sm font-medium',
                trendClasses[trend]
              )}>
                <TrendIcon trend={trend} />
                <span>{trendValue}</span>
              </div>
            )}
          </div>
        </div>

        {/* Subtítulo */}
        {subtitle && (
          <p className="text-sm text-slate-500 font-medium mb-3">
            {subtitle}
          </p>
        )}

        {/* Barra de progreso opcional */}
        {showProgress && (
          <div className="w-full bg-white/20 rounded-full h-2 mb-3">
            <div
              className="h-2 rounded-full transition-all duration-500 shadow-sm"
              style={{
                width: `${Math.min(100, Math.max(0, progressValue))}%`,
                background: currentThemeConfig?.gradient || 'linear-gradient(135deg, #93c5fd 0%, #2563eb 100%)'
              }}
            />
          </div>
        )}

        {/* Contenido hijo personalizado */}
        {children && (
          <div className="mt-4">
            {children}
          </div>
        )}
      </div>

      {/* Efecto de brillo hover adicional */}
      {hover && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
      )}
    </div>
  );
}

/**
 * Variante específica para métricas numéricas
 */
export function GlassMetricCard(props) {
  return <GlassCard variant="metric" {...props} />;
}

/**
 * Variante específica para estadísticas
 */
export function GlassStatsCard(props) {
  return <GlassCard variant="stats" hover showProgress {...props} />;
}

/**
 * Variante flotante con animación
 */
export function GlassFloatingCard(props) {
  return <GlassCard variant="floating" gradient {...props} />;
}

export default GlassCard;