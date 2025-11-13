export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
  icon?: string;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
  duration?: number;
  dismissible?: boolean;
  position?: ToastPosition;
}

export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
