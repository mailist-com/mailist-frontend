export interface Contact {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  organization?: string;
  tags: string[];
  customFields: CustomField[];
  lists: string[];
  status: ContactStatus;
  subscriptionStatus: SubscriptionStatus;
  createdAt: Date;
  updatedAt: Date;
  lastActivity?: Date;
  engagementScore?: number;
  location?: ContactLocation;
  socialProfiles?: SocialProfile[];
}

export interface CustomField {
  id: string;
  name: string;
  value: string | number | boolean | Date;
  type: 'text' | 'number' | 'date' | 'boolean' | 'textarea' | 'dropdown';
}

export interface ContactLocation {
  country?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  timezone?: string;
}

export interface SocialProfile {
  platform: 'facebook' | 'twitter' | 'linkedin' | 'instagram' | 'other';
  url: string;
}

export type ContactStatus = 'active' | 'unconfirmed' | 'unsubscribed' | 'bounced' | 'blocked';
export type SubscriptionStatus = 'subscribed' | 'unsubscribed' | 'pending' | 'cleaned';

export interface ContactFilter {
  search?: string;
  status?: ContactStatus[];
  subscriptionStatus?: SubscriptionStatus[];
  lists?: string[];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
    field: 'createdAt' | 'updatedAt' | 'lastActivity';
  };
  customFields?: {
    fieldId: string;
    operator: 'equals' | 'contains' | 'greater' | 'less' | 'between';
    value: any;
  }[];
}

export interface ContactSegment {
  id: string;
  name: string;
  description?: string;
  conditions: SegmentCondition[];
  contactCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SegmentCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater' | 'less' | 'between' | 'exists' | 'not_exists';
  value: any;
  logicalOperator?: 'and' | 'or';
}