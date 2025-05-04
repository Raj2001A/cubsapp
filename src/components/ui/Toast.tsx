import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  AlertTriangle, 
  X 
} from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
  persistent?: boolean;
  onDismiss?: () => void;
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'destructive';
}

const TOAST_ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle
};

const TOAST_COLORS = {
  success: 'bg-green-500 text-white',
  error: 'bg-red-500 text-white',
  info: 'bg-blue-500 text-white',
  warning: 'bg-yellow-500 text-black'
};

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(({
  id,
  message, 
  type = 'info', 
  duration = 5000, 
  persistent = false,
  onDismiss,
  children,
  className = '',
  variant = 'default',
  ...props
}, ref) => {
  const [isVisible, setIsVisible] = React.useState(true);
  const Icon = type ? TOAST_ICONS[type as keyof typeof TOAST_ICONS] : undefined;
  const colorClass = variant ? 
    TOAST_COLORS[variant as keyof typeof TOAST_COLORS] : 
    (type ? TOAST_COLORS[type as keyof typeof TOAST_COLORS] : 'bg-gray-100 text-gray-900');

  React.useEffect(() => {
    if (!persistent && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          onDismiss?.();
        }, 300);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss, persistent]);

  if (!isVisible) return null;

  return (
    <motion.div
      ref={ref}
      className={`flex items-center p-4 rounded-lg shadow-lg ${colorClass} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {Icon && <Icon className="mr-2 h-5 w-5" />}
      
      {children || (
        <div className="flex-1">
          {message}
        </div>
      )}
      
      <button 
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onDismiss?.(), 300);
        }}
        className="ml-auto p-1 hover:bg-black/10 rounded-full"
        aria-label="Close toast"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
});

export const ToastContainer: React.FC<{ 
  toasts: Array<ToastProps & { id: string }>;
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast 
            key={toast.id} 
            {...toast} 
            onDismiss={() => onDismiss(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
