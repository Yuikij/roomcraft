import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  icon: Icon, 
  children, 
  type = 'default',
  size = 'md' 
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  const typeClasses = {
    default: 'text-primary-600',
    danger: 'text-red-600',
    warning: 'text-yellow-600',
    success: 'text-green-600'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* 模态框内容 */}
      <div className={`relative glass-effect rounded-3xl shadow-floating animate-scale-in w-full ${sizeClasses[size]}`}>
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className={`w-10 h-10 rounded-2xl bg-current/10 flex items-center justify-center ${typeClasses[type]}`}>
                <Icon className="w-5 h-5" />
              </div>
            )}
            <h2 className="text-xl font-semibold text-neutral-800">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/50 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-600" />
          </button>
        </div>
        
        {/* 内容 */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal; 