
import { Toast } from './Toast';
import { useToast } from './use-toast';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message || ''}
          type={toast.type || 'info'}
          duration={toast.duration || 5000}
          persistent={toast.persistent || false}
          onDismiss={() => dismiss(toast.id)}
        >
          <div className="grid gap-1">
            {toast.title && <div className="font-medium">{toast.title}</div>}
            {toast.description && <div className="text-sm opacity-90">{toast.description}</div>}
          </div>
          {toast.action}
        </Toast>
      ))}
    </div>
  );
}
