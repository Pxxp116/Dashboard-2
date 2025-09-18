import React from 'react';
import { cn } from '../../utils/cn';

const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'default',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  className,
  onClick,
  type = 'button',
  ...props
}, ref) => {
  const baseClasses = 'btn';

  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    success: 'btn-success',
    danger: 'btn-danger',
  };

  const sizeClasses = {
    sm: 'btn-sm',
    default: '',
    lg: 'btn-lg',
    icon: 'btn-icon',
  };

  const classes = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    disabled && 'opacity-50 cursor-not-allowed',
    className
  );

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  const LoadingSpinner = () => (
    <svg
      className="animate-spin w-4 h-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {!loading && Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
      {size !== 'icon' && children}
      {!loading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;