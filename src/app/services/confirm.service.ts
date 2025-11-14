import { Injectable, signal } from '@angular/core';
import { ConfirmDialog, ConfirmType, ConfirmConfig } from '../models/confirm.model';

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  private dialogs = signal<ConfirmDialog[]>([]);
  private idCounter = 0;

  /**
   * Get all active confirmation dialogs
   */
  getDialogs = this.dialogs.asReadonly();

  /**
   * Show a confirmation dialog and return a Promise
   */
  confirm(
    title: string,
    message: string,
    config?: ConfirmConfig
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const id = this.generateId();
      const dialog: ConfirmDialog = {
        id,
        title,
        message,
        confirmText: config?.confirmText ?? 'Potwierdź',
        cancelText: config?.cancelText ?? 'Anuluj',
        type: config?.type ?? 'info',
        icon: this.getIconForType(config?.type ?? 'info'),
        onConfirm: () => {
          this.dismiss(id);
          resolve(true);
        },
        onCancel: () => {
          this.dismiss(id);
          resolve(false);
        }
      };

      this.dialogs.update(dialogs => [...dialogs, dialog]);
    });
  }

  /**
   * Show a danger confirmation dialog
   */
  confirmDanger(
    title: string,
    message: string,
    confirmText: string = 'Usuń',
    cancelText: string = 'Anuluj'
  ): Promise<boolean> {
    return this.confirm(title, message, {
      confirmText,
      cancelText,
      type: 'danger'
    });
  }

  /**
   * Show a warning confirmation dialog
   */
  confirmWarning(
    title: string,
    message: string,
    confirmText: string = 'Kontynuuj',
    cancelText: string = 'Anuluj'
  ): Promise<boolean> {
    return this.confirm(title, message, {
      confirmText,
      cancelText,
      type: 'warning'
    });
  }

  /**
   * Dismiss a specific dialog
   */
  dismiss(id: string): void {
    this.dialogs.update(dialogs => dialogs.filter(dialog => dialog.id !== id));
  }

  /**
   * Dismiss all dialogs
   */
  dismissAll(): void {
    this.dialogs.set([]);
  }

  /**
   * Generate unique ID for dialog
   */
  private generateId(): string {
    return `confirm-${Date.now()}-${this.idCounter++}`;
  }

  /**
   * Get icon name based on dialog type
   */
  private getIconForType(type: ConfirmType): string {
    const icons: Record<ConfirmType, string> = {
      danger: 'lucideTriangleAlert',
      warning: 'lucideCircleAlert',
      info: 'lucideInfo',
      success: 'lucideCircleCheck'
    };
    return icons[type];
  }
}
