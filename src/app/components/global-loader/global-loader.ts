import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../core/services/loading.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-global-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="global-loader-container" *ngIf="loading$ | async">
      <div class="global-loader-bar"></div>
    </div>
  `,
  styles: [`
    .global-loader-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 5px;
      z-index: 9999;
      overflow: hidden;
      background: linear-gradient(
        90deg,
        rgba(59, 130, 246, 0.15) 0%,
        rgba(139, 92, 246, 0.15) 50%,
        rgba(59, 130, 246, 0.15) 100%
      );
    }

    .global-loader-bar {
      height: 100%;
      background: linear-gradient(
        90deg,
        #3b82f6 0%,
        #8b5cf6 35%,
        #ec4899 50%,
        #8b5cf6 65%,
        #3b82f6 100%
      );
      box-shadow:
        0 0 10px rgba(59, 130, 246, 0.5),
        0 0 20px rgba(139, 92, 246, 0.3),
        0 0 30px rgba(236, 72, 153, 0.2);
      animation: loading 1.2s ease-in-out infinite;
      transform-origin: left;
    }

    @keyframes loading {
      0% {
        transform: scaleX(0);
        transform-origin: left;
      }
      45% {
        transform: scaleX(0.8);
        transform-origin: left;
      }
      55% {
        transform: scaleX(0.8);
        transform-origin: right;
      }
      100% {
        transform: scaleX(0);
        transform-origin: right;
      }
    }
  `]
})
export class GlobalLoaderComponent {
  loading$: Observable<boolean>;

  constructor(private loadingService: LoadingService) {
    this.loading$ = this.loadingService.loading$;
  }
}
