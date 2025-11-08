import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Campaign, CampaignStatus, CampaignType } from '../models/campaign.model';
import { ApiService } from '../core/api/api.service';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private apiService = inject(ApiService);

  constructor() {}

  getCampaigns(): Observable<Campaign[]> {
    return this.apiService.get<any>('campaigns')
      .pipe(
        map(response => {
          // Backend returns Spring Page object
          const campaigns = response.content || [];
          return campaigns.map((item: any) => this.mapBackendToFrontend(item));
        })
      );
  }

  getCampaignById(id: string): Observable<Campaign | null> {
    return this.apiService.get<any>(`campaigns/${id}`)
      .pipe(
        map(campaign => this.mapBackendToFrontend(campaign))
      );
  }

  createCampaign(campaign: Partial<Campaign>): Observable<Campaign> {
    const backendPayload = this.mapFrontendToBackend(campaign);
    return this.apiService.post<any>('campaigns', backendPayload)
      .pipe(map(response => this.mapBackendToFrontend(response)));
  }

  updateCampaign(id: string, updates: Partial<Campaign>): Observable<Campaign> {
    const backendPayload = this.mapFrontendToBackend(updates);
    return this.apiService.put<any>(`campaigns/${id}`, backendPayload)
      .pipe(map(response => this.mapBackendToFrontend(response)));
  }

  deleteCampaign(id: string): Observable<boolean> {
    return this.apiService.delete<void>(`campaigns/${id}`)
      .pipe(map(() => true));
  }

  duplicateCampaign(id: string): Observable<Campaign> {
    return this.apiService.post<any>(`campaigns/${id}/duplicate`, {})
      .pipe(map(response => this.mapBackendToFrontend(response)));
  }

  sendCampaign(id: string): Observable<Campaign> {
    return this.apiService.post<any>(`campaigns/${id}/send`, { senderEmail: 'noreply@mailist.com' })
      .pipe(map(response => this.mapBackendToFrontend(response)));
  }

  scheduleCampaign(id: string, scheduledFor: Date): Observable<Campaign> {
    return this.apiService.post<any>(`campaigns/${id}/schedule`, { scheduledFor })
      .pipe(map(response => this.mapBackendToFrontend(response)));
  }

  pauseCampaign(id: string): Observable<Campaign> {
    return this.apiService.post<any>(`campaigns/${id}/pause`, {})
      .pipe(map(response => this.mapBackendToFrontend(response)));
  }

  resumeCampaign(id: string): Observable<Campaign> {
    return this.apiService.post<any>(`campaigns/${id}/resume`, {})
      .pipe(map(response => this.mapBackendToFrontend(response)));
  }

  getCampaignStats(): Observable<{total: number, draft: number, scheduled: number, sent: number}> {
    return this.apiService.get<any>('campaigns/statistics')
      .pipe(map(stats => stats));
  }

  /**
   * Map backend response to frontend Campaign model
   */
  private mapBackendToFrontend(backendData: any): Campaign {
    return {
      id: backendData.id?.toString() || '',
      name: backendData.name || '',
      subject: backendData.subject || '',
      preheader: backendData.preheader,
      fromName: backendData.fromName || '',
      fromEmail: backendData.fromEmail || '',
      replyTo: backendData.replyTo,
      status: backendData.status || 'draft',
      type: backendData.type || 'regular',
      content: {
        html: backendData.htmlContent || '',
        text: backendData.textContent || ''
      },
      recipients: {
        type: 'all',
        totalCount: backendData.recipientCount || 0
      },
      statistics: backendData.statistics || {
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
      createdAt: backendData.createdAt ? new Date(backendData.createdAt) : new Date(),
      updatedAt: backendData.updatedAt ? new Date(backendData.updatedAt) : new Date(),
      sentAt: backendData.sentAt ? new Date(backendData.sentAt) : undefined,
      scheduledFor: backendData.scheduledAt ? new Date(backendData.scheduledAt) : undefined
    };
  }

  /**
   * Map frontend Campaign model to backend payload
   */
  private mapFrontendToBackend(frontendData: Partial<Campaign>): any {
    return {
      name: frontendData.name,
      subject: frontendData.subject,
      preheader: frontendData.preheader,
      fromName: frontendData.fromName,
      fromEmail: frontendData.fromEmail,
      replyTo: frontendData.replyTo,
      type: frontendData.type,
      htmlContent: frontendData.content?.html,
      textContent: frontendData.content?.text,
      recipients: [] // TODO: Map recipients properly
    };
  }
}
