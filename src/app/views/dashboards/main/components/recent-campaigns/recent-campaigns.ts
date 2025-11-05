import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon } from "@ng-icons/core";

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
export class RecentCampaigns {
  campaigns: Campaign[] = [
    {
      id: 1,
      name: "Newsletter Grudzień 2024",
      subject: "🎄 Świąteczne promocje tylko dla Ciebie!",
      status: "sent",
      statusLabel: "Wysłana",
      statusColor: "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400",
      sent: 12458,
      opens: 3090,
      clicks: 448,
      openRate: "24.8%",
      clickRate: "3.6%",
      sentDate: "2024-12-01 10:00"
    },
    {
      id: 2,
      name: "Black Friday 2024",
      subject: "🔥 -50% na wszystko - tylko dziś!",
      status: "sent",
      statusLabel: "Wysłana",
      statusColor: "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400",
      sent: 11892,
      opens: 3568,
      clicks: 535,
      openRate: "30.0%",
      clickRate: "4.5%",
      sentDate: "2024-11-29 08:00"
    },
    {
      id: 3,
      name: "Cyber Monday",
      subject: "⚡ Ostatnia szansa na mega okazje!",
      status: "sent",
      statusLabel: "Wysłana",
      statusColor: "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400",
      sent: 11756,
      opens: 2821,
      clicks: 395,
      openRate: "24.0%",
      clickRate: "3.4%",
      sentDate: "2024-12-02 09:00"
    },
    {
      id: 4,
      name: "Newsletter Listopad",
      subject: "📰 Co nowego w listopadzie?",
      status: "sent",
      statusLabel: "Wysłana",
      statusColor: "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400",
      sent: 11234,
      opens: 2471,
      clicks: 337,
      openRate: "22.0%",
      clickRate: "3.0%",
      sentDate: "2024-11-15 10:00"
    },
    {
      id: 5,
      name: "Świąteczny Przewodnik",
      subject: "🎁 Najlepsze pomysły na prezenty",
      status: "scheduled",
      statusLabel: "Zaplanowana",
      statusColor: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400",
      sent: 0,
      opens: 0,
      clicks: 0,
      openRate: "-",
      clickRate: "-",
      sentDate: "2024-12-15 10:00"
    }
  ];
}
