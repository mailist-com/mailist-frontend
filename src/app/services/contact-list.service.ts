import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ContactList, ContactListSubscription, ListImportResult, ListImportMapping, SmartListCondition } from '../models/contact-list.model';
import { ApiService, ApiResponse } from '../core/api/api.service';

@Injectable({
  providedIn: 'root'
})
export class ContactListService {
  constructor(private api: ApiService) {}

  // Simple Observable methods - just return data from API
  getLists(): Observable<ContactList[]> {
    return this.api.get<ApiResponse<ContactList[]>>('lists')
      .pipe(map(response => response.data));
  }

  getList(id: string): Observable<ContactList> {
    return this.api.get<ApiResponse<ContactList>>(`lists/${id}`)
      .pipe(map(response => response.data));
  }

  createList(list: Omit<ContactList, 'id' | 'createdAt' | 'updatedAt' | 'subscriberCount' | 'unsubscribedCount' | 'cleanedCount' | 'bouncedCount'>): Observable<ContactList> {
    return this.api.post<ApiResponse<ContactList>>('lists', list)
      .pipe(map(response => response.data));
  }

  updateList(id: string, updates: Partial<ContactList>): Observable<ContactList> {
    return this.api.put<ApiResponse<ContactList>>(`lists/${id}`, updates)
      .pipe(map(response => response.data));
  }

  deleteList(id: string): Observable<void> {
    return this.api.delete<ApiResponse<void>>(`lists/${id}`)
      .pipe(map(() => undefined));
  }

  subscribeContact(contactId: string, listId: string, source: 'manual' | 'import' | 'form' | 'api' = 'manual'): Observable<ContactListSubscription> {
    return this.api.post<ApiResponse<ContactListSubscription>>(`lists/${listId}/subscribe`, { contactId, source })
      .pipe(map(response => response.data));
  }

  unsubscribeContact(contactId: string, listId: string): Observable<void> {
    return this.api.post<ApiResponse<void>>(`lists/${listId}/unsubscribe`, { contactId })
      .pipe(map(() => undefined));
  }

  getListSubscriptions(listId: string): Observable<ContactListSubscription[]> {
    return this.api.get<ApiResponse<ContactListSubscription[]>>(`lists/${listId}/subscriptions`)
      .pipe(map(response => response.data));
  }

  getContactSubscriptions(contactId: string): Observable<ContactListSubscription[]> {
    return this.api.get<ApiResponse<ContactListSubscription[]>>(`contacts/${contactId}/subscriptions`)
      .pipe(map(response => response.data));
  }

  importContacts(listId: string, csvData: string, mapping: ListImportMapping[]): Observable<ListImportResult> {
    return this.api.post<ApiResponse<ListImportResult>>(`lists/${listId}/import`, { csvData, mapping })
      .pipe(map(response => response.data));
  }

  exportContacts(listId: string, format: 'csv' | 'xlsx' = 'csv'): Observable<Blob> {
    return this.api.get(`lists/${listId}/export`, {
      params: { format },
      responseType: 'blob' as any
    }) as Observable<Blob>;
  }

  createSmartList(name: string, description: string, conditions: SmartListCondition[]): Observable<ContactList> {
    const smartList = {
      name,
      description,
      type: 'smart' as const,
      status: 'active' as const,
      conditions,
      settings: {
        doubleOptIn: false,
        welcomeEmail: false,
        notifyOnSubscribe: false,
        notifyOnUnsubscribe: false,
        allowPublicSubscription: false,
        requireNameOnSignup: false,
        requirePhoneOnSignup: false,
        respectUnsubscribes: true,
        respectBounces: true
      },
      customFields: [],
      tags: []
    };

    return this.createList(smartList);
  }

  getListStatistics(): Observable<{
    totalLists: number;
    activeLists: number;
    totalSubscribers: number;
    averageEngagement: number;
  }> {
    return this.api.get<ApiResponse<any>>('lists/statistics')
      .pipe(map(response => response.data));
  }

  exportList(listId: string, format: 'csv' | 'xlsx' = 'csv'): Observable<Blob> {
    return this.exportContacts(listId, format);
  }

  exportAllLists(format: 'csv' | 'xlsx' = 'csv'): Observable<Blob> {
    return this.api.get(`lists/export-all`, {
      params: { format },
      responseType: 'blob' as any
    }) as Observable<Blob>;
  }
}
