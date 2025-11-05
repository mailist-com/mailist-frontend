import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideActivity,
  lucideSend,
  lucideClock,
  lucideFileText,
  lucideRefreshCw,
  lucidePlus,
  lucideSearch,
  lucideMail,
  lucidePencil,
  lucideCopy,
  lucideTrash2,
  lucidePlay,
  lucidePause,
  lucideEye,
} from '@ng-icons/lucide';

import { PageTitle } from '../../../components/page-title/page-title';
import { CampaignService } from '../../../services/campaign.service';
import { Campaign, CampaignStatus, CampaignType } from '../../../models/campaign.model';

@Component({
  selector: 'app-campaign-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon, PageTitle],
  providers: [provideIcons({
    lucideActivity,
    lucideSend,
    lucideClock,
    lucideFileText,
    lucideRefreshCw,
    lucidePlus,
    lucideSearch,
    lucideMail,
    lucidePencil,
    lucideCopy,
    lucideTrash2,
    lucidePlay,
    lucidePause,
    lucideEye,
  })],
  templateUrl: './campaign-list.html',
  styleUrl: './campaign-list.css'
})
export class CampaignList implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  campaigns: Campaign[] = [];
  filteredCampaigns: Campaign[] = [];
  isLoading = false;

  searchTerm = '';
  selectedStatus = '';
  selectedType = '';

  stats = {
    total: 0,
    draft: 0,
    scheduled: 0,
    sent: 0
  };

  constructor(
    private campaignService: CampaignService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCampaigns();
    this.loadStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCampaigns(): void {
    this.isLoading = true;
    this.campaignService.getCampaigns()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (campaigns) => {
          this.campaigns = campaigns;
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading campaigns:', error);
          this.isLoading = false;
        }
      });
  }

  loadStats(): void {
    this.campaignService.getCampaignStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.stats = stats;
        },
        error: (error) => {
          console.error('Error loading stats:', error);
        }
      });
  }

  applyFilters(): void {
    this.filteredCampaigns = this.campaigns.filter(campaign => {
      const matchesSearch = !this.searchTerm ||
        campaign.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (campaign.subject && campaign.subject.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchesStatus = !this.selectedStatus || campaign.status === this.selectedStatus;
      const matchesType = !this.selectedType || campaign.type === this.selectedType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedType = '';
    this.applyFilters();
  }

  refreshCampaigns(): void {
    this.loadCampaigns();
    this.loadStats();
  }

  createCampaign(): void {
    this.router.navigate(['/campaigns/create']);
  }

  editCampaign(campaign: Campaign): void {
    this.router.navigate(['/campaigns/edit', campaign.id]);
  }

  viewCampaign(campaign: Campaign): void {
    this.router.navigate(['/campaigns', campaign.id]);
  }

  viewStats(campaign: Campaign): void {
    this.router.navigate(['/campaigns', campaign.id, 'stats']);
  }

  duplicateCampaign(campaign: Campaign): void {
    this.campaignService.duplicateCampaign(campaign.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadCampaigns();
          this.loadStats();
        },
        error: (error) => {
          console.error('Error duplicating campaign:', error);
        }
      });
  }

  deleteCampaign(campaign: Campaign): void {
    if (confirm(`Czy na pewno chcesz usunąć kampanię "${campaign.name}"?`)) {
      this.campaignService.deleteCampaign(campaign.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadCampaigns();
            this.loadStats();
          },
          error: (error) => {
            console.error('Error deleting campaign:', error);
          }
        });
    }
  }

  sendCampaign(campaign: Campaign): void {
    if (confirm(`Czy na pewno chcesz wysłać kampanię "${campaign.name}"?`)) {
      this.campaignService.sendCampaign(campaign.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadCampaigns();
            this.loadStats();
          },
          error: (error) => {
            console.error('Error sending campaign:', error);
          }
        });
    }
  }

  pauseCampaign(campaign: Campaign): void {
    this.campaignService.pauseCampaign(campaign.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadCampaigns();
        },
        error: (error) => {
          console.error('Error pausing campaign:', error);
        }
      });
  }

  resumeCampaign(campaign: Campaign): void {
    this.campaignService.resumeCampaign(campaign.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadCampaigns();
        },
        error: (error) => {
          console.error('Error resuming campaign:', error);
        }
      });
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

  getTypeLabel(type: CampaignType): string {
    const labels: Record<CampaignType, string> = {
      'regular': 'Standardowa',
      'ab_test': 'Test A/B',
      'rss': 'RSS',
      'automated': 'Automatyczna'
    };
    return labels[type] || type;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pl-PL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('pl-PL').format(num);
  }
}
