import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, delay, map, of, throwError } from 'rxjs';
import {
  ApiKey,
  ApiKeyStatistics,
  ApiKeyActivity,
  CreateApiKeyDTO,
  CreateApiKeyResponse,
  ApiKeyStatus,
  ApiKeyPermission,
  PermissionInfo,
} from '../models/api-key.model';

@Injectable({
  providedIn: 'root',
})
export class ApiKeyService {
  private apiKeysSubject = new BehaviorSubject<ApiKey[]>(this.getMockApiKeys());
  public apiKeys$ = this.apiKeysSubject.asObservable();

  private activitiesSubject = new BehaviorSubject<ApiKeyActivity[]>(
    this.getMockActivities()
  );
  public activities$ = this.activitiesSubject.asObservable();

  constructor() {}

  /**
   * Get all API keys
   */
  getApiKeys(): Observable<ApiKey[]> {
    return of(this.apiKeysSubject.value).pipe(delay(500));
  }

  /**
   * Get API key by ID
   */
  getApiKeyById(id: string): Observable<ApiKey | null> {
    return this.apiKeys$.pipe(
      map((keys) => keys.find((k) => k.id === id) || null),
      delay(300)
    );
  }

  /**
   * Create a new API key
   */
  createApiKey(keyData: CreateApiKeyDTO): Observable<CreateApiKeyResponse> {
    const plainKey = this.generateApiKey();
    const newApiKey: ApiKey = {
      id: this.generateId(),
      name: keyData.name,
      description: keyData.description,
      key: plainKey,
      prefix: plainKey.split('_')[0] + '_' + plainKey.split('_')[1] + '_',
      status: 'ACTIVE',
      permissions: keyData.permissions,
      totalCalls: 0,
      createdAt: new Date(),
      expiresAt: keyData.expiresAt,
    };

    const currentKeys = this.apiKeysSubject.value;
    this.apiKeysSubject.next([newApiKey, ...currentKeys]);

    const response: CreateApiKeyResponse = {
      apiKey: newApiKey,
      plainKey: plainKey,
      message: 'API key created successfully. Save it now, it won\'t be shown again!',
    };

    return of(response).pipe(delay(800));
  }

  /**
   * Update an existing API key
   */
  updateApiKey(id: string, updates: Partial<ApiKey>): Observable<ApiKey> {
    const currentKeys = this.apiKeysSubject.value;
    const keyIndex = currentKeys.findIndex((k) => k.id === id);

    if (keyIndex === -1) {
      return throwError(() => new Error('API key not found'));
    }

    const updatedKey: ApiKey = {
      ...currentKeys[keyIndex],
      ...updates,
    };

    const updatedKeys = [...currentKeys];
    updatedKeys[keyIndex] = updatedKey;
    this.apiKeysSubject.next(updatedKeys);

    return of(updatedKey).pipe(delay(800));
  }

  /**
   * Revoke an API key (change status to REVOKED)
   */
  revokeApiKey(id: string): Observable<boolean> {
    const currentKeys = this.apiKeysSubject.value;
    const keyIndex = currentKeys.findIndex((k) => k.id === id);

    if (keyIndex === -1) {
      return throwError(() => new Error('API key not found'));
    }

    const updatedKeys = [...currentKeys];
    updatedKeys[keyIndex] = {
      ...updatedKeys[keyIndex],
      status: 'REVOKED',
      updatedAt: new Date(),
    };

    this.apiKeysSubject.next(updatedKeys);
    return of(true).pipe(delay(500));
  }

  /**
   * Delete an API key permanently
   */
  deleteApiKey(id: string): Observable<boolean> {
    const currentKeys = this.apiKeysSubject.value;
    const filteredKeys = currentKeys.filter((k) => k.id !== id);

    if (filteredKeys.length === currentKeys.length) {
      return throwError(() => new Error('API key not found'));
    }

    this.apiKeysSubject.next(filteredKeys);
    return of(true).pipe(delay(500));
  }

  /**
   * Regenerate an API key
   */
  regenerateApiKey(id: string): Observable<ApiKey> {
    return this.updateApiKey(id, {
      key: this.generateApiKey(),
      requestCount: 0,
      lastUsedAt: undefined,
    });
  }

  /**
   * Get API key statistics
   */
  getStatistics(): Observable<ApiKeyStatistics> {
    const keys = this.apiKeysSubject.value;
    const activities = this.activitiesSubject.value;

    // Calculate top endpoints
    const endpointCounts: Record<string, number> = {};
    activities.forEach((activity) => {
      endpointCounts[activity.endpoint] =
        (endpointCounts[activity.endpoint] || 0) + 1;
    });

    const stats: ApiKeyStatistics = {
      totalKeys: keys.length,
      activeKeys: keys.filter((k) => k.status === 'ACTIVE').length,
      totalCalls: keys.reduce((sum, k) => sum + k.totalCalls, 0),
      topEndpoints: endpointCounts,
    };

    return of(stats).pipe(delay(400));
  }

  /**
   * Get available permissions
   */
  getAvailablePermissions(): Observable<PermissionInfo[]> {
    const permissions: PermissionInfo[] = [
      {
        permission: 'contacts.read',
        description: 'Read contacts',
      },
      {
        permission: 'contacts.write',
        description: 'Create and update contacts',
      },
      {
        permission: 'contacts.delete',
        description: 'Delete contacts',
      },
      {
        permission: 'lists.read',
        description: 'Read lists',
      },
      {
        permission: 'lists.write',
        description: 'Create and update lists',
      },
      {
        permission: 'campaigns.read',
        description: 'Read campaigns',
      },
      {
        permission: 'campaigns.write',
        description: 'Create and update campaigns',
      },
      {
        permission: 'campaigns.send',
        description: 'Send campaigns',
      },
      {
        permission: 'automation.read',
        description: 'Read automation',
      },
      {
        permission: 'automation.write',
        description: 'Create and update automation',
      },
      {
        permission: '*',
        description: 'Full access (admin)',
      },
    ];

    return of(permissions).pipe(delay(300));
  }

  /**
   * Get activities for a specific API key
   */
  getApiKeyActivities(apiKeyId: string): Observable<ApiKeyActivity[]> {
    const activities = this.activitiesSubject.value.filter(
      (a) => a.apiKeyId === apiKeyId
    );
    return of(activities).pipe(delay(400));
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `ak_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a random API key
   */
  private generateApiKey(): string {
    const prefix = 'mlst';
    const random = Array.from({ length: 48 }, () =>
      Math.random().toString(36).charAt(2)
    ).join('');
    return `${prefix}_${random}`;
  }

  /**
   * Get mock API keys data
   */
  private getMockApiKeys(): ApiKey[] {
    return [
      {
        id: 'ak_1',
        name: 'Formularz kontaktowy - Strona główna',
        description: 'Key for production environment',
        key: 'mlst_live_4f8d9a2b6e1c3h5j7k9m2n4p6r8s0t2v4x6z',
        prefix: 'mlst_live_',
        status: 'ACTIVE',
        permissions: ['contacts.write', 'lists.read', 'lists.write'],
        totalCalls: 1547,
        lastUsedAt: new Date('2025-11-04T14:30:00'),
        lastUsedIpAddress: '192.168.1.100',
        createdAt: new Date('2025-09-15T10:00:00'),
        updatedAt: new Date('2025-11-04T14:30:00'),
      },
      {
        id: 'ak_2',
        name: 'Newsletter subscription widget',
        description: 'API key for newsletter widget',
        key: 'mlst_live_8x6z4v2t0s8r6p4n2m9k7j5h3c1e6b2a9d4f',
        prefix: 'mlst_live_',
        status: 'ACTIVE',
        permissions: ['contacts.write', 'lists.write'],
        totalCalls: 3421,
        lastUsedAt: new Date('2025-11-05T09:15:00'),
        lastUsedIpAddress: '192.168.1.101',
        createdAt: new Date('2025-08-20T15:30:00'),
        updatedAt: new Date('2025-11-05T09:15:00'),
      },
      {
        id: 'ak_3',
        name: 'Webhook - Integracja e-commerce',
        description: 'Integration with e-commerce platform',
        key: 'mlst_live_2d4f6h8j0k2m4n6p8r0s2t4v6x8z0a2c4e6g',
        prefix: 'mlst_live_',
        status: 'ACTIVE',
        permissions: [
          'contacts.read',
          'contacts.write',
          'lists.read',
          'campaigns.read',
        ],
        totalCalls: 8956,
        lastUsedAt: new Date('2025-11-05T10:45:00'),
        lastUsedIpAddress: '192.168.1.150',
        createdAt: new Date('2025-07-10T09:00:00'),
        updatedAt: new Date('2025-11-05T10:45:00'),
      },
      {
        id: 'ak_4',
        name: 'Test API Key - Development',
        description: 'Testing key for development',
        key: 'mlst_test_9g8e6c4a2z0x8v6t4s2r0p8n6m4k2j0h8f6d',
        prefix: 'mlst_test_',
        status: 'REVOKED',
        permissions: ['contacts.read', 'lists.read'],
        totalCalls: 234,
        lastUsedAt: new Date('2025-10-15T16:20:00'),
        lastUsedIpAddress: '192.168.1.200',
        createdAt: new Date('2025-06-01T12:00:00'),
        updatedAt: new Date('2025-10-20T10:00:00'),
      },
      {
        id: 'ak_5',
        name: 'Landing page - Promocja Black Friday',
        description: 'Temporary key for Black Friday campaign',
        key: 'mlst_live_5h7j9k1m3n5p7r9s1t3v5x7z9a1c3e5g7i9k',
        prefix: 'mlst_live_',
        status: 'EXPIRED',
        permissions: ['contacts.write', 'lists.write'],
        totalCalls: 2891,
        lastUsedAt: new Date('2025-11-30T23:59:00'),
        lastUsedIpAddress: '192.168.1.105',
        createdAt: new Date('2025-11-01T08:00:00'),
        updatedAt: new Date('2025-11-30T23:59:59'),
        expiresAt: new Date('2025-11-30T23:59:59'),
      },
    ];
  }

  /**
   * Get mock activities data
   */
  private getMockActivities(): ApiKeyActivity[] {
    const keys = this.getMockApiKeys();
    return [
      {
        id: 'act_1',
        apiKeyId: 'ak_2',
        apiKeyName: 'Newsletter subscription widget',
        endpoint: '/api/v1/contacts',
        method: 'POST',
        statusCode: 201,
        timestamp: new Date('2025-11-05T10:45:00'),
        ipAddress: '192.168.1.100',
      },
      {
        id: 'act_2',
        apiKeyId: 'ak_3',
        apiKeyName: 'Webhook - Integracja e-commerce',
        endpoint: '/api/v1/contacts',
        method: 'POST',
        statusCode: 201,
        timestamp: new Date('2025-11-05T10:43:00'),
        ipAddress: '192.168.1.150',
      },
      {
        id: 'act_3',
        apiKeyId: 'ak_1',
        apiKeyName: 'Formularz kontaktowy - Strona główna',
        endpoint: '/api/v1/lists',
        method: 'GET',
        statusCode: 200,
        timestamp: new Date('2025-11-05T10:40:00'),
        ipAddress: '192.168.1.100',
      },
      {
        id: 'act_4',
        apiKeyId: 'ak_3',
        apiKeyName: 'Webhook - Integracja e-commerce',
        endpoint: '/api/v1/campaigns',
        method: 'GET',
        statusCode: 200,
        timestamp: new Date('2025-11-05T10:38:00'),
        ipAddress: '192.168.1.150',
      },
      {
        id: 'act_5',
        apiKeyId: 'ak_2',
        apiKeyName: 'Newsletter subscription widget',
        endpoint: '/api/v1/contacts',
        method: 'POST',
        statusCode: 400,
        timestamp: new Date('2025-11-05T10:35:00'),
        ipAddress: '192.168.1.100',
      },
      {
        id: 'act_6',
        apiKeyId: 'ak_1',
        apiKeyName: 'Formularz kontaktowy - Strona główna',
        endpoint: '/api/v1/contacts',
        method: 'POST',
        statusCode: 201,
        timestamp: new Date('2025-11-05T10:30:00'),
        ipAddress: '192.168.1.100',
      },
      {
        id: 'act_7',
        apiKeyId: 'ak_3',
        apiKeyName: 'Webhook - Integracja e-commerce',
        endpoint: '/api/v1/contacts/bulk',
        method: 'POST',
        statusCode: 201,
        timestamp: new Date('2025-11-05T10:25:00'),
        ipAddress: '192.168.1.150',
      },
      {
        id: 'act_8',
        apiKeyId: 'ak_2',
        apiKeyName: 'Newsletter subscription widget',
        endpoint: '/api/v1/contacts',
        method: 'POST',
        statusCode: 201,
        timestamp: new Date('2025-11-05T10:20:00'),
        ipAddress: '192.168.1.100',
      },
      {
        id: 'act_9',
        apiKeyId: 'ak_1',
        apiKeyName: 'Formularz kontaktowy - Strona główna',
        endpoint: '/api/v1/lists/123/contacts',
        method: 'POST',
        statusCode: 201,
        timestamp: new Date('2025-11-05T10:15:00'),
        ipAddress: '192.168.1.100',
      },
      {
        id: 'act_10',
        apiKeyId: 'ak_3',
        apiKeyName: 'Webhook - Integracja e-commerce',
        endpoint: '/api/v1/contacts',
        method: 'GET',
        statusCode: 200,
        timestamp: new Date('2025-11-05T10:10:00'),
        ipAddress: '192.168.1.150',
      },
    ];
  }
}
