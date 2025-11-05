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
} from '@ng-icons/lucide';

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
  imports: [CommonModule, FormsModule, NgIcon, PageTitle],
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
      draft: 'Szkic',
      active: 'Aktywny',
      archived: 'Zarchiwizowany',
    };
    return labels[status] || status;
  }

  getCategoryLabel(category: TemplateCategory): string {
    const labels: Record<TemplateCategory, string> = {
      promotional: 'Promocyjny',
      newsletter: 'Newsletter',
      welcome: 'Powitalny',
      transactional: 'Transakcyjny',
      announcement: 'Ogłoszenie',
      event: 'Wydarzenie',
      survey: 'Ankieta',
      other: 'Inne',
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
}
