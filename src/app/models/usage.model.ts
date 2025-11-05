export interface UsageStatistics {
  period: {
    start: Date;
    end: Date;
  };
  contacts: UsageMetric;
  emails: UsageMetric;
  users: UsageMetric;
  automations: UsageMetric;
  templates: UsageMetric;
  apiCalls: UsageMetric;
  storage: StorageMetric;
}

export interface UsageMetric {
  current: number;
  limit: number;
  percentage: number;
  trend?: number; // percentage change from previous period
}

export interface StorageMetric extends UsageMetric {
  unit: 'MB' | 'GB' | 'TB';
}

export interface UsageHistory {
  date: Date;
  contacts: number;
  emailsSent: number;
  apiCalls: number;
}

export interface UsageAlert {
  id: string;
  type: 'contacts' | 'emails' | 'storage' | 'apiCalls';
  threshold: number;
  current: number;
  limit: number;
  message: string;
  severity: 'warning' | 'critical';
  createdAt: Date;
}
