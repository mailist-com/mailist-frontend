import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, of, delay } from 'rxjs';
import { ContactList, ContactListSubscription, ListImportResult, ListImportMapping, SmartListCondition } from '../models/contact-list.model';

@Injectable({
  providedIn: 'root'
})
export class ContactListService {
  private listsSubject = new BehaviorSubject<ContactList[]>(this.getMockLists());
  private subscriptionsSubject = new BehaviorSubject<ContactListSubscription[]>(this.getMockSubscriptions());

  lists$ = this.listsSubject.asObservable();
  subscriptions$ = this.subscriptionsSubject.asObservable();

  constructor() {}

  getLists(): Observable<ContactList[]> {
    return this.lists$;
  }

  getList(id: string): Observable<ContactList | undefined> {
    return this.lists$.pipe(
      map(lists => lists.find(l => l.id === id))
    );
  }

  createList(list: Omit<ContactList, 'id' | 'createdAt' | 'updatedAt' | 'subscriberCount' | 'unsubscribedCount' | 'cleanedCount' | 'bouncedCount'>): Observable<ContactList> {
    const newList: ContactList = {
      ...list,
      id: this.generateId(),
      subscriberCount: 0,
      unsubscribedCount: 0,
      cleanedCount: 0,
      bouncedCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const lists = this.listsSubject.value;
    this.listsSubject.next([...lists, newList]);
    
    return of(newList).pipe(delay(500));
  }

  updateList(id: string, updates: Partial<ContactList>): Observable<ContactList> {
    const lists = this.listsSubject.value;
    const index = lists.findIndex(l => l.id === id);
    
    if (index === -1) {
      throw new Error('List not found');
    }

    const updatedList = {
      ...lists[index],
      ...updates,
      updatedAt: new Date()
    };

    lists[index] = updatedList;
    this.listsSubject.next([...lists]);
    
    return of(updatedList).pipe(delay(500));
  }

  deleteList(id: string): Observable<boolean> {
    const lists = this.listsSubject.value;
    const filteredLists = lists.filter(l => l.id !== id);
    this.listsSubject.next(filteredLists);
    
    return of(true).pipe(delay(500));
  }

  subscribeContact(contactId: string, listId: string, source: 'manual' | 'import' | 'form' | 'api' = 'manual'): Observable<ContactListSubscription> {
    const subscription: ContactListSubscription = {
      contactId,
      listId,
      status: 'subscribed',
      subscribedAt: new Date(),
      source,
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0...'
    };

    const subscriptions = this.subscriptionsSubject.value;
    this.subscriptionsSubject.next([...subscriptions, subscription]);
    
    this.updateListCounts(listId);
    
    return of(subscription).pipe(delay(500));
  }

  unsubscribeContact(contactId: string, listId: string): Observable<boolean> {
    const subscriptions = this.subscriptionsSubject.value;
    const subscription = subscriptions.find(s => s.contactId === contactId && s.listId === listId);
    
    if (subscription) {
      subscription.status = 'unsubscribed';
      subscription.unsubscribedAt = new Date();
      this.subscriptionsSubject.next([...subscriptions]);
      this.updateListCounts(listId);
    }
    
    return of(true).pipe(delay(500));
  }

  getListSubscriptions(listId: string): Observable<ContactListSubscription[]> {
    return this.subscriptions$.pipe(
      map(subscriptions => subscriptions.filter(s => s.listId === listId))
    );
  }

  getContactSubscriptions(contactId: string): Observable<ContactListSubscription[]> {
    return this.subscriptions$.pipe(
      map(subscriptions => subscriptions.filter(s => s.contactId === contactId))
    );
  }

  importContacts(listId: string, csvData: string, mapping: ListImportMapping[]): Observable<ListImportResult> {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',');
    const dataLines = lines.slice(1).filter(line => line.trim());
    
    let successfulImports = 0;
    let failedImports = 0;
    let duplicateContacts = 0;
    const errors: any[] = [];

    dataLines.forEach((line, index) => {
      const values = line.split(',');
      const row = index + 2;
      
      try {
        const emailColumn = mapping.find(m => m.contactField === 'email')?.csvColumn;
        const emailIndex = headers.indexOf(emailColumn || '');
        const email = values[emailIndex]?.trim();
        
        if (!email || !this.isValidEmail(email)) {
          errors.push({
            row,
            email: email || 'N/A',
            error: 'Invalid email address'
          });
          failedImports++;
          return;
        }

        if (this.isDuplicateEmail(email)) {
          duplicateContacts++;
          return;
        }

        successfulImports++;
      } catch (error) {
        errors.push({
          row,
          email: 'N/A',
          error: 'Failed to process row'
        });
        failedImports++;
      }
    });

    const result: ListImportResult = {
      totalRecords: dataLines.length,
      successfulImports,
      failedImports,
      duplicateContacts,
      errors
    };

    this.updateListCounts(listId);
    
    return of(result).pipe(delay(2000));
  }

  exportContacts(listId: string, format: 'csv' | 'excel' = 'csv'): Observable<Blob> {
    return new Observable(observer => {
      setTimeout(() => {
        const csvContent = this.generateCSVContent(listId);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        observer.next(blob);
        observer.complete();
      }, 1000);
    });
  }

  createSmartList(name: string, description: string, conditions: SmartListCondition[]): Observable<ContactList> {
    const smartList: Omit<ContactList, 'id' | 'createdAt' | 'updatedAt' | 'subscriberCount' | 'unsubscribedCount' | 'cleanedCount' | 'bouncedCount'> = {
      name,
      description,
      type: 'smart',
      status: 'active',
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
    return this.lists$.pipe(
      map(lists => ({
        totalLists: lists.length,
        activeLists: lists.filter(l => l.status === 'active').length,
        totalSubscribers: lists.reduce((sum, list) => sum + list.subscriberCount, 0),
        averageEngagement: lists.length > 0 ? 
          lists.reduce((sum, list) => sum + (list.subscriberCount > 0 ? (list.subscriberCount - list.unsubscribedCount) / list.subscriberCount * 100 : 0), 0) / lists.length : 0
      }))
    );
  }

  exportList(listId: string, format: 'csv' | 'xlsx' = 'csv'): Observable<Blob> {
    const lists = this.listsSubject.value;
    const list = lists.find(l => l.id === listId);
    
    if (!list) {
      throw new Error('List not found');
    }

    const data = this.generateExportData([list], format);
    const blob = new Blob([data], { 
      type: format === 'csv' ? 'text/csv;charset=utf-8;' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    return of(blob).pipe(delay(1000));
  }

  exportAllLists(format: 'csv' | 'xlsx' = 'csv'): Observable<Blob> {
    const lists = this.listsSubject.value;
    const data = this.generateExportData(lists, format);
    const blob = new Blob([data], { 
      type: format === 'csv' ? 'text/csv;charset=utf-8;' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    return of(blob).pipe(delay(1000));
  }

  private generateExportData(lists: ContactList[], format: 'csv' | 'xlsx'): string {
    if (format === 'csv') {
      const headers = [
        'List ID', 'Name', 'Description', 'Type', 'Status', 'Subscribers', 
        'Unsubscribed', 'Bounced', 'Cleaned', 'Engagement Rate', 'Created Date', 'Updated Date'
      ];
      
      const rows = lists.map(list => {
        const engagementRate = list.subscriberCount > 0 
          ? ((list.subscriberCount - list.unsubscribedCount) / list.subscriberCount * 100).toFixed(2)
          : '0.00';
          
        return [
          list.id,
          `"${list.name.replace(/"/g, '""')}"`,
          `"${(list.description || '').replace(/"/g, '""')}"`,
          list.type,
          list.status,
          list.subscriberCount.toString(),
          list.unsubscribedCount.toString(),
          list.bouncedCount.toString(),
          list.cleanedCount.toString(),
          engagementRate + '%',
          list.createdAt.toISOString().split('T')[0],
          list.updatedAt.toISOString().split('T')[0]
        ];
      });

      return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    }

    // For Excel format, we'll return CSV for now (in a real app, you'd use a library like xlsx)
    return this.generateExportData(lists, 'csv');
  }

  private updateListCounts(listId: string): void {
    const subscriptions = this.subscriptionsSubject.value;
    const listSubscriptions = subscriptions.filter(s => s.listId === listId);
    
    const subscriberCount = listSubscriptions.filter(s => s.status === 'subscribed').length;
    const unsubscribedCount = listSubscriptions.filter(s => s.status === 'unsubscribed').length;
    const cleanedCount = listSubscriptions.filter(s => s.status === 'cleaned').length;
    const bouncedCount = listSubscriptions.filter(s => s.status === 'bounced').length;

    this.updateList(listId, {
      subscriberCount,
      unsubscribedCount,
      cleanedCount,
      bouncedCount
    }).subscribe();
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isDuplicateEmail(email: string): boolean {
    return Math.random() < 0.1;
  }

  private generateCSVContent(listId: string): string {
    const headers = ['Email', 'First Name', 'Last Name', 'Phone', 'Organization', 'Tags', 'Status', 'Subscribed Date'];
    const mockData = [
      'marie.prohaska@example.com,Marie,Prohaska,+1-555-0123,Design Studio Inc,"premium,designer",subscribed,2023-01-15',
      'jaqueline.hammes@example.com,Jaqueline,Hammes,+55-11-9876-5432,Tech Solutions Ltd,"developer,asp.net",subscribed,2023-02-20'
    ];
    
    return [headers.join(','), ...mockData].join('\n');
  }

  private generateId(): string {
    return '#CL' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  private getMockLists(): ContactList[] {
    return [
      {
        id: '#CL1000001',
        name: 'Newsletter Subscribers',
        description: 'Main newsletter subscription list',
        type: 'regular',
        status: 'active',
        subscriberCount: 2450,
        unsubscribedCount: 145,
        cleanedCount: 23,
        bouncedCount: 12,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2024-10-15'),
        settings: {
          doubleOptIn: true,
          welcomeEmail: true,
          welcomeEmailId: 'email_001',
          notifyOnSubscribe: true,
          notifyOnUnsubscribe: true,
          notificationEmail: 'admin@example.com',
          allowPublicSubscription: true,
          requireNameOnSignup: true,
          requirePhoneOnSignup: false,
          respectUnsubscribes: true,
          respectBounces: true
        },
        customFields: [
          {
            id: 'cf1',
            name: 'Job Title',
            type: 'text',
            label: 'Job Title',
            required: false,
            order: 1,
            isVisible: true
          },
          {
            id: 'cf2',
            name: 'Company Size',
            type: 'dropdown',
            label: 'Company Size',
            required: false,
            options: ['1-10', '11-50', '51-200', '200+'],
            order: 2,
            isVisible: true
          }
        ],
        tags: ['newsletter', 'marketing']
      },
      {
        id: '#CL1000002',
        name: 'Premium Customers',
        description: 'List for premium tier customers',
        type: 'regular',
        status: 'active',
        subscriberCount: 350,
        unsubscribedCount: 15,
        cleanedCount: 3,
        bouncedCount: 2,
        createdAt: new Date('2023-02-15'),
        updatedAt: new Date('2024-10-20'),
        settings: {
          doubleOptIn: false,
          welcomeEmail: true,
          welcomeEmailId: 'email_002',
          notifyOnSubscribe: true,
          notifyOnUnsubscribe: true,
          notificationEmail: 'sales@example.com',
          allowPublicSubscription: false,
          requireNameOnSignup: true,
          requirePhoneOnSignup: true,
          respectUnsubscribes: true,
          respectBounces: true
        },
        customFields: [
          {
            id: 'cf3',
            name: 'Account Value',
            type: 'number',
            label: 'Account Value ($)',
            required: true,
            order: 1,
            isVisible: true
          }
        ],
        tags: ['premium', 'customers']
      },
      {
        id: '#CL1000003',
        name: 'Active Developers',
        description: 'Smart list for developer contacts with recent activity',
        type: 'smart',
        status: 'active',
        subscriberCount: 125,
        unsubscribedCount: 8,
        cleanedCount: 1,
        bouncedCount: 0,
        createdAt: new Date('2023-03-01'),
        updatedAt: new Date('2024-10-25'),
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
        tags: ['developers', 'smart-list']
      }
    ];
  }

  private getMockSubscriptions(): ContactListSubscription[] {
    return [
      {
        contactId: '#CT1000001',
        listId: '#CL1000001',
        status: 'subscribed',
        subscribedAt: new Date('2023-01-15'),
        source: 'form',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        contactId: '#CT1000001',
        listId: '#CL1000002',
        status: 'subscribed',
        subscribedAt: new Date('2023-06-01'),
        source: 'manual',
        ipAddress: '192.168.1.100'
      },
      {
        contactId: '#CT1000002',
        listId: '#CL1000001',
        status: 'subscribed',
        subscribedAt: new Date('2023-02-20'),
        source: 'api',
        ipAddress: '203.0.113.15'
      },
      {
        contactId: '#CT1000003',
        listId: '#CL1000003',
        status: 'subscribed',
        subscribedAt: new Date('2023-03-10'),
        source: 'import',
        ipAddress: '198.51.100.25'
      }
    ];
  }
}