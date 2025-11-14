import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  Automation,
  AutomationAction,
  AutomationRun,
  AutomationStatistics,
  AutomationStatus,
  AutomationType,
  TriggerType,
  ActionType
} from '../models/automation.model';
import { environment } from '../../environments/environment';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AutomationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/automation-rules`;

  constructor() {}

  /**
   * Get all automations
   */
  getAutomations(): Observable<Automation[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}`)
      .pipe(map(response => response.data.map(item => this.mapBackendToFrontend(item))));
  }

  /**
   * Get automation by ID
   */
  getAutomationById(id: string): Observable<Automation | null> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => this.mapBackendToFrontend(response.data)));
  }

  /**
   * Create a new automation
   */
  createAutomation(automation: Partial<Automation>): Observable<Automation> {
    const backendPayload = this.mapFrontendToBackend(automation);
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}`, backendPayload)
      .pipe(map(response => this.mapBackendToFrontend(response.data)));
  }

  /**
   * Update an existing automation
   */
  updateAutomation(id: string, updates: Partial<Automation>): Observable<Automation> {
    const backendPayload = this.mapFrontendToBackend(updates);
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}`, backendPayload)
      .pipe(map(response => this.mapBackendToFrontend(response.data)));
  }

  /**
   * Delete an automation
   */
  deleteAutomation(id: string): Observable<boolean> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.success));
  }

  /**
   * Toggle automation status (active <-> inactive)
   */
  toggleAutomationStatus(id: string): Observable<Automation> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${id}/toggle-status`, {})
      .pipe(map(response => this.mapBackendToFrontend(response.data)));
  }

  /**
   * Duplicate an automation
   */
  duplicateAutomation(id: string): Observable<Automation> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${id}/duplicate`, {})
      .pipe(map(response => this.mapBackendToFrontend(response.data)));
  }

  /**
   * Get automation runs (not implemented in backend yet)
   */
  getAutomationRuns(automationId: string): Observable<AutomationRun[]> {
    // TODO: Implement when backend endpoint is ready
    return new Observable(observer => {
      observer.next([]);
      observer.complete();
    });
  }

  /**
   * Get automation statistics
   */
  getAutomationStats(): Observable<{total: number, active: number, draft: number, paused: number, inactive?: number}> {
    return this.http.get<ApiResponse<{total: number, active: number, draft: number, paused: number, inactive: number}>>(`${this.apiUrl}/statistics`)
      .pipe(map(response => response.data));
  }

  /**
   * Map backend response to frontend Automation model
   */
  private mapBackendToFrontend(backendData: any): Automation {
    return {
      id: backendData.id?.toString() || '',
      name: backendData.name || '',
      description: backendData.description,
      status: backendData.isActive ? 'active' : 'inactive',
      type: 'custom' as AutomationType,
      trigger: {
        type: this.mapTriggerType(backendData.triggerType),
        conditions: [],
        settings: {
          once_per_contact: true,
          run_once: false
        }
      },
      actions: [],
      conditions: [],
      settings: {
        timezone: 'UTC',
        respectUnsubscribes: true,
        respectBounces: true
      },
      statistics: {
        totalRuns: 0,
        activeContacts: 0,
        completedContacts: 0,
        emailsSent: 0,
        emailsOpened: 0,
        emailsClicked: 0,
        conversions: 0,
        performance: {
          openRate: 0,
          clickRate: 0,
          conversionRate: 0
        }
      },
      createdAt: backendData.createdAt ? new Date(backendData.createdAt) : new Date(),
      updatedAt: backendData.updatedAt ? new Date(backendData.updatedAt) : new Date(),
      flowData: backendData.flowJson ? JSON.parse(backendData.flowJson) : undefined
    };
  }

  /**
   * Map frontend Automation model to backend payload
   */
  private mapFrontendToBackend(frontendData: Partial<Automation>): any {
    return {
      name: frontendData.name,
      description: frontendData.description,
      triggerType: this.mapTriggerTypeToBackend(frontendData.trigger?.type),
      isActive: frontendData.status === 'active',
      flowJson: frontendData.flowData ? JSON.stringify(frontendData.flowData) : null
    };
  }

  /**
   * Map backend trigger type to frontend
   */
  private mapTriggerType(backendType: string): TriggerType {
    const mapping: Record<string, TriggerType> = {
      'TAG_ADDED': 'contact_tagged',
      'EMAIL_OPENED': 'email_opened',
      'EMAIL_CLICKED': 'email_clicked',
      'CONTACT_CREATED': 'contact_subscribed',
      'FIELD_CHANGED': 'custom_field_changed',
      'DATE_REACHED': 'date_reached'
    };
    return mapping[backendType] || 'contact_tagged';
  }

  /**
   * Map frontend trigger type to backend
   */
  private mapTriggerTypeToBackend(frontendType?: TriggerType): string {
    const mapping: Record<TriggerType, string> = {
      'contact_tagged': 'TAG_ADDED',
      'email_opened': 'EMAIL_OPENED',
      'email_clicked': 'EMAIL_CLICKED',
      'contact_subscribed': 'CONTACT_CREATED',
      'custom_field_changed': 'FIELD_CHANGED',
      'date_reached': 'DATE_REACHED',
      'form_submitted': 'FORM_SUBMITTED',
      'website_visited': 'WEBSITE_VISITED',
      'purchase_made': 'PURCHASE_MADE',
      'automation_completed': 'AUTOMATION_COMPLETED'
    };
    return mapping[frontendType || 'contact_subscribed'] || 'CONTACT_CREATED';
  }

  /**
   * Map backend action type to frontend
   */
  private mapActionType(backendType: string): ActionType {
    const mapping: Record<string, ActionType> = {
      'SEND_EMAIL': 'send_email',
      'ADD_TAG': 'add_tag',
      'REMOVE_TAG': 'remove_tag',
      'UPDATE_FIELD': 'update_custom_field',
      'UPDATE_LEAD_SCORE': 'update_contact'
    };
    return mapping[backendType] || 'send_email';
  }

  /**
   * Map frontend action type to backend
   */
  private mapActionTypeToBackend(frontendType: ActionType): string {
    const mapping: Record<ActionType, string> = {
      'send_email': 'SEND_EMAIL',
      'add_tag': 'ADD_TAG',
      'remove_tag': 'REMOVE_TAG',
      'update_custom_field': 'UPDATE_FIELD',
      'update_contact': 'UPDATE_LEAD_SCORE',
      'add_to_list': 'ADD_TO_LIST',
      'remove_from_list': 'REMOVE_FROM_LIST',
      'wait': 'WAIT',
      'send_sms': 'SEND_SMS',
      'webhook': 'WEBHOOK',
      'create_deal': 'CREATE_DEAL',
      'end_automation': 'END_AUTOMATION'
    };
    return mapping[frontendType] || 'SEND_EMAIL';
  }
}
