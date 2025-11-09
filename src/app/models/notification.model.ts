export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  contactEmail?: string;
  listName?: string;
  actionUrl?: string;
  actionText?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  metadata?: NotificationMetadata;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export type NotificationCategory = 'contact_added' | 'contact_removed' | 'campaign_sent' | 'automation_triggered' | 'system' | 'billing';

export interface NotificationMetadata {
  contactId?: string;
  listId?: string;
  campaignId?: string;
  automationId?: string;
  [key: string]: any;
}

export interface NotificationFilter {
  category?: NotificationCategory | 'all';
  isRead?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byCategory: {
    [key in NotificationCategory]?: number;
  };
}
