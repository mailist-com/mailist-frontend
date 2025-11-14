import { Injectable, signal } from '@angular/core';
import { Toast, ToastType, ToastConfig } from '../models/toast.model';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts = signal<Toast[]>([]);
  private defaultDuration = 5000; // 5 seconds
  private idCounter = 0;

  /**
   * Get all active toasts
   */
  getToasts = this.toasts.asReadonly();

  /**
   * Show a toast notification
   */
  show(message: string, type: ToastType = 'info', title?: string, config?: ToastConfig): string {
    const id = this.generateId();
    const toast: Toast = {
      id,
      type,
      title,
      message,
      duration: config?.duration ?? this.defaultDuration,
      dismissible: config?.dismissible ?? true,
      icon: this.getIconForType(type)
    };

    this.toasts.update(toasts => [...toasts, toast]);

    // Auto dismiss if duration is set
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, toast.duration);
    }

    return id;
  }

  /**
   * Show success toast
   */
  success(message: string, title?: string, config?: ToastConfig): string {
    return this.show(message, 'success', title, config);
  }

  /**
   * Show error toast
   */
  error(message: string, title?: string, config?: ToastConfig): string {
    return this.show(message, 'error', title, config);
  }

  /**
   * Show warning toast
   */
  warning(message: string, title?: string, config?: ToastConfig): string {
    return this.show(message, 'warning', title, config);
  }

  /**
   * Show info toast
   */
  info(message: string, title?: string, config?: ToastConfig): string {
    return this.show(message, 'info', title, config);
  }

  /**
   * Dismiss a specific toast
   */
  dismiss(id: string): void {
    this.toasts.update(toasts => toasts.filter(toast => toast.id !== id));
  }

  /**
   * Dismiss all toasts
   */
  dismissAll(): void {
    this.toasts.set([]);
  }

  /**
   * Generate unique ID for toast
   */
  private generateId(): string {
    return `toast-${Date.now()}-${this.idCounter++}`;
  }

  /**
   * Get icon name based on toast type
   */
  private getIconForType(type: ToastType): string {
    const icons: Record<ToastType, string> = {
      success: 'lucideCheckCircle',
      error: 'lucideXCircle',
      warning: 'lucideAlertTriangle',
      info: 'lucideInfo'
    };
    return icons[type];
  }
}
