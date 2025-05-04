import { v4 as uuidv4 } from 'uuid';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  timestamp: number;
  persistent?: boolean;
}

class ToastService {
  private static instance: ToastService;
  private toasts: ToastMessage[] = [];
  private subscribers: ((toasts: ToastMessage[]) => void)[] = [];

  private constructor() {
    // Load persisted toasts from localStorage
    const persistedToasts = localStorage.getItem('app_toasts');
    if (persistedToasts) {
      try {
        this.toasts = JSON.parse(persistedToasts)
          .filter((toast: ToastMessage) => 
            toast.persistent || 
            (Date.now() - toast.timestamp) < (toast.duration || 5000)
          );
      } catch (error) {
        console.error('Failed to parse persisted toasts', error);
      }
    }
  }

  public static getInstance(): ToastService {
    if (!ToastService.instance) {
      ToastService.instance = new ToastService();
    }
    return ToastService.instance;
  }

  private notifySubscribers() {
    this.subscribers.forEach(subscriber => subscriber(this.toasts));
    this.persistToasts();
  }

  private persistToasts() {
    localStorage.setItem('app_toasts', JSON.stringify(this.toasts));
  }

  public addToast(
    message: string, 
    type: ToastType = 'info', 
    options: { 
      duration?: number; 
      persistent?: boolean; 
    } = {}
  ): string {
    const id = uuidv4();
    const toast: ToastMessage = {
      id,
      message,
      type,
      duration: options.duration || 5000,
      timestamp: Date.now(),
      persistent: options.persistent || false
    };

    this.toasts.push(toast);
    this.notifySubscribers();

    return id;
  }

  public dismissToast(id: string) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notifySubscribers();
  }

  public clearToasts() {
    this.toasts = [];
    this.notifySubscribers();
  }

  public subscribeToToasts(callback: (toasts: ToastMessage[]) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }
}

export const toastService = ToastService.getInstance();
