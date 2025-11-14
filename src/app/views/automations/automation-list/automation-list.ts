import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideActivity,
  lucidePlay,
  lucidePause,
  lucideFileText,
  lucideRefreshCw,
  lucidePlus,
  lucideSearch,
  lucideZap,
  lucideWorkflow,
  lucidePencil,
  lucideCopy,
  lucideTrash2,
  lucideChevronsLeft,
  lucideChevronLeft,
  lucideChevronRight,
  lucideChevronsRight,
} from '@ng-icons/lucide';
import { TranslateModule } from '@ngx-translate/core';

import { PageTitle } from '../../../components/page-title/page-title';
import { CustomDropdown, DropdownOption } from '../../../components/custom-dropdown/custom-dropdown';

import { AutomationService } from '../../../services/automation.service';
import { Automation, AutomationStatus, AutomationType } from '../../../models/automation.model';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-automation-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon, PageTitle, TranslateModule, CustomDropdown],
  providers: [provideIcons({
    lucideActivity,
    lucidePlay,
    lucidePause,
    lucideFileText,
    lucideRefreshCw,
    lucidePlus,
    lucideSearch,
    lucideZap,
    lucideWorkflow,
    lucidePencil,
    lucideCopy,
    lucideTrash2,
    lucideChevronsLeft,
    lucideChevronLeft,
    lucideChevronRight,
    lucideChevronsRight,
  })],
  templateUrl: './automation-list.html'
})
export class AutomationList implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  automations: Automation[] = [];
  filteredAutomations: Automation[] = [];

  searchTerm = '';
  selectedStatus = '';
  selectedType = '';

  stats = {
    total: 0,
    active: 0,
    paused: 0,
    draft: 0
  };

  // Pagination properties
  currentPage = 0;
  pageSize = 20;
  totalPages = 0;
  totalElements = 0;

  // Expose Math to template
  Math = Math;

  // Dropdown options
  statusOptions: DropdownOption[] = [
    { value: '', label: 'AUTOMATIONS.STATUS.ALL' },
    { value: 'active', label: 'AUTOMATIONS.STATUS.ACTIVE' },
    { value: 'paused', label: 'AUTOMATIONS.STATUS.PAUSED' },
    { value: 'draft', label: 'AUTOMATIONS.STATUS.DRAFT' },
    { value: 'inactive', label: 'AUTOMATIONS.STATUS.INACTIVE' }
  ];

  typeOptions: DropdownOption[] = [
    { value: '', label: 'AUTOMATIONS.TYPE.ALL' },
    { value: 'welcome_series', label: 'AUTOMATIONS.TYPE.WELCOME_SERIES' },
    { value: 'drip_campaign', label: 'AUTOMATIONS.TYPE.DRIP_CAMPAIGN' },
    { value: 'behavioral', label: 'AUTOMATIONS.TYPE.BEHAVIORAL' },
    { value: 'date_based', label: 'AUTOMATIONS.TYPE.DATE_BASED' },
    { value: 'tag_based', label: 'AUTOMATIONS.TYPE.TAG_BASED' },
    { value: 'custom', label: 'AUTOMATIONS.TYPE.CUSTOM' }
  ];

  pageSizeOptions: DropdownOption[] = [
    { value: 10, label: 'COMMON.PER_PAGE_10' },
    { value: 20, label: 'COMMON.PER_PAGE_20' },
    { value: 50, label: 'COMMON.PER_PAGE_50' },
    { value: 100, label: 'COMMON.PER_PAGE_100' }
  ];

  constructor(
    private automationService: AutomationService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadAutomations();
    this.loadStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAutomations(): void {
    this.automationService.getAutomations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (automations) => {
          this.automations = automations;
          this.applyFilters();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading automations:', error);
          this.toastService.error('Wystąpił błąd podczas ładowania automatyzacji');
        }
      });
  }

  loadStats(): void {
    this.automationService.getAutomationStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.stats = stats;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading stats:', error);
        }
      });
  }

  applyFilters(): void {
    this.filteredAutomations = this.automations.filter(automation => {
      const matchesSearch = !this.searchTerm ||
        automation.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (automation.description && automation.description.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchesStatus = !this.selectedStatus || automation.status === this.selectedStatus;
      const matchesType = !this.selectedType || automation.type === this.selectedType;

      return matchesSearch && matchesStatus && matchesType;
    });

    // Update pagination
    this.totalElements = this.filteredAutomations.length;
    this.totalPages = Math.ceil(this.totalElements / this.pageSize);

    // Reset to first page if current page is out of bounds
    if (this.currentPage >= this.totalPages && this.totalPages > 0) {
      this.currentPage = 0;
    }
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedType = '';
    this.applyFilters();
  }

  refreshAutomations(): void {
    this.loadAutomations();
    this.loadStats();
  }

  createFlowAutomation(): void {
    this.router.navigate(['/automations/create']);
  }

  editAutomation(automation: Automation): void {
    this.router.navigate(['/automations/edit', automation.id]);
  }

  duplicateAutomation(automation: Automation): void {
    this.automationService.duplicateAutomation(automation.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadAutomations();
          this.loadStats();
        },
        error: (error) => {
          console.error('Error duplicating automation:', error);
        }
      });
  }

  toggleAutomationStatus(automation: Automation): void {
    if (automation.status === 'draft') {
      return;
    }

    this.automationService.toggleAutomationStatus(automation.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadAutomations();
          this.loadStats();
        },
        error: (error) => {
          console.error('Error toggling automation status:', error);
        }
      });
  }

  deleteAutomation(automation: Automation): void {
    if (confirm(`Czy na pewno chcesz usunąć automatyzację "${automation.name}"?`)) {
      this.automationService.deleteAutomation(automation.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadAutomations();
            this.loadStats();
          },
          error: (error) => {
            console.error('Error deleting automation:', error);
          }
        });
    }
  }

  getStatusLabel(status: AutomationStatus): string {
    const labels = {
      'active': 'AUTOMATIONS.STATUS.ACTIVE',
      'paused': 'AUTOMATIONS.STATUS.PAUSED',
      'draft': 'AUTOMATIONS.STATUS.DRAFT',
      'inactive': 'AUTOMATIONS.STATUS.INACTIVE'
    };
    return labels[status] || status;
  }

  getTypeLabel(type: AutomationType): string {
    const labels = {
      'welcome_series': 'AUTOMATIONS.TYPE.WELCOME_SERIES',
      'drip_campaign': 'AUTOMATIONS.TYPE.DRIP_CAMPAIGN',
      'behavioral': 'AUTOMATIONS.TYPE.BEHAVIORAL',
      'date_based': 'AUTOMATIONS.TYPE.DATE_BASED',
      'tag_based': 'AUTOMATIONS.TYPE.TAG_BASED',
      'custom': 'AUTOMATIONS.TYPE.CUSTOM'
    };
    return labels[type] || type;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pl-PL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  }

  // Pagination methods
  get paginatedAutomations(): Automation[] {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredAutomations.slice(start, end);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.applyFilters();
  }

  get pages(): number[] {
    return Array.from({length: this.totalPages}, (_, i) => i);
  }
}
