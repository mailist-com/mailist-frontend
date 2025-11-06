import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap, interval } from 'rxjs';
import {
  Notification,
  NotificationFilter,
  NotificationStats,
  NotificationType,
  NotificationStatus
} from '../models/notification.model';
import { ApiService, ApiResponse, PaginatedResponse } from '../core/api/api.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private statsSubject = new BehaviorSubject<NotificationStats>({
    total: 0,
    unread: 0,
    byType: {}
  });

  notifications$ = this.notificationsSubject.asObservable();
  stats$ = this.statsSubject.asObservable();

  // Polling interval (optional - for real-time updates)
  private pollingInterval?: any;

  constructor(private api: ApiService) {}

  /**
   * Get all notifications with optional filtering
   */
  getNotifications(filter?: NotificationFilter): Observable<Notification[]> {
    const params: any = {};
    if (filter?.type) params.type = filter.type.join(',');
    if (filter?.status) params.status = filter.status;
    if (filter?.page) params.page = filter.page;
    if (filter?.pageSize) params.pageSize = filter.pageSize;

    return this.api.get<ApiResponse<Notification[]>>('notifications', { params })
      .pipe(
        map(response => response.data),
        tap(notifications => this.notificationsSubject.next(notifications))
      );
  }

  /**
   * Get paginated notifications
   */
  getNotificationsPaginated(
    page: number = 1,
    pageSize: number = 20,
    filter?: NotificationFilter
  ): Observable<PaginatedResponse<Notification>> {
    const params: any = {};
    if (filter?.type) params.type = filter.type.join(',');
    if (filter?.status) params.status = filter.status;

    return this.api.getPaginated<Notification>('notifications', page, pageSize, params);
  }

  /**
   * Get a single notification by ID
   */
  getNotification(id: string): Observable<Notification> {
    return this.api.get<ApiResponse<Notification>>(`notifications/${id}`)
      .pipe(map(response => response.data));
  }

  /**
   * Mark notification as read
   */
  markAsRead(id: string): Observable<Notification> {
    return this.api.patch<ApiResponse<Notification>>(`notifications/${id}/read`, {})
      .pipe(
        map(response => response.data),
        tap(updatedNotification => {
          const notifications = this.notificationsSubject.value;
          const index = notifications.findIndex(n => n.id === id);
          if (index !== -1) {
            notifications[index] = updatedNotification;
            this.notificationsSubject.next([...notifications]);
          }
          // Update stats
          this.loadStats();
        })
      );
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): Observable<boolean> {
    return this.api.post<ApiResponse<void>>('notifications/mark-all-read', {})
      .pipe(
        map(() => true),
        tap(() => {
          const notifications = this.notificationsSubject.value;
          const updated = notifications.map(n => ({
            ...n,
            status: NotificationStatus.READ,
            readAt: new Date().toISOString()
          }));
          this.notificationsSubject.next(updated);
          // Update stats
          this.loadStats();
        })
      );
  }

  /**
   * Delete a notification
   */
  deleteNotification(id: string): Observable<boolean> {
    return this.api.delete<ApiResponse<void>>(`notifications/${id}`)
      .pipe(
        map(() => true),
        tap(() => {
          const notifications = this.notificationsSubject.value;
          const filtered = notifications.filter(n => n.id !== id);
          this.notificationsSubject.next(filtered);
          // Update stats
          this.loadStats();
        })
      );
  }

  /**
   * Delete all read notifications
   */
  deleteAllRead(): Observable<boolean> {
    return this.api.delete<ApiResponse<void>>('notifications/read')
      .pipe(
        map(() => true),
        tap(() => {
          const notifications = this.notificationsSubject.value;
          const filtered = notifications.filter(n => n.status === NotificationStatus.UNREAD);
          this.notificationsSubject.next(filtered);
          // Update stats
          this.loadStats();
        })
      );
  }

  /**
   * Get notification statistics
   */
  getStats(): Observable<NotificationStats> {
    return this.api.get<ApiResponse<NotificationStats>>('notifications/stats')
      .pipe(
        map(response => response.data),
        tap(stats => this.statsSubject.next(stats))
      );
  }

  /**
   * Load statistics (used internally)
   */
  private loadStats(): void {
    this.getStats().subscribe();
  }

  /**
   * Start polling for new notifications
   * @param intervalMs Polling interval in milliseconds (default: 30000 = 30 seconds)
   */
  startPolling(intervalMs: number = 30000): void {
    this.stopPolling();
    this.pollingInterval = interval(intervalMs).subscribe(() => {
      this.getNotifications().subscribe();
      this.getStats().subscribe();
    });
  }

  /**
   * Stop polling for notifications
   */
  stopPolling(): void {
    if (this.pollingInterval) {
      this.pollingInterval.unsubscribe();
      this.pollingInterval = undefined;
    }
  }

  /**
   * Initialize service (load initial data)
   */
  initialize(): void {
    this.getNotifications().subscribe();
    this.getStats().subscribe();
  }

  /**
   * Clean up on service destroy
   */
  ngOnDestroy(): void {
    this.stopPolling();
  }
}
