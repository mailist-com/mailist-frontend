import { Component, OnInit, inject } from '@angular/core';
import { NgIcon } from "@ng-icons/core";
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../../../services/dashboard.service';
import { OverviewStats as OverviewStatsModel } from '../../../../../models/dashboard.model';

type StatCard = {
  icon: string;
  label: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  bgColor: string;
  iconColor: string;
};

@Component({
  selector: 'app-overview-stats',
  imports: [NgIcon, CommonModule],
  templateUrl: './overview-stats.html',
  styles: ``
})
export class OverviewStats implements OnInit {
  private dashboardService = inject(DashboardService);

  stats: StatCard[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit() {
    this.loadStats();
  }

  private loadStats() {
    this.dashboardService.getOverviewStats().subscribe({
      next: (data: OverviewStatsModel) => {
        this.stats = [
          {
            icon: "lucideUsers",
            label: "Całkowita liczba kontaktów",
            value: data.totalContacts.toLocaleString('pl-PL'),
            change: data.contactsChangePercentage,
            changeType: data.contactsChangeType,
            bgColor: "bg-blue-50 dark:bg-blue-500/10",
            iconColor: "text-blue-600 dark:text-blue-400"
          },
          {
            icon: "lucideMail",
            label: "Wysłane emaile (30 dni)",
            value: data.sentEmails30Days.toLocaleString('pl-PL'),
            change: data.sentEmailsChangePercentage,
            changeType: data.sentEmailsChangeType,
            bgColor: "bg-green-50 dark:bg-green-500/10",
            iconColor: "text-green-600 dark:text-green-400"
          },
          {
            icon: "lucideMousePointerClick",
            label: "Średni Open Rate",
            value: `${data.averageOpenRate.toFixed(1)}%`,
            change: data.openRateChangePercentage,
            changeType: data.openRateChangeType,
            bgColor: "bg-purple-50 dark:bg-purple-500/10",
            iconColor: "text-purple-600 dark:text-purple-400"
          },
          {
            icon: "lucideSquareMousePointer",
            label: "Średni Click Rate",
            value: `${data.averageClickRate.toFixed(1)}%`,
            change: data.clickRateChangePercentage,
            changeType: data.clickRateChangeType,
            bgColor: "bg-orange-50 dark:bg-orange-500/10",
            iconColor: "text-orange-600 dark:text-orange-400"
          }
        ];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading overview stats:', err);
        this.error = 'Nie udało się załadować statystyk';
        this.loading = false;
        // Fallback to empty stats or show error
        this.stats = [];
      }
    });
  }
}
