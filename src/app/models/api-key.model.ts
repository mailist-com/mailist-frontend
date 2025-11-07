export interface ApiKey {
  id: string;
  name: string;
  description?: string;
  key: string;
  prefix?: string;
  status: ApiKeyStatus;
  permissions: ApiKeyPermission[];
  lastUsedAt?: Date;
  lastUsedIpAddress?: string;
  totalCalls: number;
  createdAt: Date;
  updatedAt?: Date;
  expiresAt?: Date;
}

export type ApiKeyStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED';

export type ApiKeyPermission =
  | 'contacts.read'
  | 'contacts.write'
  | 'contacts.delete'
  | 'lists.read'
  | 'lists.write'
  | 'campaigns.read'
  | 'campaigns.write'
  | 'campaigns.send'
  | 'automation.read'
  | 'automation.write'
  | '*';

export interface ApiKeyStatistics {
  totalKeys: number;
  activeKeys: number;
  totalCalls: number;
  topEndpoints: Record<string, number>;
}

export interface ApiKeyActivity {
  id: string;
  apiKeyId: string;
  apiKeyName: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime?: number;
  ipAddress: string;
  userAgent?: string;
  errorMessage?: string;
  timestamp: Date;
}

export interface CreateApiKeyDTO {
  name: string;
  description?: string;
  permissions: ApiKeyPermission[];
  expiresAt?: Date;
}

export interface CreateApiKeyResponse {
  apiKey: ApiKey;
  plainKey: string;
  message: string;
}

export interface PermissionInfo {
  permission: ApiKeyPermission;
  description: string;
}
