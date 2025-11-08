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
      height: 3px;
      z-index: 9999;
      overflow: hidden;
      background-color: rgba(0, 0, 0, 0.05);
    }

    .global-loader-bar {
      height: 100%;
      background: linear-gradient(
        90deg,
        rgba(59, 130, 246, 0.5) 0%,
        rgba(37, 99, 235, 0.7) 50%,
        rgba(29, 78, 216, 0.5) 100%
      );
      animation: loading 1.5s ease-in-out infinite;
      transform-origin: left;
    }

    @keyframes loading {
      0% {
        transform: scaleX(0);
        transform-origin: left;
      }
      50% {
        transform: scaleX(0.7);
        transform-origin: left;
      }
      51% {
        transform: scaleX(0.7);
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
