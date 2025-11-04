import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay, map } from 'rxjs';
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

@Injectable({
  providedIn: 'root'
})
export class AutomationService {
  private automationsSubject = new BehaviorSubject<Automation[]>(this.getMockAutomations());
  private runsSubject = new BehaviorSubject<AutomationRun[]>(this.getMockRuns());

  automations$ = this.automationsSubject.asObservable();
  runs$ = this.runsSubject.asObservable();

  constructor() {}

  getAutomations(): Observable<Automation[]> {
    return this.automations$.pipe();
  }

  getAutomationById(id: string): Observable<Automation | null> {
    return this.automations$.pipe(
      map(automations => automations.find(a => a.id === id) || null),
      delay(300)
    );
  }

  createAutomation(automation: Partial<Automation>): Observable<Automation> {
    const newAutomation: Automation = {
      id: this.generateId(),
      name: automation.name || 'Nowa automatyzacja',
      description: automation.description || '',
      status: 'draft',
      type: automation.type || 'custom',
      trigger: automation.trigger || {
        type: 'contact_subscribed',
        conditions: [],
        settings: {}
      },
      actions: automation.actions || [],
      conditions: automation.conditions || [],
      settings: {
        timezone: 'Europe/Warsaw',
        respectUnsubscribes: true,
        respectBounces: true,
        ...automation.settings
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
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const currentAutomations = this.automationsSubject.value;
    this.automationsSubject.next([...currentAutomations, newAutomation]);

    return of(newAutomation).pipe(delay(500));
  }

  updateAutomation(id: string, updates: Partial<Automation>): Observable<Automation> {
    const currentAutomations = this.automationsSubject.value;
    const index = currentAutomations.findIndex(a => a.id === id);

    if (index === -1) {
      throw new Error('Automation not found');
    }

    const updatedAutomation = {
      ...currentAutomations[index],
      ...updates,
      updatedAt: new Date()
    };

    const updatedAutomations = [...currentAutomations];
    updatedAutomations[index] = updatedAutomation;

    this.automationsSubject.next(updatedAutomations);

    return of(updatedAutomation).pipe(delay(500));
  }

  deleteAutomation(id: string): Observable<boolean> {
    const currentAutomations = this.automationsSubject.value;
    const filteredAutomations = currentAutomations.filter(a => a.id !== id);

    this.automationsSubject.next(filteredAutomations);

    return of(true).pipe(delay(500));
  }

  toggleAutomationStatus(id: string): Observable<Automation> {
    const currentAutomations = this.automationsSubject.value;
    const automation = currentAutomations.find(a => a.id === id);

    if (!automation) {
      throw new Error('Automation not found');
    }

    const newStatus: AutomationStatus = automation.status === 'active' ? 'paused' : 'active';

    return this.updateAutomation(id, { status: newStatus });
  }

  duplicateAutomation(id: string): Observable<Automation> {
    const currentAutomations = this.automationsSubject.value;
    const original = currentAutomations.find(a => a.id === id);

    if (!original) {
      throw new Error('Automation not found');
    }

    const duplicate = {
      ...original,
      id: this.generateId(),
      name: `${original.name} (kopia)`,
      status: 'draft' as AutomationStatus,
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
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.automationsSubject.next([...currentAutomations, duplicate]);

    return of(duplicate).pipe(delay(500));
  }

  getAutomationRuns(automationId: string): Observable<AutomationRun[]> {
    return this.runs$.pipe(
      map(runs => runs.filter(run => run.automationId === automationId)),
      delay(300)
    );
  }

  getAutomationStats(): Observable<{total: number, active: number, draft: number, paused: number}> {
    return this.automations$.pipe(
      map(automations => ({
        total: automations.length,
        active: automations.filter(a => a.status === 'active').length,
        draft: automations.filter(a => a.status === 'draft').length,
        paused: automations.filter(a => a.status === 'paused').length
      })),
      delay(200)
    );
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private getMockAutomations(): Automation[] {
    return [
      {
        id: '1',
        name: 'Seria powitalna',
        description: 'Automatyczna seria email powitalna dla nowych subskrybentów',
        status: 'active',
        type: 'welcome_series',
        trigger: {
          type: 'contact_subscribed',
          conditions: [],
          settings: {
            listIds: ['list-1'],
            once_per_contact: true
          }
        },
        actions: [
          {
            id: 'action-1',
            type: 'wait',
            settings: {
              waitDuration: { amount: 1, unit: 'hours' }
            },
            order: 1
          },
          {
            id: 'action-2',
            type: 'send_email',
            settings: {
              emailTemplate: 'Witaj w naszej społeczności!'
            },
            order: 2
          },
          {
            id: 'action-3',
            type: 'wait',
            settings: {
              waitDuration: { amount: 3, unit: 'days' }
            },
            order: 3
          },
          {
            id: 'action-4',
            type: 'send_email',
            settings: {
              emailTemplate: 'Poznaj nasze najlepsze produkty'
            },
            order: 4
          }
        ],
        conditions: [],
        settings: {
          timezone: 'Europe/Warsaw',
          respectUnsubscribes: true,
          respectBounces: true,
          sendTime: { hour: 10, minute: 0 },
          sendDays: [1, 2, 3, 4, 5]
        },
        statistics: {
          totalRuns: 156,
          activeContacts: 23,
          completedContacts: 133,
          emailsSent: 312,
          emailsOpened: 243,
          emailsClicked: 89,
          conversions: 12,
          performance: {
            openRate: 77.9,
            clickRate: 28.5,
            conversionRate: 7.7
          }
        },
        createdAt: new Date('2024-10-15'),
        updatedAt: new Date('2024-10-30'),
        lastRunAt: new Date('2024-10-31')
      },
      {
        id: '2',
        name: 'Reaktywacja nieaktywnych',
        description: 'Kampania dla kontaktów, które nie otwierały email przez ostatnie 30 dni',
        status: 'active',
        type: 'behavioral',
        trigger: {
          type: 'date_reached',
          conditions: [
            {
              field: 'last_email_opened',
              operator: 'less',
              value: '30 days ago'
            }
          ],
          settings: {
            run_once: false
          }
        },
        actions: [
          {
            id: 'action-1',
            type: 'send_email',
            settings: {
              emailTemplate: 'Tęsknimy za Tobą!'
            },
            order: 1
          },
          {
            id: 'action-2',
            type: 'wait',
            settings: {
              waitDuration: { amount: 1, unit: 'weeks' }
            },
            order: 2
          },
          {
            id: 'action-3',
            type: 'send_email',
            settings: {
              emailTemplate: 'Ostatnia szansa - specjalna oferta'
            },
            order: 3
          }
        ],
        conditions: [],
        settings: {
          timezone: 'Europe/Warsaw',
          respectUnsubscribes: true,
          respectBounces: true,
          maxRunsPerContact: 1
        },
        statistics: {
          totalRuns: 89,
          activeContacts: 12,
          completedContacts: 77,
          emailsSent: 178,
          emailsOpened: 67,
          emailsClicked: 23,
          conversions: 5,
          performance: {
            openRate: 37.6,
            clickRate: 12.9,
            conversionRate: 5.6
          }
        },
        createdAt: new Date('2024-10-20'),
        updatedAt: new Date('2024-10-28')
      },
      {
        id: '3',
        name: 'Urodzinowa kampania',
        description: 'Wysyłanie życzeń urodzinowych z kodem rabatowym',
        status: 'draft',
        type: 'date_based',
        trigger: {
          type: 'date_reached',
          conditions: [
            {
              field: 'birthday',
              operator: 'equals',
              value: 'today'
            }
          ],
          settings: {}
        },
        actions: [
          {
            id: 'action-1',
            type: 'send_email',
            settings: {
              emailTemplate: 'Wszystkiego najlepszego! Mamy dla Ciebie prezent'
            },
            order: 1
          },
          {
            id: 'action-2',
            type: 'add_tag',
            settings: {
              tagIds: ['birthday-2024']
            },
            order: 2
          }
        ],
        conditions: [],
        settings: {
          timezone: 'Europe/Warsaw',
          respectUnsubscribes: true,
          respectBounces: true,
          sendTime: { hour: 9, minute: 0 }
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
        createdAt: new Date('2024-10-25'),
        updatedAt: new Date('2024-10-25')
      }
    ];
  }

  private getMockRuns(): AutomationRun[] {
    return [
      {
        id: 'run-1',
        automationId: '1',
        contactId: 'contact-1',
        status: 'running',
        currentActionIndex: 2,
        startedAt: new Date('2024-10-31T08:00:00'),
        nextActionAt: new Date('2024-11-03T10:00:00'),
        data: {}
      },
      {
        id: 'run-2',
        automationId: '1',
        contactId: 'contact-2',
        status: 'completed',
        currentActionIndex: 4,
        startedAt: new Date('2024-10-28T09:00:00'),
        completedAt: new Date('2024-10-31T10:00:00'),
        data: {}
      },
      {
        id: 'run-3',
        automationId: '2',
        contactId: 'contact-3',
        status: 'running',
        currentActionIndex: 1,
        startedAt: new Date('2024-10-30T14:00:00'),
        nextActionAt: new Date('2024-11-06T14:00:00'),
        data: {}
      }
    ];
  }
}
