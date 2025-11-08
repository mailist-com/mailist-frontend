export interface OverviewStats {
  totalContacts: number;
  contactsLastMonth: number;
  contactsChangePercentage: string;
  contactsChangeType: 'positive' | 'negative';

  sentEmails30Days: number;
  sentEmailsPrevious30Days: number;
  sentEmailsChangePercentage: string;
  sentEmailsChangeType: 'positive' | 'negative';

  averageOpenRate: number;
  previousAverageOpenRate: number;
  openRateChangePercentage: string;
  openRateChangeType: 'positive' | 'negative';

  averageClickRate: number;
  previousAverageClickRate: number;
  clickRateChangePercentage: string;
  clickRateChangeType: 'positive' | 'negative';
}

export interface CampaignStats {
  campaignId: string;
  campaignName: string;
  subject: string;
  status: string;
  sent: number;
  opens: number;
  clicks: number;
  openRate: number;
  clickRate: number;
  sentDate: string;
}

export interface RecentCampaigns {
  campaigns: CampaignStats[];
}

export interface GrowthData {
  contactsByMonth: number[];
  sentEmailsByMonth: number[];
  monthLabels: string[];
}

export interface ActivityItem {
  type: string;
  message: string;
  timestamp: string;
  icon: string;
}

export interface ActivityFeed {
  activities: ActivityItem[];
}
