import { Component } from '@angular/core';
import { NgIcon } from "@ng-icons/core";
import { CommonModule } from '@angular/common';

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
export class OverviewStats {
  stats: StatCard[] = [
    {
      icon: "lucideUsers",
      label: "Całkowita liczba kontaktów",
      value: "12,458",
      change: "+12.5%",
      changeType: "positive",
      bgColor: "bg-blue-50 dark:bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    {
      icon: "lucideMail",
      label: "Wysłane emaile (30 dni)",
      value: "45,892",
      change: "+8.2%",
      changeType: "positive",
      bgColor: "bg-green-50 dark:bg-green-500/10",
      iconColor: "text-green-600 dark:text-green-400"
    },
    {
      icon: "lucideMousePointerClick",
      label: "Średni Open Rate",
      value: "24.8%",
      change: "+2.3%",
      changeType: "positive",
      bgColor: "bg-purple-50 dark:bg-purple-500/10",
      iconColor: "text-purple-600 dark:text-purple-400"
    },
    {
      icon: "lucideSquareMousePointer",
      label: "Średni Click Rate",
      value: "3.6%",
      change: "-0.5%",
      changeType: "negative",
      bgColor: "bg-orange-50 dark:bg-orange-500/10",
      iconColor: "text-orange-600 dark:text-orange-400"
    }
  ];
}
