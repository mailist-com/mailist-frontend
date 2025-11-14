import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { ConfirmService } from '../../services/confirm.service';

@Component({
  selector: 'app-confirm-modal',
  imports: [CommonModule, NgIcon],
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
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @keyframes fade-out {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }

    .animate-fade-in {
      animation: fade-in 0.2s ease-out;
    }

    .animate-slide-up {
      animation: slide-up 0.3s ease-out;
    }

    .animate-fade-out {
      animation: fade-out 0.2s ease-in;
    }
  `]
})
export class ConfirmModalComponent {
  private confirmService = inject(ConfirmService);

  dialogs = this.confirmService.getDialogs;
  dismissingDialogId: string | null = null;

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
