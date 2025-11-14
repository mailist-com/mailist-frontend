import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-notification',
  imports: [CommonModule, NgIcon],
  templateUrl: './toast-notification.html',
  styles: [`
    @keyframes slide-in {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slide-out {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }

    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }

    .animate-slide-out {
      animation: slide-out 0.3s ease-in;
    }
  `]
})
export class ToastNotification {
  private toastService = inject(ToastService);

  toasts = this.toastService.getToasts;
  dismissingToastId: string | null = null;

  dismiss(id: string): void {
    // Set dismissing animation
    this.dismissingToastId = id;

    // Remove after animation completes
    setTimeout(() => {
      this.toastService.dismiss(id);
      this.dismissingToastId = null;
    }, 300);
  }
}
