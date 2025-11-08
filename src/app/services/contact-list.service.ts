import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ContactList, ContactListSubscription, ListImportResult, ListImportMapping, SmartListCondition, ListType, ListStatus } from '../models/contact-list.model';
import { ApiService, ApiResponse } from '../core/api/api.service';

@Injectable({
  providedIn: 'root'
})
export class ContactListService {
  constructor(private api: ApiService) {}

  // Simple Observable methods - just return data from API
  getLists(): Observable<ContactList[]> {
    return this.api.get<ApiResponse<any[]>>('lists')
      .pipe(
        map(response => {
          const lists = response.data || [];
          return lists.map(data => ({
            id: data.id?.toString() || '',
            name: data.name || '',
            description: data.description || '',
            type: data.type === 'smart' ? 'smart' as ListType : 'regular' as ListType,
            status: 'active' as ListStatus,
            tags: data.tags || [],
            subscriberCount: data.subscriberCount || 0,
            unsubscribedCount: 0,
            cleanedCount: 0,
            bouncedCount: 0,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
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
            customFields: []
          } as ContactList));
        })
      );
  }

  getList(id: string): Observable<ContactList> {
    return this.api.get<ApiResponse<any>>(`lists/${id}`)
      .pipe(
        map(response => {
          const data = response.data;
          return {
            id: data.id?.toString() || id,
            name: data.name || '',
            description: data.description || '',
            type: data.type === 'smart' ? 'smart' as ListType : 'regular' as ListType,
            status: 'active' as ListStatus,
            tags: data.tags || [],
            subscriberCount: data.subscriberCount || 0,
            unsubscribedCount: 0,
            cleanedCount: 0,
            bouncedCount: 0,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
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
            customFields: []
          } as ContactList;
        })
      );
  }

  createList(list: Omit<ContactList, 'id' | 'createdAt' | 'updatedAt' | 'subscriberCount' | 'unsubscribedCount' | 'cleanedCount' | 'bouncedCount'>): Observable<ContactList> {
    // Map frontend model to backend DTO
    const backendDto = {
      name: list.name,
      description: list.description || '',
      type: list.type === 'smart' ? 'smart' : 'standard', // Map 'regular' to 'standard'
      isSmartList: list.type === 'smart',
      tags: list.tags || []
    };

    return this.api.post<ApiResponse<any>>('lists', backendDto)
      .pipe(
        map(response => {
          const data = response.data;
          // Map backend response to frontend model
          return {
            id: data.id?.toString() || '',
            name: data.name || '',
            description: data.description || '',
            type: data.type === 'smart' ? 'smart' as ListType : 'regular' as ListType,
            status: 'active' as ListStatus,
            tags: data.tags || [],
            subscriberCount: data.subscriberCount || 0,
            unsubscribedCount: 0,
            cleanedCount: 0,
            bouncedCount: 0,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
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
            customFields: []
          } as ContactList;
        })
      );
  }

  updateList(id: string, updates: Partial<ContactList>): Observable<ContactList> {
    // Map frontend model to backend DTO
    const backendDto: any = {};

    if (updates.name !== undefined) backendDto.name = updates.name;
    if (updates.description !== undefined) backendDto.description = updates.description;
    if (updates.type !== undefined) {
      backendDto.type = updates.type === 'smart' ? 'smart' : 'standard';
      backendDto.isSmartList = updates.type === 'smart';
    }
    if (updates.tags !== undefined) backendDto.tags = updates.tags;

    return this.api.put<ApiResponse<any>>(`lists/${id}`, backendDto)
      .pipe(
        map(response => {
          const data = response.data;
          // Map backend response to frontend model
          return {
            id: data.id?.toString() || id,
            name: data.name || '',
            description: data.description || '',
            type: data.type === 'smart' ? 'smart' as ListType : 'regular' as ListType,
            status: 'active' as ListStatus,
            tags: data.tags || [],
            subscriberCount: data.subscriberCount || 0,
            unsubscribedCount: 0,
            cleanedCount: 0,
            bouncedCount: 0,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
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
            customFields: []
          } as ContactList;
        })
      );
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
