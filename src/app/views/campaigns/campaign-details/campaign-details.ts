import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucidePencil,
  lucideCopy,
  lucideTrash2,
  lucideSend,
  lucideActivity,
  lucideMail,
  lucideUser,
  lucideClock,
  lucideCalendar,
  lucideCircleCheck,
  lucideCircleAlert,
  lucideEye,
} from '@ng-icons/lucide';

import { CampaignService } from '../../../services/campaign.service';
import { Campaign, CampaignStatus } from '../../../models/campaign.model';

@Component({
  selector: 'app-campaign-details',
  standalone: true,
  imports: [CommonModule, NgIcon],
  providers: [provideIcons({
    lucideArrowLeft,
    lucidePencil,
    lucideCopy,
    lucideTrash2,
    lucideSend,
    lucideActivity,
    lucideMail,
    lucideUser,
    lucideClock,
    lucideCalendar,
    lucideCircleCheck,
    lucideCircleAlert,
    lucideEye,
  })],
  templateUrl: './campaign-details.html',
  styleUrl: './campaign-details.css'
})
export class CampaignDetails implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  campaign: Campaign | null = null;
  isLoading = true;
  showHtmlPreview = false;

  constructor(
    private campaignService: CampaignService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCampaign(id);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCampaign(id: string): void {
    this.isLoading = true;
    this.campaignService.getCampaignById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (campaign) => {
          this.campaign = campaign;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading campaign:', error);
          this.isLoading = false;
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/campaigns']);
  }

  editCampaign(): void {
    if (this.campaign) {
      this.router.navigate(['/campaigns/edit', this.campaign.id]);
    }
  }

  viewStats(): void {
    if (this.campaign) {
      this.router.navigate(['/campaigns', this.campaign.id, 'stats']);
    }
  }

  duplicateCampaign(): void {
    if (this.campaign && confirm(`Czy na pewno chcesz zduplikować kampanię "${this.campaign.name}"?`)) {
      this.campaignService.duplicateCampaign(this.campaign.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.router.navigate(['/campaigns']);
          },
          error: (error) => {
            console.error('Error duplicating campaign:', error);
          }
        });
    }
  }

  deleteCampaign(): void {
    if (this.campaign && confirm(`Czy na pewno chcesz usunąć kampanię "${this.campaign.name}"?`)) {
      this.campaignService.deleteCampaign(this.campaign.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.router.navigate(['/campaigns']);
          },
          error: (error) => {
            console.error('Error deleting campaign:', error);
          }
        });
    }
  }

  sendCampaign(): void {
    if (this.campaign && confirm(`Czy na pewno chcesz wysłać kampanię "${this.campaign.name}"?`)) {
      this.campaignService.sendCampaign(this.campaign.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            if (this.campaign) {
              this.loadCampaign(this.campaign.id);
            }
          },
          error: (error) => {
            console.error('Error sending campaign:', error);
          }
        });
    }
  }

  togglePreview(): void {
    this.showHtmlPreview = !this.showHtmlPreview;
  }

  getStatusLabel(status: CampaignStatus): string {
    const labels: Record<CampaignStatus, string> = {
      'draft': 'Szkic',
      'scheduled': 'Zaplanowana',
      'sending': 'Wysyłanie',
      'sent': 'Wysłana',
      'paused': 'Wstrzymana',
      'cancelled': 'Anulowana'
    };
    return labels[status] || status;
  }

  getStatusClass(status: CampaignStatus): string {
    const classes: Record<CampaignStatus, string> = {
      'draft': 'bg-default-100 text-default-600',
      'scheduled': 'bg-warning/10 text-warning',
      'sending': 'bg-info/10 text-info',
      'sent': 'bg-success/10 text-success',
      'paused': 'bg-danger/10 text-danger',
      'cancelled': 'bg-danger/10 text-danger'
    };
    return classes[status] || 'bg-default-100 text-default-600';
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '—';
    return new Intl.DateTimeFormat('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('pl-PL').format(num);
  }
}
