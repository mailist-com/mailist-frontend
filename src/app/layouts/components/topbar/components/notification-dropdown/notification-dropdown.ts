import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from "@ng-icons/core";
import { SimplebarAngularModule } from "simplebar-angular";
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../../../services/notification.service';
import { Notification, NotificationType, NotificationStats, ContactNotificationMetadata } from '../../../../../models/notification.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-notification-dropdown',
  imports: [NgIcon, RouterLink, SimplebarAngularModule, CommonModule],
  templateUrl: './notification-dropdown.html',
  styles: ``
})
export class NotificationDropdown implements OnInit, OnDestroy {
  notifications$: Observable<Notification[]>;
  stats$: Observable<NotificationStats>;

  activeTab: 'all' | 'added' | 'removed' = 'all';
  NotificationType = NotificationType;

  constructor(private notificationService: NotificationService) {
    this.notifications$ = this.notificationService.notifications$;
    this.stats$ = this.notificationService.stats$;
  }

  ngOnInit(): void {
    // Initialize service and load notifications
    this.notificationService.initialize();

    // Optional: Start polling for new notifications every 30 seconds
    this.notificationService.startPolling(30000);
  }

  ngOnDestroy(): void {
    // Stop polling when component is destroyed
    this.notificationService.stopPolling();
  }

  /**
   * Filter notifications based on active tab
   */
  getFilteredNotifications(notifications: Notification[]): Notification[] {
    if (this.activeTab === 'all') {
      return notifications.filter(n =>
        n.type === NotificationType.CONTACT_ADDED ||
        n.type === NotificationType.CONTACT_REMOVED
      );
    } else if (this.activeTab === 'added') {
      return notifications.filter(n => n.type === NotificationType.CONTACT_ADDED);
    } else if (this.activeTab === 'removed') {
      return notifications.filter(n => n.type === NotificationType.CONTACT_REMOVED);
    }
    return notifications;
  }

  /**
   * Set active tab
   */
  setActiveTab(tab: 'all' | 'added' | 'removed'): void {
    this.activeTab = tab;
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    this.notificationService.markAsRead(notificationId).subscribe();
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe();
  }

  /**
   * Get contact metadata from notification
   */
  getContactMetadata(notification: Notification): ContactNotificationMetadata | null {
    if (notification.metadata &&
        (notification.type === NotificationType.CONTACT_ADDED ||
         notification.type === NotificationType.CONTACT_REMOVED)) {
      return notification.metadata as ContactNotificationMetadata;
    }
    return null;
  }

  /**
   * Format notification date
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Teraz';
    if (diffMins < 60) return `${diffMins} min`;
    if (diffHours < 24) return `${diffHours} godz`;
    if (diffDays === 1) return 'Wczoraj';
    if (diffDays < 7) return `${diffDays} dni temu`;

    return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
  }

  /**
   * Get relative time for display
   */
  getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'teraz';
    if (diffMins < 60) return `${diffMins} min`;
    if (diffHours < 24) return `${diffHours} godz`;
    if (diffDays === 1) return '1 dzień';
    if (diffDays < 7) return `${diffDays} dni`;

    return `${Math.floor(diffDays / 7)} tyg`;
  }
}
