export interface ApiKey {
  id: string;
  name: string;
  key: string;
  status: ApiKeyStatus;
  permissions: ApiKeyPermission[];
  lastUsedAt?: Date;
  requestCount: number;
  createdAt: Date;
  expiresAt?: Date;
}

export type ApiKeyStatus = 'active' | 'inactive' | 'expired';

export type ApiKeyPermission =
  | 'contacts.read'
  | 'contacts.write'
  | 'contacts.delete'
  | 'lists.read'
  | 'lists.write'
  | 'campaigns.read'
  | 'campaigns.write'
  | 'automation.read'
  | 'automation.write';

export interface ApiKeyStatistics {
  totalKeys: number;
  activeKeys: number;
  inactiveKeys: number;
  totalRequests: number;
  recentActivity: ApiKeyActivity[];
}

export interface ApiKeyActivity {
  id: string;
  apiKeyId: string;
  apiKeyName: string;
  endpoint: string;
  method: string;
  statusCode: number;
  timestamp: Date;
  ipAddress: string;
}

export interface CreateApiKeyDTO {
  name: string;
  permissions: ApiKeyPermission[];
  expiresAt?: Date;
}
