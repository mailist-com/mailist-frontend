import { Component } from '@angular/core';
import { NgIcon } from "@ng-icons/core";
import { CommonModule } from '@angular/common';

type Activity = {
  icon: string;
  title: string;
  description: string;
  time: string;
  iconBg: string;
  iconColor: string;
};

@Component({
  selector: 'app-activity-feed',
  imports: [NgIcon, CommonModule],
  templateUrl: './activity-feed.html',
  styles: ``
})
export class ActivityFeed {
  activities: Activity[] = [
    {
      icon: "lucideMail",
      title: "Kampania wysłana",
      description: "Newsletter Grudzień 2024",
      time: "5 min temu",
      iconBg: "bg-blue-50 dark:bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    {
      icon: "lucideUserPlus",
      title: "Nowe kontakty",
      description: "45 kontaktów dodanych",
      time: "2 godziny temu",
      iconBg: "bg-green-50 dark:bg-green-500/10",
      iconColor: "text-green-600 dark:text-green-400"
    },
    {
      icon: "lucideWorkflow",
      title: "Automatyzacja uruchomiona",
      description: "Welcome Series",
      time: "4 godziny temu",
      iconBg: "bg-purple-50 dark:bg-purple-500/10",
      iconColor: "text-purple-600 dark:text-purple-400"
    },
    {
      icon: "lucideNotepadText",
      title: "Szablon utworzony",
      description: "Promocja Black Friday",
      time: "Wczoraj",
      iconBg: "bg-orange-50 dark:bg-orange-500/10",
      iconColor: "text-orange-600 dark:text-orange-400"
    },
    {
      icon: "lucideListChecks",
      title: "Lista zaktualizowana",
      description: "Aktywni subskrybenci",
      time: "2 dni temu",
      iconBg: "bg-pink-50 dark:bg-pink-500/10",
      iconColor: "text-pink-600 dark:text-pink-400"
    }
  ];
}
