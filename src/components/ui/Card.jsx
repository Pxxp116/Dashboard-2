import React from 'react';
import { cn } from '../../utils/cn';

const Card = React.forwardRef(({
  children,
  className,
  variant = 'default',
  padding = 'default',
  hover = true,
  glass = true,
  ...props
}, ref) => {
  const baseClasses = glass ? 'card-glass' : 'card';

  const variantClasses = {
    default: '',
    compact: 'card-compact',
    elevated: glass ? 'glass-hover-lift' : 'shadow-lg',
    floating: glass ? 'animate-glass-float' : '',
    glow: glass ? 'glass-hover-glow' : '',
  };

  const classes = cn(
    baseClasses,
    variantClasses[variant],
    hover && (glass ? 'glass-hover-lift' : 'transition-all hover:shadow-md hover:border-gray-300'),
    className
  );

  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  );
});

Card.displayName = 'Card';

const CardHeader = React.forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn('card-header', className)}
      {...props}
    >
      {children}
    </div>
  );
});

CardHeader.displayName = 'CardHeader';

const CardBody = React.forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn('card-body', className)}
      {...props}
    >
      {children}
    </div>
  );
});

CardBody.displayName = 'CardBody';

const CardFooter = React.forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn('card-footer', className)}
      {...props}
    >
      {children}
    </div>
  );
});

CardFooter.displayName = 'CardFooter';

const CardTitle = React.forwardRef(({
  children,
  className,
  as: Component = 'h3',
  ...props
}, ref) => {
  return (
    <Component
      ref={ref}
      className={cn('text-lg font-semibold text-gray-900', className)}
      {...props}
    >
      {children}
    </Component>
  );
});

CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <p
      ref={ref}
      className={cn('text-sm text-gray-600 mt-1', className)}
      {...props}
    >
      {children}
    </p>
  );
});

CardDescription.displayName = 'CardDescription';

export { Card, CardHeader, CardBody, CardFooter, CardTitle, CardDescription };