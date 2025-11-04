export interface Automation {
  id: string;
  name: string;
  description?: string;
  status: AutomationStatus;
  type: AutomationType;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  conditions: AutomationCondition[];
  settings: AutomationSettings;
  statistics: AutomationStatistics;
  createdAt: Date;
  updatedAt: Date;
  lastRunAt?: Date;
  flowData?: any; // Flow editor data (IFlowState)
}

export type AutomationStatus = 'active' | 'inactive' | 'draft' | 'paused';
export type AutomationType = 'welcome_series' | 'drip_campaign' | 'behavioral' | 'date_based' | 'tag_based' | 'custom';

export interface AutomationTrigger {
  type: TriggerType;
  conditions: TriggerCondition[];
  settings: TriggerSettings;
}

export type TriggerType = 
  | 'contact_subscribed' 
  | 'contact_tagged' 
  | 'email_opened' 
  | 'email_clicked' 
  | 'form_submitted' 
  | 'date_reached' 
  | 'custom_field_changed' 
  | 'website_visited' 
  | 'purchase_made' 
  | 'automation_completed';

export interface TriggerCondition {
  field: string;
  operator: string;
  value: any;
}

export interface TriggerSettings {
  listIds?: string[];
  tagIds?: string[];
  delay?: AutomationDelay;
  once_per_contact?: boolean;
  run_once?: boolean;
}

export interface AutomationAction {
  id: string;
  type: ActionType;
  settings: ActionSettings;
  delay?: AutomationDelay;
  conditions?: AutomationCondition[];
  order: number;
}

export type ActionType = 
  | 'send_email' 
  | 'add_tag' 
  | 'remove_tag' 
  | 'add_to_list' 
  | 'remove_from_list' 
  | 'update_custom_field' 
  | 'wait' 
  | 'send_sms' 
  | 'webhook' 
  | 'create_deal' 
  | 'update_contact' 
  | 'end_automation';

export interface ActionSettings {
  emailId?: string;
  emailTemplate?: string;
  tagIds?: string[];
  listIds?: string[];
  customFields?: { [key: string]: any };
  webhookUrl?: string;
  smsMessage?: string;
  waitDuration?: AutomationDelay;
  conditions?: AutomationCondition[];
}

export interface AutomationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater' | 'less' | 'between' | 'exists' | 'not_exists';
  value: any;
  logicalOperator?: 'and' | 'or';
}

export interface AutomationDelay {
  amount: number;
  unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
}

export interface AutomationSettings {
  timezone: string;
  sendTime?: {
    hour: number;
    minute: number;
  };
  sendDays?: number[];
  stopOnGoalReached?: boolean;
  goalType?: 'email_opened' | 'link_clicked' | 'form_submitted' | 'tag_applied' | 'custom';
  maxRunsPerContact?: number;
  respectUnsubscribes: boolean;
  respectBounces: boolean;
}

export interface AutomationStatistics {
  totalRuns: number;
  activeContacts: number;
  completedContacts: number;
  emailsSent: number;
  emailsOpened: number;
  emailsClicked: number;
  conversions: number;
  revenue?: number;
  performance: {
    openRate: number;
    clickRate: number;
    conversionRate: number;
  };
}

export interface AutomationRun {
  id: string;
  automationId: string;
  contactId: string;
  status: 'running' | 'completed' | 'paused' | 'failed';
  currentActionIndex: number;
  startedAt: Date;
  completedAt?: Date;
  nextActionAt?: Date;
  data: { [key: string]: any };
}