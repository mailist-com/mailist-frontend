/**
 * Notification type enum
 */
export enum NotificationType {
  CONTACT_ADDED = 'contact_added',
  CONTACT_REMOVED = 'contact_removed',
  CAMPAIGN_SENT = 'campaign_sent',
  AUTOMATION_TRIGGERED = 'automation_triggered',
  SYSTEM = 'system'
}

/**
 * Notification status enum
 */
export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read'
}

/**
 * Notification metadata for contact-related notifications
 */
export interface ContactNotificationMetadata {
  contactEmail: string;
  listName: string;
  listId: string;
}

/**
 * Notification metadata for campaign-related notifications
 */
export interface CampaignNotificationMetadata {
  campaignName: string;
  campaignId: string;
  recipientCount?: number;
}

/**
 * Notification model
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  status: NotificationStatus;
  metadata?: ContactNotificationMetadata | CampaignNotificationMetadata | Record<string, any>;
  createdAt: string;
  readAt?: string;
}

/**
 * Notification filter
 */
export interface NotificationFilter {
  type?: NotificationType[];
  status?: NotificationStatus;
  page?: number;
  pageSize?: number;
}

/**
 * Notification statistics
 */
export interface NotificationStats {
  total: number;
  unread: number;
  byType: {
    [key in NotificationType]?: number;
  };
}
