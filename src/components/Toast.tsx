import React, { useEffect, useState } from 'react';
import { X, Check, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  isVisible,
  onClose,
  duration = 3000
}) => {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isVisible && duration > 0) {
      timer = setTimeout(() => {
        setIsLeaving(true);
        setTimeout(() => {
          onClose();
          setIsLeaving(false);
        }, 300); // Match this to the CSS animation duration
      }, duration);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;
  
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Check className="w-5 h-5 text-white" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-white" />;
      case 'info':
        return <Info className="w-5 h-5 text-white" />;
      default:
        return <Check className="w-5 h-5 text-white" />;
    }
  };
  
  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return 'bg-green-600';
      case 'error': return 'bg-red-600';
      case 'info': return 'bg-blue-600';
      default: return 'bg-green-600';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success': return 'border-green-400';
      case 'error': return 'border-red-400';
      case 'info': return 'border-blue-400';
      default: return 'border-green-400';
    }
  };

  const animationClass = isLeaving ? 'animate-fade-out-up' : 'animate-fade-in-down';

  return (
    <div className={`fixed top-4 right-4 z-50 ${animationClass}`}>
      <div className={`${getBackgroundColor()} text-white p-4 rounded-lg shadow-lg flex items-center min-w-[300px] max-w-md border-l-4 ${getBorderColor()}`}>
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className="flex-grow mr-2 font-medium">
          {message}
        </div>
        <button 
          onClick={() => {
            setIsLeaving(true);
            setTimeout(() => {
              onClose();
              setIsLeaving(false);
            }, 300);
          }}
          className="flex-shrink-0 text-white hover:text-gray-200 focus:outline-none transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Toast;