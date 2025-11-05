export interface Campaign {
  id: string;
  name: string;
  subject: string;
  preheader?: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  status: CampaignStatus;
  type: CampaignType;
  content: CampaignContent;
  recipients: CampaignRecipients;
  schedule?: CampaignSchedule;
  statistics: CampaignStatistics;
  settings: CampaignSettings;
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date;
  scheduledFor?: Date;
}

export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
export type CampaignType = 'regular' | 'ab_test' | 'rss' | 'automated';

export interface CampaignContent {
  html?: string;
  text?: string;
  templateId?: string;
  design?: any; // JSON for email builder
}

export interface CampaignRecipients {
  type: 'all' | 'lists' | 'segments' | 'tags';
  listIds?: string[];
  segmentIds?: string[];
  tagIds?: string[];
  excludeListIds?: string[];
  excludeTagIds?: string[];
  totalCount?: number;
}

export interface CampaignSchedule {
  type: 'immediate' | 'scheduled' | 'timezone_based';
  scheduledAt?: Date;
  timezone?: string;
  sendTime?: {
    hour: number;
    minute: number;
  };
}

export interface CampaignStatistics {
  sent: number;
  delivered: number;
  opens: number;
  uniqueOpens: number;
  clicks: number;
  uniqueClicks: number;
  bounces: number;
  softBounces: number;
  hardBounces: number;
  unsubscribes: number;
  complaints: number;
  performance: {
    openRate: number;
    clickRate: number;
    clickToOpenRate: number;
    bounceRate: number;
    unsubscribeRate: number;
  };
}

export interface CampaignSettings {
  trackOpens: boolean;
  trackClicks: boolean;
  googleAnalytics?: {
    enabled: boolean;
    campaign?: string;
    source?: string;
    medium?: string;
  };
  autoTweet?: boolean;
  autoFacebookPost?: boolean;
  authenticateWithDKIM?: boolean;
}

export interface CampaignABTest {
  enabled: boolean;
  testType: 'subject' | 'from_name' | 'content';
  variantA: {
    subject?: string;
    fromName?: string;
    content?: CampaignContent;
  };
  variantB: {
    subject?: string;
    fromName?: string;
    content?: CampaignContent;
  };
  testPercentage: number;
  winnerCriteria: 'opens' | 'clicks';
  sendWinnerAfter: number; // hours
}
