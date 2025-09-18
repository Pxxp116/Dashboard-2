import React from 'react';
import { cn } from '../../utils/cn';

const Input = React.forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  iconPosition = 'left',
  className,
  ...props
}, ref) => {
  const inputClasses = cn(
    'form-input',
    error && 'error',
    Icon && iconPosition === 'left' && 'pl-10',
    Icon && iconPosition === 'right' && 'pr-10',
    className
  );

  return (
    <div className="form-group">
      {label && (
        <label className="form-label">
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-gray-400" />
          </div>
        )}

        <input
          ref={ref}
          className={inputClasses}
          {...props}
        />

        {Icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-gray-400" />
          </div>
        )}
      </div>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      {helperText && !error && (
        <div className="text-xs text-gray-500 mt-1">
          {helperText}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;