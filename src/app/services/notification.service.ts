import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, map, interval } from 'rxjs';
import { Notification, NotificationFilter, NotificationStats, NotificationCategory } from '../models/notification.model';
import { ApiService, PagedData } from '../core/api/api.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiService = inject(ApiService);

  // Signal for unread count (reactive)
  unreadCount = signal<number>(0);

  constructor() {
    // Optionally poll for new notifications every 60 seconds
    // interval(60000).subscribe(() => this.refreshUnreadCount());
  }

  /**
   * Get paginated notifications
   */
  getNotifications(
    page: number = 0,
    pageSize: number = 10,
    filter?: NotificationFilter
  ): Observable<PagedData<Notification>> {
    const params: any = {
      page: page.toString(),
      size: pageSize.toString()
    };

    if (filter?.category && filter.category !== 'all') {
      params.category = filter.category;
    }

    if (filter?.isRead !== undefined) {
      params.isRead = filter.isRead.toString();
    }

    return this.apiService.get<PagedData<any>>('notifications', { params })
      .pipe(
        map(response => ({
          content: response.content?.map((item: any) => this.mapBackendToFrontend(item)) || [],
          page: response.page || {
            size: pageSize,
            number: page,
            totalPages: 0,
            totalElements: 0
          }
        })),
        tap(response => {
          // Update unread count based on response
          const unread = response.content.filter(n => !n.isRead).length;
          if (page === 0) {
            this.unreadCount.set(unread);
          }
        })
      );
  }

  /**
   * Get recent notifications (for dropdown)
   */
  getRecentNotifications(limit: number = 10): Observable<Notification[]> {
    return this.getNotifications(0, limit)
      .pipe(
        map(response => response.content)
      );
  }

  /**
   * Get notifications by category
   */
  getNotificationsByCategory(category: NotificationCategory, page: number = 0, pageSize: number = 10): Observable<PagedData<Notification>> {
    return this.getNotifications(page, pageSize, { category });
  }

  /**
   * Get unread notifications
   */
  getUnreadNotifications(page: number = 0, pageSize: number = 10): Observable<PagedData<Notification>> {
    return this.getNotifications(page, pageSize, { isRead: false });
  }

  /**
   * Get notification by ID
   */
  getNotificationById(id: string): Observable<Notification | null> {
    return this.apiService.get<any>(`notifications/${id}`)
      .pipe(
        map(response => this.mapBackendToFrontend(response))
      );
  }

  /**
   * Mark notification as read
   */
  markAsRead(id: string): Observable<Notification> {
    return this.apiService.put<any>(`notifications/${id}/read`, {})
      .pipe(
        map(response => this.mapBackendToFrontend(response)),
        tap(() => {
          // Decrease unread count
          this.unreadCount.update(count => Math.max(0, count - 1));
        })
      );
  }

  /**
   * Mark notification as unread
   */
  markAsUnread(id: string): Observable<Notification> {
    return this.apiService.put<any>(`notifications/${id}/unread`, {})
      .pipe(
        map(response => this.mapBackendToFrontend(response)),
        tap(() => {
          // Increase unread count
          this.unreadCount.update(count => count + 1);
        })
      );
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): Observable<void> {
    return this.apiService.put<void>('notifications/read-all', {})
      .pipe(
        tap(() => {
          this.unreadCount.set(0);
        })
      );
  }

  /**
   * Delete notification
   */
  deleteNotification(id: string): Observable<boolean> {
    return this.apiService.delete<void>(`notifications/${id}`)
      .pipe(
        map(() => true),
        tap(() => this.refreshUnreadCount())
      );
  }

  /**
   * Delete all read notifications
   */
  deleteAllRead(): Observable<void> {
    return this.apiService.delete<void>('notifications/read')
      .pipe(
        tap(() => this.refreshUnreadCount())
      );
  }

  /**
   * Get notification statistics
   */
  getNotificationStats(): Observable<NotificationStats> {
    return this.apiService.get<any>('notifications/stats')
      .pipe(
        map(response => ({
          total: response.total || 0,
          unread: response.unread || 0,
          byCategory: response.byCategory || {}
        })),
        tap(stats => {
          this.unreadCount.set(stats.unread);
        })
      );
  }

  /**
   * Refresh unread count
   */
  refreshUnreadCount(): void {
    this.apiService.get<any>('notifications/unread/count')
      .subscribe({
        next: (response) => {
          this.unreadCount.set(response.count || 0);
        },
        error: (error) => {
          console.error('Error refreshing unread count:', error);
        }
      });
  }

  /**
   * Map backend response to frontend Notification model
   */
  private mapBackendToFrontend(backendData: any): Notification {
    return {
      id: backendData.id?.toString() || '',
      userId: backendData.userId?.toString() || '',
      type: this.mapNotificationType(backendData.type),
      category: this.mapNotificationCategory(backendData),
      title: backendData.title || '',
      message: backendData.message || '',
      contactEmail: backendData.metadata?.contactEmail,
      listName: backendData.metadata?.listName,
      actionUrl: backendData.actionUrl,
      actionText: backendData.actionText,
      isRead: backendData.isRead || backendData.read || false,
      readAt: backendData.readAt ? new Date(backendData.readAt) : undefined,
      createdAt: backendData.createdAt ? new Date(backendData.createdAt) : new Date(),
      metadata: backendData.metadata || {}
    };
  }

  /**
   * Map backend notification type to frontend type
   */
  private mapNotificationType(type: string): 'info' | 'success' | 'warning' | 'error' {
    switch (type?.toLowerCase()) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  }

  /**
   * Map backend data to notification category
   */
  private mapNotificationCategory(data: any): NotificationCategory {
    // Try to determine category from backend data
    if (data.category) {
      return data.category;
    }

    // Fallback logic based on message or metadata
    if (data.message?.includes('dodany') || data.message?.includes('added')) {
      return 'contact_added';
    }
    if (data.message?.includes('usunięty') || data.message?.includes('removed')) {
      return 'contact_removed';
    }
    if (data.message?.includes('campaign') || data.message?.includes('kampani')) {
      return 'campaign_sent';
    }
    if (data.message?.includes('automation') || data.message?.includes('automatyzacj')) {
      return 'automation_triggered';
    }

    return 'system';
  }
}
