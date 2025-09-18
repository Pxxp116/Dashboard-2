import React from 'react';
import { cn } from '../../utils/cn';

const Badge = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'default',
  icon: Icon,
  className,
  ...props
}, ref) => {
  const baseClasses = 'badge';

  const variantClasses = {
    primary: 'badge-primary',
    secondary: 'badge-gray',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'badge-info',
    gray: 'badge-gray',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    default: '',
    lg: 'text-sm px-3 py-1',
  };

  const classes = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  return (
    <span ref={ref} className={classes} {...props}>
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

// Estados específicos para pedidos
export const OrderStatusBadge = ({ status, className, ...props }) => {
  const statusConfig = {
    pendiente: {
      variant: 'warning',
      label: 'Pendiente',
    },
    en_preparacion: {
      variant: 'info',
      label: 'En Preparación',
    },
    entregado: {
      variant: 'success',
      label: 'Entregado',
    },
    cancelado: {
      variant: 'error',
      label: 'Cancelado',
    },
  };

  const config = statusConfig[status] || statusConfig.pendiente;

  return (
    <Badge
      variant={config.variant}
      className={className}
      {...props}
    >
      {config.label}
    </Badge>
  );
};

// Estados específicos para reservas
export const ReservationStatusBadge = ({ status, className, ...props }) => {
  const statusConfig = {
    confirmada: {
      variant: 'success',
      label: 'Confirmada',
    },
    pendiente: {
      variant: 'warning',
      label: 'Pendiente',
    },
    cancelada: {
      variant: 'error',
      label: 'Cancelada',
    },
    no_show: {
      variant: 'error',
      label: 'No Show',
    },
  };

  const config = statusConfig[status] || statusConfig.pendiente;

  return (
    <Badge
      variant={config.variant}
      className={className}
      {...props}
    >
      {config.label}
    </Badge>
  );
};

export default Badge;