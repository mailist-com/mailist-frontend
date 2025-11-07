import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
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
import { environment } from '../../environments/environment';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiKeyService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api-keys`;

  constructor() {}

  /**
   * Get all API keys
   */
  getApiKeys(): Observable<ApiKey[]> {
    return this.http.get<ApiResponse<ApiKey[]>>(`${this.apiUrl}`)
      .pipe(map(response => response.data));
  }

  /**
   * Get API key by ID
   */
  getApiKeyById(id: string): Observable<ApiKey | null> {
    return this.http.get<ApiResponse<ApiKey>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  /**
   * Create a new API key
   */
  createApiKey(keyData: CreateApiKeyDTO): Observable<CreateApiKeyResponse> {
    return this.http.post<ApiResponse<CreateApiKeyResponse>>(`${this.apiUrl}`, keyData)
      .pipe(map(response => response.data));
  }

  /**
   * Update an existing API key
   */
  updateApiKey(id: string, updates: { name: string; description?: string; permissions: ApiKeyPermission[] }): Observable<ApiKey> {
    return this.http.put<ApiResponse<ApiKey>>(`${this.apiUrl}/${id}`, updates)
      .pipe(map(response => response.data));
  }

  /**
   * Revoke an API key (change status to REVOKED)
   */
  revokeApiKey(id: string): Observable<boolean> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${id}/revoke`, {})
      .pipe(map(response => response.success));
  }

  /**
   * Delete an API key permanently
   */
  deleteApiKey(id: string): Observable<boolean> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.success));
  }

  /**
   * Regenerate an API key
   */
  regenerateApiKey(id: string): Observable<CreateApiKeyResponse> {
    return this.http.post<ApiResponse<CreateApiKeyResponse>>(`${this.apiUrl}/${id}/regenerate`, {})
      .pipe(map(response => response.data));
  }

  /**
   * Toggle API key status (ACTIVE <-> REVOKED)
   */
  toggleApiKeyStatus(id: string): Observable<ApiKey> {
    return this.http.post<ApiResponse<ApiKey>>(`${this.apiUrl}/${id}/toggle-status`, {})
      .pipe(map(response => response.data));
  }

  /**
   * Get API key statistics
   */
  getStatistics(): Observable<ApiKeyStatistics> {
    return this.http.get<ApiResponse<ApiKeyStatistics>>(`${this.apiUrl}/statistics`)
      .pipe(map(response => response.data));
  }

  /**
   * Get available permissions
   */
  getAvailablePermissions(): Observable<PermissionInfo[]> {
    return this.http.get<ApiResponse<Array<{permission: string, description: string}>>>(`${this.apiUrl}/permissions`)
      .pipe(
        map(response => response.data.map(p => ({
          permission: p.permission as ApiKeyPermission,
          description: p.description
        })))
      );
  }

  /**
   * Get activities for a specific API key
   */
  getApiKeyActivities(apiKeyId: string, page: number = 0, pageSize: number = 50): Observable<{activities: ApiKeyActivity[], pagination: any}> {
    return this.http.get<ApiResponse<{activities: ApiKeyActivity[], pagination: any}>>(`${this.apiUrl}/${apiKeyId}/activities?page=${page}&pageSize=${pageSize}`)
      .pipe(map(response => response.data));
  }
}
