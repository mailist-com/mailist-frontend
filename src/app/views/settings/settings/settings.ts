import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIcon } from '@ng-icons/core';

import { PageTitle } from '../../../components/page-title/page-title';

interface SettingsMenuItem {
  title: string;
  icon: string;
  route: string;
  description: string;
}

@Component({
  selector: 'app-settings',
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, NgIcon, PageTitle],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  menuItems: SettingsMenuItem[] = [
    {
      title: 'Profil',
      icon: 'lucideUser',
      route: '/settings/profile',
      description: 'Zarządzaj swoim profilem i preferencjami',
    },
    {
      title: 'Plan i Płatności',
      icon: 'lucideCreditCard',
      route: '/settings/billing',
      description: 'Zarządzaj planem i metodami płatności',
    },
    {
      title: 'Zużycie',
      icon: 'lucideBarChart3',
      route: '/settings/usage',
      description: 'Zobacz statystyki zużycia',
    },
    {
      title: 'Zespół',
      icon: 'lucideUsers',
      route: '/settings/team',
      description: 'Zarządzaj członkami zespołu',
    },
  ];
}
