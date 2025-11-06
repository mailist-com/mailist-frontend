import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { ContactList, ContactListSubscription, ListImportResult, ListImportMapping, SmartListCondition } from '../models/contact-list.model';
import { ApiService, ApiResponse } from '../core/api/api.service';

@Injectable({
  providedIn: 'root'
})
export class ContactListService {
  private listsSubject = new BehaviorSubject<ContactList[]>([]);
  private subscriptionsSubject = new BehaviorSubject<ContactListSubscription[]>([]);

  lists$ = this.listsSubject.asObservable();
  subscriptions$ = this.subscriptionsSubject.asObservable();

  constructor(private api: ApiService) {}

  // Simple method - just load and update BehaviorSubject
  loadLists(): void {
    this.api.get<ApiResponse<ContactList[]>>('lists').subscribe({
      next: (response) => {
        this.listsSubject.next(response.data);
      },
      error: (error) => {
        console.error('Error loading lists:', error);
      }
    });
  }

  // Keep this for backward compatibility if needed
  getLists(): Observable<ContactList[]> {
    return this.api.get<ApiResponse<ContactList[]>>('lists')
      .pipe(
        map(response => response.data),
        tap(lists => this.listsSubject.next(lists))
      );
  }

  getList(id: string): Observable<ContactList> {
    return this.api.get<ApiResponse<ContactList>>(`lists/${id}`)
      .pipe(map(response => response.data));
  }

  createList(list: Omit<ContactList, 'id' | 'createdAt' | 'updatedAt' | 'subscriberCount' | 'unsubscribedCount' | 'cleanedCount' | 'bouncedCount'>, onSuccess?: () => void, onError?: (error: any) => void): void {
    this.api.post<ApiResponse<ContactList>>('lists', list).subscribe({
      next: (response) => {
        const lists = this.listsSubject.value;
        this.listsSubject.next([...lists, response.data]);
        if (onSuccess) onSuccess();
      },
      error: (error) => {
        console.error('Error creating list:', error);
        if (onError) onError(error);
      }
    });
  }

  updateList(id: string, updates: Partial<ContactList>, onSuccess?: () => void, onError?: (error: any) => void): void {
    this.api.put<ApiResponse<ContactList>>(`lists/${id}`, updates).subscribe({
      next: (response) => {
        const lists = this.listsSubject.value;
        const index = lists.findIndex(l => l.id === id);
        if (index !== -1) {
          lists[index] = response.data;
          this.listsSubject.next([...lists]);
        }
        if (onSuccess) onSuccess();
      },
      error: (error) => {
        console.error('Error updating list:', error);
        if (onError) onError(error);
      }
    });
  }

  deleteList(id: string, onSuccess?: () => void, onError?: (error: any) => void): void {
    this.api.delete<ApiResponse<void>>(`lists/${id}`).subscribe({
      next: () => {
        const lists = this.listsSubject.value;
        const filteredLists = lists.filter(l => l.id !== id);
        this.listsSubject.next(filteredLists);
        if (onSuccess) onSuccess();
      },
      error: (error) => {
        console.error('Error deleting list:', error);
        if (onError) onError(error);
      }
    });
  }

  subscribeContact(contactId: string, listId: string, source: 'manual' | 'import' | 'form' | 'api' = 'manual'): Observable<ContactListSubscription> {
    return this.api.post<ApiResponse<ContactListSubscription>>(`lists/${listId}/subscribe`, { contactId, source })
      .pipe(
        map(response => response.data),
        tap(subscription => {
          const subscriptions = this.subscriptionsSubject.value;
          this.subscriptionsSubject.next([...subscriptions, subscription]);
        })
      );
  }

  unsubscribeContact(contactId: string, listId: string): Observable<boolean> {
    return this.api.post<ApiResponse<void>>(`lists/${listId}/unsubscribe`, { contactId })
      .pipe(
        map(() => true),
        tap(() => {
          const subscriptions = this.subscriptionsSubject.value;
          const subscription = subscriptions.find(s => s.contactId === contactId && s.listId === listId);
          if (subscription) {
            subscription.status = 'unsubscribed';
            subscription.unsubscribedAt = new Date();
            this.subscriptionsSubject.next([...subscriptions]);
          }
        })
      );
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

  createSmartList(name: string, description: string, conditions: SmartListCondition[], onSuccess?: () => void, onError?: (error: any) => void): void {
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

    this.createList(smartList, onSuccess, onError);
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
