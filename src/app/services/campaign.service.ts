import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, map } from 'rxjs';
import { Campaign, CampaignStatus, CampaignType } from '../models/campaign.model';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private campaignsSubject = new BehaviorSubject<Campaign[]>(this.getMockCampaigns());
  campaigns$ = this.campaignsSubject.asObservable();

  constructor() {}

  getCampaigns(): Observable<Campaign[]> {
    return this.campaigns$;
  }

  getCampaignById(id: string): Observable<Campaign | null> {
    return this.campaigns$.pipe(
      map(campaigns => campaigns.find(c => c.id === id) || null)
    );
  }

  createCampaign(campaign: Partial<Campaign>): Observable<Campaign> {
    const newCampaign: Campaign = {
      id: this.generateId(),
      name: campaign.name || 'Nowa kampania',
      subject: campaign.subject || '',
      fromName: campaign.fromName || 'Twoja Firma',
      fromEmail: campaign.fromEmail || 'kontakt@twojafirma.pl',
      status: 'draft',
      type: campaign.type || 'regular',
      content: campaign.content || { html: '', text: '' },
      recipients: campaign.recipients || { type: 'all', totalCount: 0 },
      statistics: {
        sent: 0,
        delivered: 0,
        opens: 0,
        uniqueOpens: 0,
        clicks: 0,
        uniqueClicks: 0,
        bounces: 0,
        softBounces: 0,
        hardBounces: 0,
        unsubscribes: 0,
        complaints: 0,
        performance: {
          openRate: 0,
          clickRate: 0,
          clickToOpenRate: 0,
          bounceRate: 0,
          unsubscribeRate: 0
        }
      },
      settings: {
        trackOpens: true,
        trackClicks: true,
        googleAnalytics: {
          enabled: false
        }
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      ...campaign
    };

    const currentCampaigns = this.campaignsSubject.value;
    this.campaignsSubject.next([...currentCampaigns, newCampaign]);

    return of(newCampaign);
  }

  updateCampaign(id: string, updates: Partial<Campaign>): Observable<Campaign> {
    const currentCampaigns = this.campaignsSubject.value;
    const index = currentCampaigns.findIndex(c => c.id === id);

    if (index === -1) {
      throw new Error('Campaign not found');
    }

    const updatedCampaign = {
      ...currentCampaigns[index],
      ...updates,
      updatedAt: new Date()
    };

    const updatedCampaigns = [...currentCampaigns];
    updatedCampaigns[index] = updatedCampaign;

    this.campaignsSubject.next(updatedCampaigns);

    return of(updatedCampaign);
  }

  deleteCampaign(id: string): Observable<boolean> {
    const currentCampaigns = this.campaignsSubject.value;
    const filteredCampaigns = currentCampaigns.filter(c => c.id !== id);

    this.campaignsSubject.next(filteredCampaigns);

    return of(true);
  }

  duplicateCampaign(id: string): Observable<Campaign> {
    const currentCampaigns = this.campaignsSubject.value;
    const original = currentCampaigns.find(c => c.id === id);

    if (!original) {
      throw new Error('Campaign not found');
    }

    const duplicate: Campaign = {
      ...original,
      id: this.generateId(),
      name: `${original.name} (kopia)`,
      status: 'draft',
      statistics: {
        sent: 0,
        delivered: 0,
        opens: 0,
        uniqueOpens: 0,
        clicks: 0,
        uniqueClicks: 0,
        bounces: 0,
        softBounces: 0,
        hardBounces: 0,
        unsubscribes: 0,
        complaints: 0,
        performance: {
          openRate: 0,
          clickRate: 0,
          clickToOpenRate: 0,
          bounceRate: 0,
          unsubscribeRate: 0
        }
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      sentAt: undefined,
      scheduledFor: undefined
    };

    this.campaignsSubject.next([...currentCampaigns, duplicate]);

    return of(duplicate);
  }

  sendCampaign(id: string): Observable<Campaign> {
    return this.updateCampaign(id, {
      status: 'sending',
      sentAt: new Date()
    });
  }

  scheduleCampaign(id: string, scheduledFor: Date): Observable<Campaign> {
    return this.updateCampaign(id, {
      status: 'scheduled',
      scheduledFor
    });
  }

  pauseCampaign(id: string): Observable<Campaign> {
    return this.updateCampaign(id, { status: 'paused' });
  }

  resumeCampaign(id: string): Observable<Campaign> {
    return this.updateCampaign(id, { status: 'sending' });
  }

  getCampaignStats(): Observable<{total: number, draft: number, scheduled: number, sent: number}> {
    return this.campaigns$.pipe(
      map(campaigns => ({
        total: campaigns.length,
        draft: campaigns.filter(c => c.status === 'draft').length,
        scheduled: campaigns.filter(c => c.status === 'scheduled').length,
        sent: campaigns.filter(c => c.status === 'sent').length
      }))
    );
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private getMockCampaigns(): Campaign[] {
    return [
      {
        id: '1',
        name: 'Newsletter Czerwiec 2024',
        subject: 'Najnowsze trendy w marketingu emailowym',
        preheader: 'Odkryj co działa najlepiej w 2024 roku',
        fromName: 'Zespół Mailist',
        fromEmail: 'newsletter@mailist.com',
        replyTo: 'kontakt@mailist.com',
        status: 'sent',
        type: 'regular',
        content: {
          html: '<h1>Newsletter</h1><p>Treść newslettera...</p>',
          text: 'Newsletter - Treść newslettera...'
        },
        recipients: {
          type: 'lists',
          listIds: ['list-1', 'list-2'],
          totalCount: 2543
        },
        statistics: {
          sent: 2543,
          delivered: 2521,
          opens: 1134,
          uniqueOpens: 1089,
          clicks: 342,
          uniqueClicks: 298,
          bounces: 22,
          softBounces: 15,
          hardBounces: 7,
          unsubscribes: 12,
          complaints: 2,
          performance: {
            openRate: 43.2,
            clickRate: 13.5,
            clickToOpenRate: 27.4,
            bounceRate: 0.9,
            unsubscribeRate: 0.5
          }
        },
        settings: {
          trackOpens: true,
          trackClicks: true,
          googleAnalytics: {
            enabled: true,
            campaign: 'newsletter_june',
            source: 'email',
            medium: 'newsletter'
          }
        },
        createdAt: new Date('2024-06-15'),
        updatedAt: new Date('2024-06-20'),
        sentAt: new Date('2024-06-20T10:00:00')
      },
      {
        id: '2',
        name: 'Promocja Letnia - 30% zniżki',
        subject: '🔥 Tylko dziś! 30% zniżki na wszystkie produkty',
        preheader: 'Nie przegap tej okazji - oferta ważna tylko 24h',
        fromName: 'Mailist Shop',
        fromEmail: 'promocje@mailist.com',
        status: 'sent',
        type: 'regular',
        content: {
          html: '<h1>Promocja</h1>',
          text: 'Promocja letnia'
        },
        recipients: {
          type: 'segments',
          segmentIds: ['segment-active-users'],
          totalCount: 4231
        },
        statistics: {
          sent: 4231,
          delivered: 4187,
          opens: 2344,
          uniqueOpens: 2198,
          clicks: 876,
          uniqueClicks: 734,
          bounces: 44,
          softBounces: 28,
          hardBounces: 16,
          unsubscribes: 23,
          complaints: 5,
          performance: {
            openRate: 52.5,
            clickRate: 20.9,
            clickToOpenRate: 33.4,
            bounceRate: 1.0,
            unsubscribeRate: 0.5
          }
        },
        settings: {
          trackOpens: true,
          trackClicks: true,
          googleAnalytics: {
            enabled: true,
            campaign: 'summer_promo',
            source: 'email',
            medium: 'promo'
          }
        },
        createdAt: new Date('2024-07-01'),
        updatedAt: new Date('2024-07-05'),
        sentAt: new Date('2024-07-05T09:00:00')
      },
      {
        id: '3',
        name: 'Webinar - Email Marketing w 2024',
        subject: 'Zaproszenie na bezpłatny webinar o email marketingu',
        preheader: 'Zapisz się już dziś i zdobądź certyfikat',
        fromName: 'Mailist Academy',
        fromEmail: 'academy@mailist.com',
        status: 'scheduled',
        type: 'regular',
        content: {
          html: '<h1>Webinar</h1>',
          text: 'Zaproszenie na webinar'
        },
        recipients: {
          type: 'tags',
          tagIds: ['tag-interested-in-webinars'],
          totalCount: 1234
        },
        schedule: {
          type: 'scheduled',
          scheduledAt: new Date('2024-11-15T14:00:00'),
          timezone: 'Europe/Warsaw'
        },
        statistics: {
          sent: 0,
          delivered: 0,
          opens: 0,
          uniqueOpens: 0,
          clicks: 0,
          uniqueClicks: 0,
          bounces: 0,
          softBounces: 0,
          hardBounces: 0,
          unsubscribes: 0,
          complaints: 0,
          performance: {
            openRate: 0,
            clickRate: 0,
            clickToOpenRate: 0,
            bounceRate: 0,
            unsubscribeRate: 0
          }
        },
        settings: {
          trackOpens: true,
          trackClicks: true
        },
        createdAt: new Date('2024-11-01'),
        updatedAt: new Date('2024-11-01'),
        scheduledFor: new Date('2024-11-15T14:00:00')
      },
      {
        id: '4',
        name: 'Test A/B - Temat vs Nadawca',
        subject: 'Nowości w naszej ofercie',
        fromName: 'Mailist',
        fromEmail: 'kontakt@mailist.com',
        status: 'draft',
        type: 'ab_test',
        content: {
          html: '<h1>Nowości</h1>',
          text: 'Nowości w ofercie'
        },
        recipients: {
          type: 'all',
          totalCount: 5000
        },
        statistics: {
          sent: 0,
          delivered: 0,
          opens: 0,
          uniqueOpens: 0,
          clicks: 0,
          uniqueClicks: 0,
          bounces: 0,
          softBounces: 0,
          hardBounces: 0,
          unsubscribes: 0,
          complaints: 0,
          performance: {
            openRate: 0,
            clickRate: 0,
            clickToOpenRate: 0,
            bounceRate: 0,
            unsubscribeRate: 0
          }
        },
        settings: {
          trackOpens: true,
          trackClicks: true
        },
        createdAt: new Date('2024-11-03'),
        updatedAt: new Date('2024-11-03')
      }
    ];
  }
}
