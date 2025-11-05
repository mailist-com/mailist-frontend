import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, of, delay, tap, catchError } from 'rxjs';
import { Contact, ContactFilter, ContactSegment, CustomField } from '../models/contact.model';
import { ApiService, ApiResponse, PaginatedResponse } from '../core/api/api.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private contactsSubject = new BehaviorSubject<Contact[]>(this.getMockContacts());
  private segmentsSubject = new BehaviorSubject<ContactSegment[]>(this.getMockSegments());

  contacts$ = this.contactsSubject.asObservable();
  segments$ = this.segmentsSubject.asObservable();

  constructor(private api: ApiService) {}

  getContacts(filter?: ContactFilter): Observable<Contact[]> {
    // Use real API if mock data is disabled
    if (!environment.features.enableMockData) {
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

    // Fallback to mock data
    return this.contacts$.pipe(
      map(contacts => this.filterContacts(contacts, filter))
    );
  }

  getContact(id: string): Observable<Contact | undefined> {
    // Use real API if mock data is disabled
    if (!environment.features.enableMockData) {
      return this.api.get<ApiResponse<Contact>>(`contacts/${id}`)
        .pipe(
          map(response => response.data),
          catchError(() => of(undefined))
        );
    }

    // Fallback to mock data
    return this.contacts$.pipe(
      map(contacts => contacts.find(c => c.id === id))
    );
  }

  createContact(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Observable<Contact> {
    // Use real API if mock data is disabled
    if (!environment.features.enableMockData) {
      return this.api.post<ApiResponse<Contact>>('contacts', contact)
        .pipe(
          map(response => response.data),
          tap(newContact => {
            const contacts = this.contactsSubject.value;
            this.contactsSubject.next([...contacts, newContact]);
          })
        );
    }

    // Fallback to mock data
    const newContact: Contact = {
      ...contact,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const contacts = this.contactsSubject.value;
    this.contactsSubject.next([...contacts, newContact]);

    return of(newContact).pipe(delay(500));
  }

  updateContact(id: string, updates: Partial<Contact>): Observable<Contact> {
    // Use real API if mock data is disabled
    if (!environment.features.enableMockData) {
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

    // Fallback to mock data
    const contacts = this.contactsSubject.value;
    const index = contacts.findIndex(c => c.id === id);

    if (index === -1) {
      throw new Error('Contact not found');
    }

    const updatedContact = {
      ...contacts[index],
      ...updates,
      updatedAt: new Date()
    };

    contacts[index] = updatedContact;
    this.contactsSubject.next([...contacts]);

    return of(updatedContact).pipe(delay(500));
  }

  deleteContact(id: string): Observable<boolean> {
    // Use real API if mock data is disabled
    if (!environment.features.enableMockData) {
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

    // Fallback to mock data
    const contacts = this.contactsSubject.value;
    const filteredContacts = contacts.filter(c => c.id !== id);
    this.contactsSubject.next(filteredContacts);

    return of(true).pipe(delay(500));
  }

  addTagToContact(contactId: string, tag: string): Observable<Contact> {
    // Use real API if mock data is disabled
    if (!environment.features.enableMockData) {
      return this.api.post<ApiResponse<Contact>>(`contacts/${contactId}/tags`, { tag })
        .pipe(map(response => response.data));
    }

    // Fallback to mock data
    return this.updateContact(contactId, {
      tags: [...(this.getContactById(contactId)?.tags || []), tag]
    });
  }

  removeTagFromContact(contactId: string, tag: string): Observable<Contact> {
    // Use real API if mock data is disabled
    if (!environment.features.enableMockData) {
      return this.api.delete<ApiResponse<Contact>>(`contacts/${contactId}/tags/${tag}`)
        .pipe(map(response => response.data));
    }

    // Fallback to mock data
    const contact = this.getContactById(contactId);
    if (!contact) throw new Error('Contact not found');

    return this.updateContact(contactId, {
      tags: contact.tags.filter(t => t !== tag)
    });
  }

  addToList(contactId: string, listId: string): Observable<Contact> {
    const contact = this.getContactById(contactId);
    if (!contact) throw new Error('Contact not found');

    return this.updateContact(contactId, {
      lists: [...contact.lists, listId]
    });
  }

  removeFromList(contactId: string, listId: string): Observable<Contact> {
    const contact = this.getContactById(contactId);
    if (!contact) throw new Error('Contact not found');

    return this.updateContact(contactId, {
      lists: contact.lists.filter(l => l !== listId)
    });
  }

  updateCustomField(contactId: string, field: CustomField): Observable<Contact> {
    const contact = this.getContactById(contactId);
    if (!contact) throw new Error('Contact not found');

    const customFields = [...contact.customFields];
    const index = customFields.findIndex(f => f.id === field.id);

    if (index === -1) {
      customFields.push(field);
    } else {
      customFields[index] = field;
    }

    return this.updateContact(contactId, { customFields });
  }

  searchContacts(query: string): Observable<Contact[]> {
    // Use real API if mock data is disabled
    if (!environment.features.enableMockData) {
      return this.api.get<ApiResponse<Contact[]>>('contacts/search', { params: { q: query } })
        .pipe(map(response => response.data));
    }

    // Fallback to mock data
    return this.contacts$.pipe(
      map(contacts => contacts.filter(contact =>
        contact.email.toLowerCase().includes(query.toLowerCase()) ||
        contact.firstName.toLowerCase().includes(query.toLowerCase()) ||
        contact.lastName.toLowerCase().includes(query.toLowerCase()) ||
        contact.organization?.toLowerCase().includes(query.toLowerCase()) ||
        contact.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      ))
    );
  }

  getContactStatistics(): Observable<{
    total: number;
    active: number;
    unsubscribed: number;
    bounced: number;
    tagged: number;
  }> {
    // Use real API if mock data is disabled
    if (!environment.features.enableMockData) {
      return this.api.get<ApiResponse<any>>('contacts/statistics')
        .pipe(map(response => response.data));
    }

    // Fallback to mock data
    return this.contacts$.pipe(
      map(contacts => ({
        total: contacts.length,
        active: contacts.filter(c => c.status === 'active').length,
        unsubscribed: contacts.filter(c => c.status === 'unsubscribed').length,
        bounced: contacts.filter(c => c.status === 'bounced').length,
        tagged: contacts.filter(c => c.tags.length > 0).length
      }))
    );
  }

  private filterContacts(contacts: Contact[], filter?: ContactFilter): Contact[] {
    if (!filter) return contacts;

    return contacts.filter(contact => {
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        const matchesSearch =
          contact.email.toLowerCase().includes(searchLower) ||
          contact.firstName.toLowerCase().includes(searchLower) ||
          contact.lastName.toLowerCase().includes(searchLower) ||
          contact.organization?.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      if (filter.status?.length && !filter.status.includes(contact.status)) {
        return false;
      }

      if (filter.subscriptionStatus?.length && !filter.subscriptionStatus.includes(contact.subscriptionStatus)) {
        return false;
      }

      if (filter.lists?.length) {
        const hasMatchingList = filter.lists.some(listId => contact.lists.includes(listId));
        if (!hasMatchingList) return false;
      }

      if (filter.tags?.length) {
        const hasMatchingTag = filter.tags.some(tag => contact.tags.includes(tag));
        if (!hasMatchingTag) return false;
      }

      return true;
    });
  }

  private getContactById(id: string): Contact | undefined {
    return this.contactsSubject.value.find(c => c.id === id);
  }

  private generateId(): string {
    return '#CT' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  private getMockContacts(): Contact[] {
    return [
      {
        id: '#CT1000001',
        email: 'marie.prohaska@example.com',
        firstName: 'Marie',
        lastName: 'Prohaska',
        phone: '+1-555-0123',
        organization: 'Design Studio Inc',
        tags: ['premium', 'designer'],
        customFields: [
          { id: 'cf1', name: 'Job Title', value: 'Graphic Designer', type: 'text' },
          { id: 'cf2', name: 'Company Size', value: '10-50', type: 'dropdown' }
        ],
        lists: ['list1', 'list2'],
        status: 'active',
        subscriptionStatus: 'subscribed',
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date('2024-10-15'),
        lastActivity: new Date('2024-10-30'),
        engagementScore: 85,
        location: {
          country: 'United States',
          state: 'California',
          city: 'San Francisco',
          timezone: 'America/Los_Angeles'
        }
      },
      {
        id: '#CT1000002',
        email: 'jaqueline.hammes@example.com',
        firstName: 'Jaqueline',
        lastName: 'Hammes',
        phone: '+55-11-9876-5432',
        organization: 'Tech Solutions Ltd',
        tags: ['developer', 'asp.net'],
        customFields: [
          { id: 'cf1', name: 'Job Title', value: 'ASP.Net Developer', type: 'text' },
          { id: 'cf3', name: 'Years Experience', value: 5, type: 'number' }
        ],
        lists: ['list1'],
        status: 'active',
        subscriptionStatus: 'subscribed',
        createdAt: new Date('2023-02-20'),
        updatedAt: new Date('2024-10-20'),
        lastActivity: new Date('2024-10-28'),
        engagementScore: 72,
        location: {
          country: 'Brazil',
          state: 'São Paulo',
          city: 'São Paulo',
          timezone: 'America/Sao_Paulo'
        }
      },
      {
        id: '#CT1000003',
        email: 'marlene.hirthe@example.com',
        firstName: 'Marlene',
        lastName: 'Hirthe',
        phone: '+34-91-123-4567',
        organization: 'mailist-frontend Experts',
        tags: ['developer', 'angular', 'senior'],
        customFields: [
          { id: 'cf1', name: 'Job Title', value: 'Senior mailist-frontend Developer', type: 'text' },
          { id: 'cf3', name: 'Years Experience', value: 8, type: 'number' }
        ],
        lists: ['list2', 'list3'],
        status: 'active',
        subscriptionStatus: 'subscribed',
        createdAt: new Date('2023-03-10'),
        updatedAt: new Date('2024-10-25'),
        lastActivity: new Date('2024-11-01'),
        engagementScore: 95,
        location: {
          country: 'Spain',
          state: 'Madrid',
          city: 'Madrid',
          timezone: 'Europe/Madrid'
        }
      }
    ];
  }

  private getMockSegments(): ContactSegment[] {
    return [
      {
        id: 'seg1',
        name: 'Active Developers',
        description: 'Contacts tagged as developers with recent activity',
        conditions: [
          { field: 'tags', operator: 'contains', value: 'developer' },
          { field: 'status', operator: 'equals', value: 'active' }
        ],
        contactCount: 250,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-10-01')
      },
      {
        id: 'seg2',
        name: 'Premium Customers',
        description: 'High-value contacts with premium tag',
        conditions: [
          { field: 'tags', operator: 'contains', value: 'premium' },
          { field: 'engagementScore', operator: 'greater', value: 80 }
        ],
        contactCount: 125,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-10-15')
      }
    ];
  }
}
