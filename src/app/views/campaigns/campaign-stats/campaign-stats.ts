import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { TranslatePipe } from '@ngx-translate/core';
import {
  lucideArrowLeft,
  lucideSend,
  lucideCircleCheck,
  lucideMousePointerClick,
  lucideCircleAlert,
  lucideUserMinus,
  lucideTrendingUp,
  lucideExternalLink,
  lucideEye,
  lucideMail,
} from '@ng-icons/lucide';

import { CampaignService } from '../../../services/campaign.service';
import { Campaign } from '../../../models/campaign.model';

interface LinkClick {
  url: string;
  clicks: number;
  uniqueClicks: number;
  clickRate: number;
}

@Component({
  selector: 'app-campaign-stats',
  standalone: true,
  imports: [CommonModule, NgIcon, TranslatePipe],
  providers: [provideIcons({
    lucideArrowLeft,
    lucideSend,
    lucideCircleCheck,
    lucideMousePointerClick,
    lucideCircleAlert,
    lucideUserMinus,
    lucideTrendingUp,
    lucideExternalLink,
    lucideEye,
    lucideMail,
  })],
  templateUrl: './campaign-stats.html',
  styleUrl: './campaign-stats.css'
})
export class CampaignStats implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  campaign: Campaign | null = null;

  // Mock link clicks data
  linkClicks: LinkClick[] = [
    {
      url: 'https://example.com/product/special-offer',
      clicks: 342,
      uniqueClicks: 298,
      clickRate: 11.7
    },
    {
      url: 'https://example.com/blog/article',
      clicks: 156,
      uniqueClicks: 134,
      clickRate: 5.3
    },
    {
      url: 'https://example.com/contact',
      clicks: 89,
      uniqueClicks: 78,
      clickRate: 3.1
    },
    {
      url: 'https://example.com/pricing',
      clicks: 67,
      uniqueClicks: 59,
      clickRate: 2.3
    }
  ];

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
    this.campaignService.getCampaignById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (campaign) => {
          this.campaign = campaign;
        },
        error: (error) => {
          console.error('Error loading campaign:', error);
        }
      });
  }

  goBack(): void {
    if (this.campaign) {
      this.router.navigate(['/campaigns', this.campaign.id]);
    } else {
      this.router.navigate(['/campaigns']);
    }
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('pl-PL').format(num);
  }

  formatPercentage(num: number): string {
    return num.toFixed(1) + '%';
  }

  truncateUrl(url: string, maxLength: number = 50): string {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  }
}
