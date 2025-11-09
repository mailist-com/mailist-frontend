import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from "@ng-icons/core";
import { SimplebarAngularModule } from "simplebar-angular";
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../../../services/notification.service';
import { Notification, NotificationCategory } from '../../../../../models/notification.model';

@Component({
  selector: 'app-notification-dropdown',
  imports: [NgIcon, RouterLink, SimplebarAngularModule, CommonModule],
  templateUrl: './notification-dropdown.html',
  standalone: true,
  styles: ``
})
export class NotificationDropdown implements OnInit {
  private notificationService = inject(NotificationService);

  // Signals
  notifications = signal<Notification[]>([]);
  isLoading = signal<boolean>(false);
  selectedTab = signal<NotificationCategory | 'all'>('all');

  // Computed
  unreadCount = computed(() => this.notificationService.unreadCount());

  filteredNotifications = computed(() => {
    const tab = this.selectedTab();
    const allNotifications = this.notifications();

    if (tab === 'all') {
      return allNotifications;
    }

    return allNotifications.filter(n => n.category === tab);
  });

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading.set(true);
    this.notificationService.getRecentNotifications(15).subscribe({
      next: (notifications) => {
        this.notifications.set(notifications);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.isLoading.set(false);
      }
    });
  }

  selectTab(tab: NotificationCategory | 'all'): void {
    this.selectedTab.set(tab);
  }

  markAsRead(notification: Notification, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: (updatedNotification) => {
          // Update the notification in the list
          const updated = this.notifications().map(n =>
            n.id === notification.id ? updatedNotification : n
          );
          this.notifications.set(updated);
        },
        error: (error) => {
          console.error('Error marking notification as read:', error);
        }
      });
    }
  }

  getNotificationIcon(category: NotificationCategory): string {
    switch (category) {
      case 'contact_added':
        return 'lucideUserPlus';
      case 'contact_removed':
        return 'lucideUserMinus';
      case 'campaign_sent':
        return 'lucideMail';
      case 'automation_triggered':
        return 'lucideZap';
      case 'billing':
        return 'lucideCreditCard';
      default:
        return 'lucideBell';
    }
  }

  getNotificationColor(category: NotificationCategory): { bg: string; text: string } {
    switch (category) {
      case 'contact_added':
        return { bg: 'bg-green-100', text: 'text-green-600' };
      case 'contact_removed':
        return { bg: 'bg-red-100', text: 'text-red-600' };
      case 'campaign_sent':
        return { bg: 'bg-blue-100', text: 'text-blue-600' };
      case 'automation_triggered':
        return { bg: 'bg-purple-100', text: 'text-purple-600' };
      case 'billing':
        return { bg: 'bg-yellow-100', text: 'text-yellow-600' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-600' };
    }
  }

  getRelativeTime(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - new Date(date).getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMinutes < 1) {
      return 'Teraz';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `${diffInHours} godz`;
    } else if (diffInDays === 1) {
      return '1 dzień';
    } else if (diffInDays < 7) {
      return `${diffInDays} dni`;
    } else {
      return new Date(date).toLocaleDateString('pl-PL');
    }
  }
}
