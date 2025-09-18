import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from './Button';

const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'default',
  closeOnBackdrop = true,
  className,
}) => {
  const sizeClasses = {
    sm: 'max-w-md',
    default: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  // Cerrar con escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div
        className={cn(
          'bg-white rounded-2xl shadow-xl w-full animate-scaleIn',
          sizeClasses[size],
          className
        )}
      >
        {title && (
          <div className="card-header flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}

        {!title && (
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

const ModalHeader = ({ children, className, ...props }) => {
  return (
    <div
      className={cn('card-header', className)}
      {...props}
    >
      {children}
    </div>
  );
};

const ModalBody = ({ children, className, ...props }) => {
  return (
    <div
      className={cn('card-body max-h-96 overflow-y-auto', className)}
      {...props}
    >
      {children}
    </div>
  );
};

const ModalFooter = ({ children, className, ...props }) => {
  return (
    <div
      className={cn('card-footer flex items-center justify-end gap-3', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export { Modal, ModalHeader, ModalBody, ModalFooter };