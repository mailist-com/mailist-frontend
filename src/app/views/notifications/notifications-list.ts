import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { PageTitle } from '../../components/page-title/page-title';
import { NotificationService } from '../../services/notification.service';
import { Notification, NotificationCategory } from '../../models/notification.model';

@Component({
  selector: 'app-notifications-list',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIcon, PageTitle],
  templateUrl: './notifications-list.html',
  styles: []
})
export class NotificationsListComponent implements OnInit {
  private notificationService = inject(NotificationService);

  // Signals
  notifications = signal<Notification[]>([]);
  isLoading = signal<boolean>(false);
  currentPage = signal<number>(0);
  pageSize = signal<number>(20);
  totalPages = signal<number>(0);
  totalElements = signal<number>(0);
  selectedFilter = signal<NotificationCategory | 'all' | 'unread'>('all');

  // Computed
  unreadCount = computed(() => this.notificationService.unreadCount());

  ngOnInit(): void {
    this.loadNotifications();
    this.loadStats();
  }

  loadStats(): void {
    this.notificationService.getNotificationStats().subscribe({
      next: (stats) => {
        // Stats are already managed in the service
      },
      error: (error) => {
        console.error('Error loading notification stats:', error);
      }
    });
  }

  getCategoryCount(category: NotificationCategory): number {
    return this.notifications().filter(n => n.category === category).length;
  }

  loadNotifications(): void {
    this.isLoading.set(true);
    const filter = this.selectedFilter();
    const page = this.currentPage();
    const size = this.pageSize();

    let observable;

    if (filter === 'unread') {
      observable = this.notificationService.getUnreadNotifications(page, size);
    } else if (filter === 'all') {
      observable = this.notificationService.getNotifications(page, size);
    } else {
      observable = this.notificationService.getNotificationsByCategory(filter, page, size);
    }

    observable.subscribe({
      next: (response) => {
        this.notifications.set(response.content);
        this.totalPages.set(response.page.totalPages);
        this.totalElements.set(response.page.totalElements);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.isLoading.set(false);
      }
    });
  }

  selectFilter(filter: NotificationCategory | 'all' | 'unread'): void {
    this.selectedFilter.set(filter);
    this.currentPage.set(0);
    this.loadNotifications();
  }

  markAsRead(notification: Notification, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: (updatedNotification) => {
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

  markAsUnread(notification: Notification, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (notification.isRead) {
      this.notificationService.markAsUnread(notification.id).subscribe({
        next: (updatedNotification) => {
          const updated = this.notifications().map(n =>
            n.id === notification.id ? updatedNotification : n
          );
          this.notifications.set(updated);
        },
        error: (error) => {
          console.error('Error marking notification as unread:', error);
        }
      });
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        const updated = this.notifications().map(n => ({ ...n, isRead: true, readAt: new Date() }));
        this.notifications.set(updated);
      },
      error: (error) => {
        console.error('Error marking all as read:', error);
      }
    });
  }

  deleteNotification(notification: Notification, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (confirm('Czy na pewno chcesz usunąć to powiadomienie?')) {
      this.notificationService.deleteNotification(notification.id).subscribe({
        next: () => {
          const updated = this.notifications().filter(n => n.id !== notification.id);
          this.notifications.set(updated);
        },
        error: (error) => {
          console.error('Error deleting notification:', error);
        }
      });
    }
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadNotifications();
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update(p => p + 1);
      this.loadNotifications();
    }
  }

  previousPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.update(p => p - 1);
      this.loadNotifications();
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

  getNotificationColor(category: NotificationCategory): { bg: string; text: string; border: string } {
    switch (category) {
      case 'contact_added':
        return { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' };
      case 'contact_removed':
        return { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200' };
      case 'campaign_sent':
        return { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' };
      case 'automation_triggered':
        return { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' };
      case 'billing':
        return { bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-200' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' };
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
      return `${diffInMinutes} min temu`;
    } else if (diffInHours < 24) {
      return `${diffInHours} godz temu`;
    } else if (diffInDays === 1) {
      return 'Wczoraj';
    } else if (diffInDays < 7) {
      return `${diffInDays} dni temu`;
    } else {
      return new Date(date).toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  getCategoryLabel(category: NotificationCategory | 'all' | 'unread'): string {
    switch (category) {
      case 'all':
        return 'Wszystkie';
      case 'unread':
        return 'Nieprzeczytane';
      case 'contact_added':
        return 'Dodano kontakt';
      case 'contact_removed':
        return 'Usunięto kontakt';
      case 'campaign_sent':
        return 'Wysłano kampanię';
      case 'automation_triggered':
        return 'Automatyzacja';
      case 'billing':
        return 'Płatności';
      case 'system':
        return 'System';
      default:
        return category;
    }
  }
}
