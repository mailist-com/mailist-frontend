export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  phone?: string;
  company?: string;
  timezone: string;
  language: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface UserProfile extends User {
  notifications: NotificationSettings;
  preferences: UserPreferences;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  campaignUpdates: boolean;
  automationAlerts: boolean;
  monthlyReports: boolean;
  systemUpdates: boolean;
}

export interface UserPreferences {
  emailSignature?: string;
  defaultFromName?: string;
  defaultFromEmail?: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
}
