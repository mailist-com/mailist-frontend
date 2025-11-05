// Template status types
export type TemplateStatus = 'draft' | 'active' | 'archived';

// Template category types
export type TemplateCategory =
  | 'promotional'
  | 'newsletter'
  | 'welcome'
  | 'transactional'
  | 'announcement'
  | 'event'
  | 'survey'
  | 'other';

// Template content interface
export interface TemplateContent {
  html: string;
  text?: string;
  design?: {
    backgroundColor?: string;
    fontFamily?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
}

// Template statistics
export interface TemplateStatistics {
  usageCount: number;
  lastUsedAt?: Date;
  campaignsCount: number;
  avgOpenRate?: number;
  avgClickRate?: number;
}

// Main template interface
export interface Template {
  id: string;
  name: string;
  subject: string;
  previewText?: string;
  category: TemplateCategory;
  tags: string[];
  content: TemplateContent;
  status: TemplateStatus;
  thumbnailUrl?: string;
  statistics: TemplateStatistics;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  isDefault?: boolean;
}

// Template creation/update DTO
export interface CreateTemplateDTO {
  name: string;
  subject: string;
  previewText?: string;
  category: TemplateCategory;
  tags: string[];
  content: TemplateContent;
  status?: TemplateStatus;
  thumbnailUrl?: string;
}

// Template statistics summary
export interface TemplateStats {
  total: number;
  draft: number;
  active: number;
  archived: number;
  byCategory: Record<TemplateCategory, number>;
}
