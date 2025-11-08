import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideLayoutTemplate,
  lucideSearch,
  lucidePlus,
  lucidePencil,
  lucideCopy,
  lucideTrash2,
  lucideEye,
  lucideArchive,
  lucideCircleCheck,
  lucideFileText,
  lucideTags,
  lucideChevronsLeft,
  lucideChevronLeft,
  lucideChevronRight,
  lucideChevronsRight,
} from '@ng-icons/lucide';
import { TranslateModule } from '@ngx-translate/core';

import { PageTitle } from '../../../components/page-title/page-title';
import { TemplateService } from '../../../services/template.service';
import {
  Template,
  TemplateCategory,
  TemplateStatus,
} from '../../../models/template.model';

@Component({
  selector: 'app-templates-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon, PageTitle, TranslateModule],
  providers: [
    provideIcons({
      lucideLayoutTemplate,
      lucideSearch,
      lucidePlus,
      lucidePencil,
      lucideCopy,
      lucideTrash2,
      lucideEye,
      lucideArchive,
      lucideCircleCheck,
      lucideFileText,
      lucideTags,
      lucideChevronsLeft,
      lucideChevronLeft,
      lucideChevronRight,
      lucideChevronsRight,
    }),
  ],
  templateUrl: './templates-list.html',
  styleUrl: './templates-list.css',
})
export class TemplatesList implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  templates: Template[] = [];
  filteredTemplates: Template[] = [];
  isLoading = false;

  // Filter properties
  searchTerm = '';
  selectedStatus: TemplateStatus | '' = '';
  selectedCategory: TemplateCategory | '' = '';

  // Statistics
  stats = {
    total: 0,
    draft: 0,
    active: 0,
    archived: 0,
  };

  // Pagination properties
  currentPage = 0;
  pageSize = 20;
  totalPages = 0;
  totalElements = 0;

  // Expose Math to template
  Math = Math;

  constructor(
    private templateService: TemplateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTemplates();
    this.loadStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTemplates(): void {
    this.isLoading = true;
    this.templateService
      .getTemplates()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (templates) => {
          this.templates = templates;
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading templates:', error);
          this.isLoading = false;
        },
      });
  }

  loadStats(): void {
    this.templateService
      .getTemplateStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.stats = stats;
        },
        error: (error) => {
          console.error('Error loading stats:', error);
        },
      });
  }

  applyFilters(): void {
    this.filteredTemplates = this.templates.filter((template) => {
      const matchesSearch =
        !this.searchTerm ||
        template.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        template.subject.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        template.tags.some((tag) =>
          tag.toLowerCase().includes(this.searchTerm.toLowerCase())
        );

      const matchesStatus =
        !this.selectedStatus || template.status === this.selectedStatus;

      const matchesCategory =
        !this.selectedCategory || template.category === this.selectedCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    });

    // Update pagination
    this.totalElements = this.filteredTemplates.length;
    this.totalPages = Math.ceil(this.totalElements / this.pageSize);

    // Reset to first page if current page is out of bounds
    if (this.currentPage >= this.totalPages && this.totalPages > 0) {
      this.currentPage = 0;
    }
  }

  createTemplate(): void {
    this.router.navigate(['/templates/create']);
  }

  editTemplate(template: Template): void {
    this.router.navigate(['/templates/edit', template.id]);
  }

  viewTemplate(template: Template): void {
    this.router.navigate(['/templates', template.id]);
  }

  duplicateTemplate(template: Template): void {
    if (
      confirm(
        `Czy na pewno chcesz zduplikować szablon "${template.name}"?`
      )
    ) {
      this.templateService
        .duplicateTemplate(template.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadTemplates();
            this.loadStats();
          },
          error: (error) => {
            console.error('Error duplicating template:', error);
            alert('Wystąpił błąd podczas duplikowania szablonu');
          },
        });
    }
  }

  deleteTemplate(template: Template): void {
    if (
      confirm(
        `Czy na pewno chcesz usunąć szablon "${template.name}"? Tej operacji nie można cofnąć.`
      )
    ) {
      this.templateService
        .deleteTemplate(template.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadTemplates();
            this.loadStats();
          },
          error: (error) => {
            console.error('Error deleting template:', error);
            alert('Wystąpił błąd podczas usuwania szablonu');
          },
        });
    }
  }

  archiveTemplate(template: Template): void {
    this.templateService
      .archiveTemplate(template.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadTemplates();
          this.loadStats();
        },
        error: (error) => {
          console.error('Error archiving template:', error);
          alert('Wystąpił błąd podczas archiwizowania szablonu');
        },
      });
  }

  activateTemplate(template: Template): void {
    this.templateService
      .activateTemplate(template.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadTemplates();
          this.loadStats();
        },
        error: (error) => {
          console.error('Error activating template:', error);
          alert('Wystąpił błąd podczas aktywowania szablonu');
        },
      });
  }

  getStatusLabel(status: TemplateStatus): string {
    const labels: Record<TemplateStatus, string> = {
      draft: 'TEMPLATES.STATUS.DRAFT',
      active: 'TEMPLATES.STATUS.ACTIVE',
      archived: 'TEMPLATES.STATUS.ARCHIVED',
    };
    return labels[status] || status;
  }

  getCategoryLabel(category: TemplateCategory): string {
    const labels: Record<TemplateCategory, string> = {
      promotional: 'TEMPLATES.CATEGORY.PROMOTIONAL',
      newsletter: 'TEMPLATES.CATEGORY.NEWSLETTER',
      welcome: 'TEMPLATES.CATEGORY.WELCOME',
      transactional: 'TEMPLATES.CATEGORY.TRANSACTIONAL',
      announcement: 'TEMPLATES.CATEGORY.ANNOUNCEMENT',
      event: 'TEMPLATES.CATEGORY.EVENT',
      survey: 'TEMPLATES.CATEGORY.SURVEY',
      other: 'TEMPLATES.CATEGORY.OTHER',
    };
    return labels[category] || category;
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '—';
    return new Intl.DateTimeFormat('pl-PL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('pl-PL').format(num);
  }

  // Pagination methods
  get paginatedTemplates(): Template[] {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredTemplates.slice(start, end);
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
