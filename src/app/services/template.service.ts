import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, of, throwError } from 'rxjs';
import {
  Template,
  TemplateStats,
  CreateTemplateDTO,
  TemplateCategory,
  TemplateStatus,
} from '../models/template.model';

@Injectable({
  providedIn: 'root',
})
export class TemplateService {
  private templatesSubject = new BehaviorSubject<Template[]>(
    this.getMockTemplates()
  );
  public templates$ = this.templatesSubject.asObservable();

  constructor() {}

  /**
   * Get all templates
   */
  getTemplates(): Observable<Template[]> {
    return of(this.templatesSubject.value);
  }

  /**
   * Get template by ID
   */
  getTemplateById(id: string): Observable<Template | null> {
    return this.templates$.pipe(
      map((templates) => templates.find((t) => t.id === id) || null)
    );
  }

  /**
   * Create a new template
   */
  createTemplate(templateData: CreateTemplateDTO): Observable<Template> {
    const newTemplate: Template = {
      id: this.generateId(),
      ...templateData,
      status: templateData.status || 'draft',
      statistics: {
        usageCount: 0,
        campaignsCount: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const currentTemplates = this.templatesSubject.value;
    this.templatesSubject.next([newTemplate, ...currentTemplates]);

    return of(newTemplate);
  }

  /**
   * Update an existing template
   */
  updateTemplate(
    id: string,
    updates: Partial<Template>
  ): Observable<Template> {
    const currentTemplates = this.templatesSubject.value;
    const templateIndex = currentTemplates.findIndex((t) => t.id === id);

    if (templateIndex === -1) {
      return throwError(() => new Error('Template not found'));
    }

    const updatedTemplate: Template = {
      ...currentTemplates[templateIndex],
      ...updates,
      updatedAt: new Date(),
    };

    const updatedTemplates = [...currentTemplates];
    updatedTemplates[templateIndex] = updatedTemplate;
    this.templatesSubject.next(updatedTemplates);

    return of(updatedTemplate);
  }

  /**
   * Delete a template
   */
  deleteTemplate(id: string): Observable<boolean> {
    const currentTemplates = this.templatesSubject.value;
    const filteredTemplates = currentTemplates.filter((t) => t.id !== id);

    if (filteredTemplates.length === currentTemplates.length) {
      return throwError(() => new Error('Template not found'));
    }

    this.templatesSubject.next(filteredTemplates);
    return of(true);
  }

  /**
   * Duplicate a template
   */
  duplicateTemplate(id: string): Observable<Template> {
    const template = this.templatesSubject.value.find((t) => t.id === id);

    if (!template) {
      return throwError(() => new Error('Template not found'));
    }

    const duplicatedTemplate: Template = {
      ...JSON.parse(JSON.stringify(template)),
      id: this.generateId(),
      name: `${template.name} (kopia)`,
      status: 'draft' as TemplateStatus,
      statistics: {
        usageCount: 0,
        campaignsCount: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const currentTemplates = this.templatesSubject.value;
    this.templatesSubject.next([duplicatedTemplate, ...currentTemplates]);

    return of(duplicatedTemplate);
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(
    category: TemplateCategory
  ): Observable<Template[]> {
    return this.templates$.pipe(
      map((templates) => templates.filter((t) => t.category === category))
    );
  }

  /**
   * Get template statistics
   */
  getTemplateStats(): Observable<TemplateStats> {
    return this.templates$.pipe(
      map((templates) => {
        const stats: TemplateStats = {
          total: templates.length,
          draft: templates.filter((t) => t.status === 'draft').length,
          active: templates.filter((t) => t.status === 'active').length,
          archived: templates.filter((t) => t.status === 'archived').length,
          byCategory: {
            promotional: 0,
            newsletter: 0,
            welcome: 0,
            transactional: 0,
            announcement: 0,
            event: 0,
            survey: 0,
            other: 0,
          },
        };

        templates.forEach((template) => {
          stats.byCategory[template.category]++;
        });

        return stats;
      })
    );
  }

  /**
   * Archive a template
   */
  archiveTemplate(id: string): Observable<Template> {
    return this.updateTemplate(id, { status: 'archived' });
  }

  /**
   * Activate a template
   */
  activateTemplate(id: string): Observable<Template> {
    return this.updateTemplate(id, { status: 'active' });
  }

  /**
   * Generate a random ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 11);
  }

  /**
   * Get mock templates for development
   */
  private getMockTemplates(): Template[] {
    return [
      {
        id: '1',
        name: 'Promocja Black Friday',
        subject: '🔥 Black Friday - Zniżki do -70%!',
        previewText: 'Największa wyprzedaż roku już trwa. Nie przegap okazji!',
        category: 'promotional',
        tags: ['promocja', 'black-friday', 'wyprzedaż'],
        content: {
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                <h1 style="color: white; font-size: 32px; margin: 0;">Black Friday</h1>
                <p style="color: white; font-size: 24px; margin: 10px 0;">Zniżki do -70%</p>
              </div>
              <div style="padding: 40px; background: #ffffff;">
                <h2 style="color: #333; font-size: 24px;">Najlepsze oferty roku!</h2>
                <p style="color: #666; font-size: 16px; line-height: 1.6;">
                  Przez cały weekend możesz skorzystać z wyjątkowych rabatów na wszystkie produkty w naszym sklepie.
                </p>
                <a href="#" style="display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                  Sprawdź oferty
                </a>
              </div>
              <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999;">
                <p>© 2025 Twoja Firma. Wszystkie prawa zastrzeżone.</p>
              </div>
            </div>
          `,
          text: 'Black Friday - Zniżki do -70%! Najlepsze oferty roku!',
          design: {
            backgroundColor: '#f5f5f5',
            fontFamily: 'Arial, sans-serif',
            primaryColor: '#667eea',
            secondaryColor: '#764ba2',
          },
        },
        status: 'active',
        thumbnailUrl: 'https://via.placeholder.com/300x400/667eea/ffffff?text=Black+Friday',
        statistics: {
          usageCount: 15,
          lastUsedAt: new Date('2024-11-25'),
          campaignsCount: 5,
          avgOpenRate: 28.5,
          avgClickRate: 4.2,
        },
        createdAt: new Date('2024-10-01'),
        updatedAt: new Date('2024-11-20'),
        isDefault: false,
      },
      {
        id: '2',
        name: 'Newsletter miesięczny',
        subject: '📰 Twój miesięczny newsletter - {{ month }}',
        previewText: 'Zobacz co przygotowaliśmy dla Ciebie w tym miesiącu',
        category: 'newsletter',
        tags: ['newsletter', 'miesięczny', 'aktualności'],
        content: {
          html: `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #2c3e50; padding: 30px; text-align: center;">
                <h1 style="color: white; font-size: 28px; margin: 0;">Newsletter</h1>
                <p style="color: #ecf0f1; font-size: 14px; margin: 10px 0;">{{ month }} {{ year }}</p>
              </div>
              <div style="padding: 40px; background: #ffffff;">
                <h2 style="color: #2c3e50; font-size: 22px; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
                  Najważniejsze wydarzenia
                </h2>
                <div style="margin: 30px 0;">
                  <h3 style="color: #34495e; font-size: 18px;">Artykuł 1</h3>
                  <p style="color: #7f8c8d; font-size: 14px; line-height: 1.6;">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit...
                  </p>
                  <a href="#" style="color: #3498db; text-decoration: none;">Czytaj więcej →</a>
                </div>
              </div>
              <div style="background: #ecf0f1; padding: 20px; text-align: center;">
                <p style="font-size: 12px; color: #7f8c8d; margin: 0;">
                  Otrzymujesz tego maila, ponieważ zapisałeś się na newsletter
                </p>
              </div>
            </div>
          `,
          text: 'Newsletter miesięczny - Zobacz najważniejsze wydarzenia',
          design: {
            backgroundColor: '#ecf0f1',
            fontFamily: 'Helvetica Neue, Arial, sans-serif',
            primaryColor: '#3498db',
            secondaryColor: '#2c3e50',
          },
        },
        status: 'active',
        thumbnailUrl: 'https://via.placeholder.com/300x400/3498db/ffffff?text=Newsletter',
        statistics: {
          usageCount: 24,
          lastUsedAt: new Date('2024-12-01'),
          campaignsCount: 12,
          avgOpenRate: 32.8,
          avgClickRate: 5.6,
        },
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-11-28'),
        isDefault: true,
      },
      {
        id: '3',
        name: 'Wiadomość powitalna',
        subject: '👋 Witaj w {{ company_name }}!',
        previewText: 'Cieszymy się, że do nas dołączyłeś',
        category: 'welcome',
        tags: ['powitanie', 'onboarding', 'welcome'],
        content: {
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%); padding: 50px; text-align: center;">
                <h1 style="color: white; font-size: 36px; margin: 0;">Witaj!</h1>
                <p style="color: white; font-size: 18px; margin: 15px 0;">Cieszymy się, że jesteś z nami</p>
              </div>
              <div style="padding: 40px; background: #ffffff;">
                <p style="color: #333; font-size: 16px; line-height: 1.8;">
                  Cześć <strong>{{ first_name }}</strong>,
                </p>
                <p style="color: #666; font-size: 16px; line-height: 1.8;">
                  Dziękujemy za rejestrację! Jesteśmy podekscytowani, że dołączyłeś do naszej społeczności.
                </p>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 30px 0;">
                  <h3 style="color: #2575fc; margin: 0 0 15px 0;">Co dalej?</h3>
                  <ul style="color: #666; line-height: 2;">
                    <li>Uzupełnij swój profil</li>
                    <li>Przeglądaj nasze produkty</li>
                    <li>Zapisz się na newsletter</li>
                  </ul>
                </div>
                <a href="#" style="display: inline-block; background: #2575fc; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px;">
                  Rozpocznij
                </a>
              </div>
            </div>
          `,
          text: 'Witaj! Cieszymy się, że dołączyłeś do naszej społeczności.',
          design: {
            backgroundColor: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            primaryColor: '#2575fc',
            secondaryColor: '#6a11cb',
          },
        },
        status: 'active',
        thumbnailUrl: 'https://via.placeholder.com/300x400/2575fc/ffffff?text=Welcome',
        statistics: {
          usageCount: 89,
          lastUsedAt: new Date('2024-12-03'),
          campaignsCount: 3,
          avgOpenRate: 45.2,
          avgClickRate: 8.9,
        },
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-10-15'),
        isDefault: true,
      },
      {
        id: '4',
        name: 'Transakcja - Potwierdzenie zamówienia',
        subject: '✅ Potwierdzenie zamówienia #{{ order_number }}',
        previewText: 'Dziękujemy za zamówienie. Przygotowujemy je do wysyłki.',
        category: 'transactional',
        tags: ['zamówienie', 'potwierdzenie', 'transakcja'],
        content: {
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
              <div style="background: #27ae60; padding: 30px; text-align: center;">
                <h1 style="color: white; font-size: 28px; margin: 0;">Zamówienie potwierdzone</h1>
              </div>
              <div style="padding: 40px;">
                <p style="color: #333; font-size: 16px;">Cześć {{ customer_name }},</p>
                <p style="color: #666; font-size: 14px; line-height: 1.6;">
                  Dziękujemy za złożenie zamówienia. Numer zamówienia: <strong>#{{ order_number }}</strong>
                </p>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 30px 0;">
                  <h3 style="color: #27ae60; margin: 0 0 15px 0;">Szczegóły zamówienia</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 10px 0; border-bottom: 1px solid #dee2e6;">Produkt</td>
                      <td style="padding: 10px 0; border-bottom: 1px solid #dee2e6; text-align: right;">Cena</td>
                    </tr>
                    <!-- Items will be populated dynamically -->
                  </table>
                </div>
                <p style="color: #666; font-size: 14px;">
                  Wkrótce otrzymasz kolejnego maila z informacją o wysyłce.
                </p>
              </div>
            </div>
          `,
          text: 'Potwierdzenie zamówienia - dziękujemy za zakupy!',
          design: {
            backgroundColor: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            primaryColor: '#27ae60',
          },
        },
        status: 'active',
        thumbnailUrl: 'https://via.placeholder.com/300x400/27ae60/ffffff?text=Order',
        statistics: {
          usageCount: 342,
          lastUsedAt: new Date('2024-12-04'),
          campaignsCount: 1,
          avgOpenRate: 78.4,
          avgClickRate: 12.3,
        },
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-09-20'),
        isDefault: true,
      },
      {
        id: '5',
        name: 'Ogłoszenie - Nowa funkcja',
        subject: '🚀 Nowa funkcja w {{ product_name }}',
        previewText: 'Sprawdź co nowego przygotowaliśmy dla Ciebie',
        category: 'announcement',
        tags: ['ogłoszenie', 'nowość', 'funkcja'],
        content: {
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #ff6b6b; padding: 40px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 10px;">🚀</div>
                <h1 style="color: white; font-size: 32px; margin: 0;">Nowa funkcja!</h1>
              </div>
              <div style="padding: 40px; background: #ffffff;">
                <h2 style="color: #333; font-size: 24px;">Przygotowaliśmy dla Ciebie nowość</h2>
                <p style="color: #666; font-size: 16px; line-height: 1.8;">
                  Z przyjemnością informujemy, że właśnie uruchomiliśmy nową funkcję, która jeszcze bardziej ułatwi Ci pracę.
                </p>
                <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 30px 0;">
                  <h3 style="color: #856404; margin: 0 0 10px 0;">Co nowego?</h3>
                  <p style="color: #856404; margin: 0; font-size: 14px;">
                    Szczegółowy opis nowej funkcjonalności...
                  </p>
                </div>
                <a href="#" style="display: inline-block; background: #ff6b6b; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px;">
                  Wypróbuj teraz
                </a>
              </div>
            </div>
          `,
          text: 'Nowa funkcja - sprawdź co przygotowaliśmy dla Ciebie!',
          design: {
            backgroundColor: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            primaryColor: '#ff6b6b',
            secondaryColor: '#ffc107',
          },
        },
        status: 'draft',
        thumbnailUrl: 'https://via.placeholder.com/300x400/ff6b6b/ffffff?text=New+Feature',
        statistics: {
          usageCount: 0,
          campaignsCount: 0,
        },
        createdAt: new Date('2024-12-01'),
        updatedAt: new Date('2024-12-01'),
        isDefault: false,
      },
      {
        id: '6',
        name: 'Zaproszenie na wydarzenie',
        subject: '🎉 Zaproszenie na {{ event_name }}',
        previewText: 'Mamy dla Ciebie specjalne zaproszenie!',
        category: 'event',
        tags: ['wydarzenie', 'zaproszenie', 'event'],
        content: {
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 50px; text-align: center;">
                <h1 style="color: white; font-size: 36px; margin: 0;">Jesteś zaproszony!</h1>
              </div>
              <div style="padding: 40px; background: #ffffff;">
                <h2 style="color: #f5576c; font-size: 26px; text-align: center;">{{ event_name }}</h2>
                <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 30px 0;">
                  <div style="display: flex; margin-bottom: 15px;">
                    <span style="color: #f5576c; font-weight: bold; width: 100px;">Data:</span>
                    <span style="color: #666;">{{ event_date }}</span>
                  </div>
                  <div style="display: flex; margin-bottom: 15px;">
                    <span style="color: #f5576c; font-weight: bold; width: 100px;">Godzina:</span>
                    <span style="color: #666;">{{ event_time }}</span>
                  </div>
                  <div style="display: flex;">
                    <span style="color: #f5576c; font-weight: bold; width: 100px;">Miejsce:</span>
                    <span style="color: #666;">{{ event_location }}</span>
                  </div>
                </div>
                <p style="color: #666; font-size: 16px; line-height: 1.8; text-align: center;">
                  Nie przegap tej wyjątkowej okazji!
                </p>
                <div style="text-align: center;">
                  <a href="#" style="display: inline-block; background: #f5576c; color: white; padding: 15px 50px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                    Potwierdzam obecność
                  </a>
                </div>
              </div>
            </div>
          `,
          text: 'Zaproszenie na wydarzenie - potwierdzam obecność',
          design: {
            backgroundColor: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            primaryColor: '#f5576c',
            secondaryColor: '#f093fb',
          },
        },
        status: 'active',
        thumbnailUrl: 'https://via.placeholder.com/300x400/f5576c/ffffff?text=Event',
        statistics: {
          usageCount: 8,
          lastUsedAt: new Date('2024-11-15'),
          campaignsCount: 4,
          avgOpenRate: 52.3,
          avgClickRate: 18.7,
        },
        createdAt: new Date('2024-05-20'),
        updatedAt: new Date('2024-11-10'),
        isDefault: false,
      },
      {
        id: '7',
        name: 'Ankieta zadowolenia klienta',
        subject: '📊 Pomóż nam się rozwijać - wypełnij ankietę',
        previewText: 'Twoja opinia jest dla nas bardzo ważna',
        category: 'survey',
        tags: ['ankieta', 'feedback', 'opinia'],
        content: {
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #4a90e2; padding: 40px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 10px;">📊</div>
                <h1 style="color: white; font-size: 28px; margin: 0;">Podziel się swoją opinią</h1>
              </div>
              <div style="padding: 40px; background: #ffffff;">
                <p style="color: #333; font-size: 16px; line-height: 1.8;">
                  Cześć {{ first_name }},
                </p>
                <p style="color: #666; font-size: 16px; line-height: 1.8;">
                  Twoja opinia jest dla nas niezwykle ważna. Prosimy o poświęcenie kilku minut na wypełnienie krótkiej ankiety.
                </p>
                <div style="background: #e3f2fd; padding: 20px; border-radius: 5px; margin: 30px 0;">
                  <h3 style="color: #4a90e2; margin: 0 0 10px 0;">Ankieta zajmie Ci tylko 2 minuty</h3>
                  <p style="color: #666; margin: 0; font-size: 14px;">
                    Twoje odpowiedzi pomogą nam lepiej dopasować nasze usługi do Twoich potrzeb.
                  </p>
                </div>
                <div style="text-align: center;">
                  <a href="#" style="display: inline-block; background: #4a90e2; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px;">
                    Wypełnij ankietę
                  </a>
                </div>
                <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
                  Dziękujemy za Twój czas!
                </p>
              </div>
            </div>
          `,
          text: 'Twoja opinia jest dla nas ważna - wypełnij krótką ankietę',
          design: {
            backgroundColor: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            primaryColor: '#4a90e2',
          },
        },
        status: 'archived',
        thumbnailUrl: 'https://via.placeholder.com/300x400/4a90e2/ffffff?text=Survey',
        statistics: {
          usageCount: 12,
          lastUsedAt: new Date('2024-08-20'),
          campaignsCount: 6,
          avgOpenRate: 38.5,
          avgClickRate: 15.2,
        },
        createdAt: new Date('2024-04-05'),
        updatedAt: new Date('2024-08-25'),
        isDefault: false,
      },
    ];
  }
}
