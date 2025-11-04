export interface ContactList {
  id: string;
  name: string;
  description?: string;
  type: ListType;
  status: ListStatus;
  subscriberCount: number;
  unsubscribedCount: number;
  cleanedCount: number;
  bouncedCount: number;
  createdAt: Date;
  updatedAt: Date;
  settings: ListSettings;
  customFields: ListCustomField[];
  tags: string[];
}

export type ListType = 'regular' | 'smart' | 'static';
export type ListStatus = 'active' | 'inactive' | 'archived';

export interface ListSettings {
  doubleOptIn: boolean;
  welcomeEmail: boolean;
  welcomeEmailId?: string;
  unsubscribeRedirectUrl?: string;
  confirmationRedirectUrl?: string;
  notifyOnSubscribe: boolean;
  notifyOnUnsubscribe: boolean;
  notificationEmail?: string;
  allowPublicSubscription: boolean;
  requireNameOnSignup: boolean;
  requirePhoneOnSignup: boolean;
  respectUnsubscribes: boolean;
  respectBounces: boolean;
}

export interface ListCustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'textarea' | 'dropdown' | 'checkbox' | 'radio';
  label: string;
  required: boolean;
  defaultValue?: any;
  options?: string[];
  validation?: FieldValidation;
  order: number;
  isVisible: boolean;
}

export interface FieldValidation {
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

export interface ContactListSubscription {
  contactId: string;
  listId: string;
  status: SubscriptionStatus;
  subscribedAt: Date;
  unsubscribedAt?: Date;
  source: SubscriptionSource;
  ipAddress?: string;
  userAgent?: string;
  doubleOptInConfirmedAt?: Date;
}

export type SubscriptionStatus = 'subscribed' | 'unsubscribed' | 'pending' | 'cleaned' | 'bounced';
export type SubscriptionSource = 'manual' | 'import' | 'form' | 'api' | 'landing_page' | 'popup' | 'inline_form';

export interface SmartListCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater' | 'less' | 'between' | 'exists' | 'not_exists' | 'in_list' | 'not_in_list';
  value: any;
  logicalOperator?: 'and' | 'or';
}

export interface ListImportMapping {
  csvColumn: string;
  contactField: string;
  isCustomField: boolean;
  customFieldId?: string;
}

export interface ListImportResult {
  totalRecords: number;
  successfulImports: number;
  failedImports: number;
  duplicateContacts: number;
  errors: ImportError[];
}

export interface ImportError {
  row: number;
  email: string;
  error: string;
  field?: string;
}