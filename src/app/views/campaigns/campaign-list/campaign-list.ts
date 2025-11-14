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
  lucideChevronsLeft,
  lucideChevronLeft,
  lucideChevronRight,
  lucideChevronsRight,
} from '@ng-icons/lucide';
import { TranslateModule } from '@ngx-translate/core';

import { PageTitle } from '../../../components/page-title/page-title';
import { CustomDropdown, DropdownOption } from '../../../components/custom-dropdown/custom-dropdown';
import { CampaignService } from '../../../services/campaign.service';
import { ConfirmService } from '../../../services/confirm.service';
import { Campaign, CampaignStatus, CampaignType } from '../../../models/campaign.model';

@Component({
  selector: 'app-campaign-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon, PageTitle, TranslateModule, CustomDropdown],
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
    lucideChevronsLeft,
    lucideChevronLeft,
    lucideChevronRight,
    lucideChevronsRight,
  })],
  templateUrl: './campaign-list.html',
  styleUrl: './campaign-list.css'
})
export class CampaignList implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  campaigns: Campaign[] = [];
  filteredCampaigns: Campaign[] = [];

  searchTerm = '';
  selectedStatus = '';
  selectedType = '';

  // Dropdown options
  statusOptions: DropdownOption[] = [
    { value: '', label: 'CAMPAIGNS.ALL_STATUSES' },
    { value: 'draft', label: 'CAMPAIGNS.STATUS.DRAFT' },
    { value: 'scheduled', label: 'CAMPAIGNS.STATUS.SCHEDULED' },
    { value: 'sending', label: 'CAMPAIGNS.STATUS.SENDING' },
    { value: 'sent', label: 'CAMPAIGNS.STATUS.SENT' },
    { value: 'paused', label: 'CAMPAIGNS.STATUS.PAUSED' },
    { value: 'cancelled', label: 'CAMPAIGNS.STATUS.CANCELLED' }
  ];

  typeOptions: DropdownOption[] = [
    { value: '', label: 'CAMPAIGNS.ALL_TYPES' },
    { value: 'regular', label: 'CAMPAIGNS.TYPE.REGULAR' },
    { value: 'ab_test', label: 'CAMPAIGNS.TYPE.AB_TEST' },
    { value: 'rss', label: 'CAMPAIGNS.TYPE.RSS' },
    { value: 'automated', label: 'CAMPAIGNS.TYPE.AUTOMATED' }
  ];

  pageSizeOptions: DropdownOption[] = [
    { value: 10, label: 'COMMON.PER_PAGE_10' },
    { value: 20, label: 'COMMON.PER_PAGE_20' },
    { value: 50, label: 'COMMON.PER_PAGE_50' },
    { value: 100, label: 'COMMON.PER_PAGE_100' }
  ];

  stats = {
    total: 0,
    draft: 0,
    scheduled: 0,
    sent: 0
  };

  // Pagination properties
  currentPage = 0;
  pageSize = 20;
  totalPages = 0;
  totalElements = 0;

  // Expose Math to template
  Math = Math;

  constructor(
    private campaignService: CampaignService,
    private router: Router,
    private confirmService: ConfirmService
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
    this.campaignService.getCampaigns()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (campaigns) => {
          this.campaigns = campaigns;
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error loading campaigns:', error);
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

    // Update pagination
    this.totalElements = this.filteredCampaigns.length;
    this.totalPages = Math.ceil(this.totalElements / this.pageSize);

    // Reset to first page if current page is out of bounds
    if (this.currentPage >= this.totalPages && this.totalPages > 0) {
      this.currentPage = 0;
    }
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

  async deleteCampaign(campaign: Campaign): Promise<void> {
    const confirmed = await this.confirmService.confirmDanger(
      'Usuń kampanię',
      `Czy na pewno chcesz usunąć kampanię "${campaign.name}"? Ta operacja jest nieodwracalna.`,
      'Usuń',
      'Anuluj'
    );

    if (confirmed) {
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

  async sendCampaign(campaign: Campaign): Promise<void> {
    const confirmed = await this.confirmService.confirmWarning(
      'Wyślij kampanię',
      `Czy na pewno chcesz wysłać kampanię "${campaign.name}"? Kampania zostanie wysłana do wszystkich odbiorców.`,
      'Wyślij',
      'Anuluj'
    );

    if (confirmed) {
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
    const keys: Record<CampaignStatus, string> = {
      'draft': 'CAMPAIGNS.STATUS.DRAFT',
      'scheduled': 'CAMPAIGNS.STATUS.SCHEDULED',
      'sending': 'CAMPAIGNS.STATUS.SENDING',
      'sent': 'CAMPAIGNS.STATUS.SENT',
      'paused': 'CAMPAIGNS.STATUS.PAUSED',
      'cancelled': 'CAMPAIGNS.STATUS.CANCELLED'
    };
    return keys[status] || status;
  }

  getTypeLabel(type: CampaignType): string {
    const keys: Record<CampaignType, string> = {
      'regular': 'CAMPAIGNS.TYPE.REGULAR',
      'ab_test': 'CAMPAIGNS.TYPE.AB_TEST',
      'rss': 'CAMPAIGNS.TYPE.RSS',
      'automated': 'CAMPAIGNS.TYPE.AUTOMATED'
    };
    return keys[type] || type;
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

  // Pagination methods
  get paginatedCampaigns(): Campaign[] {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredCampaigns.slice(start, end);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.applyFilters();
  }

  get pages(): number[] {
    return Array.from({length: this.totalPages}, (_, i) => i);
  }
}
