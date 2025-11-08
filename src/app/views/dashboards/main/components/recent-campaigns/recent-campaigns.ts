import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon } from "@ng-icons/core";
import { DashboardService } from '../../../../../services/dashboard.service';
import { CampaignStats } from '../../../../../models/dashboard.model';

type Campaign = {
  id: number;
  name: string;
  subject: string;
  status: 'sent' | 'draft' | 'scheduled';
  statusLabel: string;
  statusColor: string;
  sent: number;
  opens: number;
  clicks: number;
  openRate: string;
  clickRate: string;
  sentDate: string;
};

@Component({
  selector: 'app-recent-campaigns',
  imports: [CommonModule, RouterLink, NgIcon],
  templateUrl: './recent-campaigns.html',
  styles: ``
})
export class RecentCampaigns implements OnInit {
  private dashboardService = inject(DashboardService);

  campaigns: Campaign[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit() {
    this.loadCampaigns();
  }

  private loadCampaigns() {
    this.dashboardService.getRecentCampaigns(5).subscribe({
      next: (data) => {
        this.campaigns = data.campaigns.map((c: CampaignStats) => this.mapCampaign(c));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading recent campaigns:', err);
        this.error = 'Nie udało się załadować kampanii';
        this.loading = false;
        this.campaigns = [];
      }
    });
  }

  private mapCampaign(campaign: CampaignStats): Campaign {
    const statusMap = {
      'sent': { label: 'Wysłana', color: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400' },
      'scheduled': { label: 'Zaplanowana', color: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400' },
      'draft': { label: 'Szkic', color: 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400' },
      'failed': { label: 'Nieudana', color: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400' }
    };

    const status = statusMap[campaign.status as keyof typeof statusMap] || statusMap['draft'];

    return {
      id: parseInt(campaign.campaignId),
      name: campaign.campaignName,
      subject: campaign.subject,
      status: campaign.status as 'sent' | 'draft' | 'scheduled',
      statusLabel: status.label,
      statusColor: status.color,
      sent: campaign.sent,
      opens: campaign.opens,
      clicks: campaign.clicks,
      openRate: campaign.sent > 0 ? `${campaign.openRate.toFixed(1)}%` : '-',
      clickRate: campaign.sent > 0 ? `${campaign.clickRate.toFixed(1)}%` : '-',
      sentDate: campaign.sentDate
    };
  }
}
