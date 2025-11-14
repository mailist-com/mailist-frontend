import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideArrowRight, lucideSave, lucideCheck, lucideInfo, lucideTriangleAlert } from '@ng-icons/lucide';
import { TranslateModule } from '@ngx-translate/core';

import { PageTitle } from '../../../components/page-title/page-title';
import { CustomDropdown, DropdownOption } from '../../../components/custom-dropdown/custom-dropdown';
import { CampaignService } from '../../../services/campaign.service';
import { Campaign } from '../../../models/campaign.model';

@Component({
  selector: 'app-campaign-form',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon, PageTitle, TranslateModule, CustomDropdown],
  providers: [provideIcons({ lucideArrowLeft, lucideArrowRight, lucideSave, lucideCheck, lucideInfo, lucideTriangleAlert })],
  templateUrl: './campaign-form.html',
  styleUrl: './campaign-form.css'
})
export class CampaignForm implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  campaignId: string | null = null;
  isEditMode = false;
  currentStep = 1;
  totalSteps = 5;

  // Dropdown options
  campaignTypeOptions: DropdownOption[] = [
    { value: 'regular', label: 'CAMPAIGNS.TYPE.REGULAR' },
    { value: 'ab_test', label: 'CAMPAIGNS.TYPE.AB_TEST' },
    { value: 'rss', label: 'CAMPAIGNS.TYPE.RSS' },
    { value: 'automated', label: 'CAMPAIGNS.TYPE.AUTOMATED' }
  ];

  // Form data
  campaign: Partial<Campaign> = {
    name: '',
    subject: '',
    preheader: '',
    fromName: '',
    fromEmail: '',
    replyTo: '',
    type: 'regular',
    content: { html: '', text: '' },
    recipients: { type: 'all', totalCount: 0 },
    settings: {
      trackOpens: true,
      trackClicks: true,
      googleAnalytics: { enabled: false }
    }
  };

  // Recipients
  selectedLists: string[] = [];
  selectedSegments: string[] = [];
  selectedTags: string[] = [];

  // Schedule
  scheduleType: 'immediate' | 'scheduled' = 'immediate';
  scheduledDate = '';
  scheduledTime = '';

  // A/B Test
  abTestEnabled = false;
  abTestType: 'subject' | 'from_name' | 'content' = 'subject';

  constructor(
    private campaignService: CampaignService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.campaignId = this.route.snapshot.paramMap.get('id');
    if (this.campaignId) {
      this.isEditMode = true;
      this.loadCampaign();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCampaign(): void {
    if (!this.campaignId) return;

    this.campaignService.getCampaignById(this.campaignId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (campaign) => {
          if (campaign) {
            this.campaign = campaign;
          }
        },
        error: (error) => {
          console.error('Error loading campaign:', error);
        }
      });
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    this.currentStep = step;
  }

  saveCampaign(): void {
    const campaignData: Partial<Campaign> = {
      ...this.campaign,
      recipients: {
        type: this.campaign.recipients!.type || 'all',
        listIds: this.selectedLists.length > 0 ? this.selectedLists : undefined,
        segmentIds: this.selectedSegments.length > 0 ? this.selectedSegments : undefined,
        tagIds: this.selectedTags.length > 0 ? this.selectedTags : undefined,
        totalCount: this.campaign.recipients!.totalCount
      }
    };

    if (this.scheduleType === 'scheduled' && this.scheduledDate && this.scheduledTime) {
      campaignData.schedule = {
        type: 'scheduled',
        scheduledAt: new Date(`${this.scheduledDate}T${this.scheduledTime}`),
        timezone: 'Europe/Warsaw'
      };
    }

    const saveObservable = this.isEditMode && this.campaignId
      ? this.campaignService.updateCampaign(this.campaignId, campaignData)
      : this.campaignService.createCampaign(campaignData);

    saveObservable
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/campaigns']);
        },
        error: (error) => {
          console.error('Error saving campaign:', error);
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/campaigns']);
  }

  getStepTitle(step: number): string {
    const titles = {
      1: 'CAMPAIGNS.STEPS.BASIC_INFO',
      2: 'CAMPAIGNS.STEPS.RECIPIENTS',
      3: 'CAMPAIGNS.STEPS.CONTENT',
      4: 'CAMPAIGNS.STEPS.SCHEDULE',
      5: 'CAMPAIGNS.STEPS.REVIEW'
    };
    return titles[step as keyof typeof titles] || '';
  }

  isStepComplete(step: number): boolean {
    switch(step) {
      case 1:
        return !!(this.campaign.name && this.campaign.subject && this.campaign.fromEmail);
      case 2:
        return true; // Recipients are optional
      case 3:
        return !!(this.campaign.content?.html || this.campaign.content?.text);
      case 4:
        return true; // Schedule is optional
      case 5:
        return this.isStepComplete(1) && this.isStepComplete(3);
      default:
        return false;
    }
  }
}
