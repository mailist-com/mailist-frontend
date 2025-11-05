import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, of, tap, catchError } from 'rxjs';
import { Contact, ContactFilter, ContactSegment, CustomField } from '../models/contact.model';
import { ApiService, ApiResponse, PaginatedResponse } from '../core/api/api.service';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private contactsSubject = new BehaviorSubject<Contact[]>([]);
  private segmentsSubject = new BehaviorSubject<ContactSegment[]>([]);

  contacts$ = this.contactsSubject.asObservable();
  segments$ = this.segmentsSubject.asObservable();

  constructor(private api: ApiService) {}

  getContacts(filter?: ContactFilter): Observable<Contact[]> {
    const params: any = {};
    if (filter?.search) params.search = filter.search;
    if (filter?.status) params.status = filter.status.join(',');
    if (filter?.subscriptionStatus) params.subscriptionStatus = filter.subscriptionStatus.join(',');
    if (filter?.lists) params.lists = filter.lists.join(',');
    if (filter?.tags) params.tags = filter.tags.join(',');

    return this.api.get<ApiResponse<Contact[]>>('contacts', { params })
      .pipe(
        map(response => response.data),
        tap(contacts => this.contactsSubject.next(contacts))
      );
  }

  getContact(id: string): Observable<Contact | undefined> {
    return this.api.get<ApiResponse<Contact>>(`contacts/${id}`)
      .pipe(
        map(response => response.data),
        catchError(() => of(undefined))
      );
  }

  createContact(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Observable<Contact> {
    return this.api.post<ApiResponse<Contact>>('contacts', contact)
      .pipe(
        map(response => response.data),
        tap(newContact => {
          const contacts = this.contactsSubject.value;
          this.contactsSubject.next([...contacts, newContact]);
        })
      );
  }

  updateContact(id: string, updates: Partial<Contact>): Observable<Contact> {
    return this.api.put<ApiResponse<Contact>>(`contacts/${id}`, updates)
      .pipe(
        map(response => response.data),
        tap(updatedContact => {
          const contacts = this.contactsSubject.value;
          const index = contacts.findIndex(c => c.id === id);
          if (index !== -1) {
            contacts[index] = updatedContact;
            this.contactsSubject.next([...contacts]);
          }
        })
      );
  }

  deleteContact(id: string): Observable<boolean> {
    return this.api.delete<ApiResponse<void>>(`contacts/${id}`)
      .pipe(
        map(() => true),
        tap(() => {
          const contacts = this.contactsSubject.value;
          const filteredContacts = contacts.filter(c => c.id !== id);
          this.contactsSubject.next(filteredContacts);
        })
      );
  }

  addTagToContact(contactId: string, tag: string): Observable<Contact> {
    return this.api.post<ApiResponse<Contact>>(`contacts/${contactId}/tags`, { tag })
      .pipe(map(response => response.data));
  }

  removeTagFromContact(contactId: string, tag: string): Observable<Contact> {
    return this.api.delete<ApiResponse<Contact>>(`contacts/${contactId}/tags/${tag}`)
      .pipe(map(response => response.data));
  }

  addToList(contactId: string, listId: string): Observable<Contact> {
    return this.api.post<ApiResponse<Contact>>(`contacts/${contactId}/lists`, { listId })
      .pipe(map(response => response.data));
  }

  removeFromList(contactId: string, listId: string): Observable<Contact> {
    return this.api.delete<ApiResponse<Contact>>(`contacts/${contactId}/lists/${listId}`)
      .pipe(map(response => response.data));
  }

  updateCustomField(contactId: string, field: CustomField): Observable<Contact> {
    return this.api.put<ApiResponse<Contact>>(`contacts/${contactId}/custom-fields/${field.id}`, field)
      .pipe(map(response => response.data));
  }

  searchContacts(query: string): Observable<Contact[]> {
    return this.api.get<ApiResponse<Contact[]>>('contacts/search', { params: { q: query } })
      .pipe(map(response => response.data));
  }

  getContactStatistics(): Observable<{
    total: number;
    active: number;
    unsubscribed: number;
    bounced: number;
    tagged: number;
  }> {
    return this.api.get<ApiResponse<any>>('contacts/statistics')
      .pipe(map(response => response.data));
  }
}
