import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { TranslatePipe } from '@ngx-translate/core';
import {
  lucideLayoutTemplate,
  lucideArrowLeft,
  lucideSave,
  lucideX,
  lucideTag,
  lucideAlignLeft,
  lucideEye,
  lucideCode,
} from '@ng-icons/lucide';

import { PageTitle } from '../../../components/page-title/page-title';
import { TemplateService } from '../../../services/template.service';
import {
  Template,
  TemplateCategory,
  TemplateStatus,
  CreateTemplateDTO,
} from '../../../models/template.model';

@Component({
  selector: 'app-template-form',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon, PageTitle, TranslatePipe],
  providers: [
    provideIcons({
      lucideLayoutTemplate,
      lucideArrowLeft,
      lucideSave,
      lucideX,
      lucideTag,
      lucideAlignLeft,
      lucideEye,
      lucideCode,
    }),
  ],
  templateUrl: './template-form.html',
  styleUrl: './template-form.css',
})
export class TemplateForm implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  templateId: string | null = null;
  isEditMode = false;
  isSaving = false;

  // Form data
  template: Partial<CreateTemplateDTO> = {
    name: '',
    subject: '',
    previewText: '',
    category: 'newsletter',
    tags: [],
    content: {
      html: '',
      text: '',
      design: {
        backgroundColor: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        primaryColor: '#667eea',
        secondaryColor: '#764ba2',
      },
    },
    status: 'draft',
  };

  // Tag input
  newTag = '';

  // Preview mode
  showPreview = false;

  // Available options
  categories: Array<{ value: TemplateCategory; label: string }> = [
    { value: 'promotional', label: 'Promocyjny' },
    { value: 'newsletter', label: 'Newsletter' },
    { value: 'welcome', label: 'Powitalny' },
    { value: 'transactional', label: 'Transakcyjny' },
    { value: 'announcement', label: 'Ogłoszenie' },
    { value: 'event', label: 'Wydarzenie' },
    { value: 'survey', label: 'Ankieta' },
    { value: 'other', label: 'Inne' },
  ];

  statuses: Array<{ value: TemplateStatus; label: string }> = [
    { value: 'draft', label: 'Szkic' },
    { value: 'active', label: 'Aktywny' },
    { value: 'archived', label: 'Zarchiwizowany' },
  ];

  constructor(
    private templateService: TemplateService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.templateId = this.route.snapshot.paramMap.get('id');
    if (this.templateId) {
      this.isEditMode = true;
      this.loadTemplate();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTemplate(): void {
    if (!this.templateId) return;

    this.templateService
      .getTemplateById(this.templateId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (template) => {
          if (template) {
            this.template = {
              name: template.name,
              subject: template.subject,
              previewText: template.previewText,
              category: template.category,
              tags: [...template.tags],
              content: { ...template.content },
              status: template.status,
              thumbnailUrl: template.thumbnailUrl,
            };
          } else {
            alert('Szablon nie został znaleziony');
            this.goBack();
          }
        },
        error: (error) => {
          console.error('Error loading template:', error);
          alert('WystpiB bBd podczas Badowania szablonu');
          this.goBack();
        },
      });
  }

  saveTemplate(): void {
    // Basic validation
    if (!this.template.name?.trim()) {
      alert('Nazwa szablonu jest wymagana');
      return;
    }

    if (!this.template.subject?.trim()) {
      alert('Temat wiadomości jest wymagany');
      return;
    }

    if (!this.template.content?.html?.trim()) {
      alert('Tre[ HTML jest wymagana');
      return;
    }

    this.isSaving = true;

    const templateData: CreateTemplateDTO = {
      name: this.template.name!,
      subject: this.template.subject!,
      previewText: this.template.previewText || '',
      category: this.template.category!,
      tags: this.template.tags || [],
      content: this.template.content!,
      status: this.template.status || 'draft',
      thumbnailUrl: this.template.thumbnailUrl,
    };

    const observable = this.isEditMode && this.templateId
      ? this.templateService.updateTemplate(this.templateId, templateData)
      : this.templateService.createTemplate(templateData);

    observable.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.isSaving = false;
        this.router.navigate(['/templates']);
      },
      error: (error) => {
        console.error('Error saving template:', error);
        alert('WystpiB bBd podczas zapisywania szablonu');
        this.isSaving = false;
      },
    });
  }

  addTag(): void {
    const tag = this.newTag.trim();
    if (tag && !this.template.tags?.includes(tag)) {
      this.template.tags = [...(this.template.tags || []), tag];
      this.newTag = '';
    }
  }

  removeTag(tag: string): void {
    this.template.tags = this.template.tags?.filter((t) => t !== tag) || [];
  }

  togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  goBack(): void {
    this.router.navigate(['/templates']);
  }

  cancel(): void {
    if (confirm('Czy na pewno chcesz anulowa? Niezapisane zmiany zostan utracone.')) {
      this.goBack();
    }
  }
}
