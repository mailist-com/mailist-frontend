import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideTriangleAlert,
  lucideCircleAlert,
  lucideInfo,
  lucideCircleCheck,
  lucideX,
  lucideCheck,
  lucideTrash2
} from '@ng-icons/lucide';
import { ConfirmService } from '../../services/confirm.service';

@Component({
  selector: 'app-confirm-modal',
  imports: [CommonModule, NgIcon],
  providers: [provideIcons({
    lucideTriangleAlert,
    lucideCircleAlert,
    lucideInfo,
    lucideCircleCheck,
    lucideX,
    lucideCheck,
    lucideTrash2
  })],
  templateUrl: './confirm-modal.html',
  styles: [`
    @keyframes fade-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes slide-up {
      from {
        transform: translateY(16px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .animate-fade-in {
      animation: fade-in 0.15s ease-out;
    }

    .animate-slide-up {
      animation: slide-up 0.2s ease-out;
    }
  `]
})
export class ConfirmModalComponent {
  private confirmService = inject(ConfirmService);

  dialogs = this.confirmService.getDialogs;

  onConfirm(dialog: any): void {
    if (dialog.onConfirm) {
      dialog.onConfirm();
    }
  }

  onCancel(dialog: any): void {
    if (dialog.onCancel) {
      dialog.onCancel();
    }
  }

  // Handle backdrop click
  onBackdropClick(event: MouseEvent, dialogId: string): void {
    // Only close if clicking the backdrop itself, not its children
    if (event.target === event.currentTarget) {
      const dialog = this.dialogs().find(d => d.id === dialogId);
      if (dialog?.onCancel) {
        dialog.onCancel();
      }
    }
  }
}
