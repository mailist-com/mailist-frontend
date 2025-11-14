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
import { CustomDropdown, DropdownOption } from '../../../components/custom-dropdown/custom-dropdown';
import { TemplateService } from '../../../services/template.service';
import { ConfirmService } from '../../../services/confirm.service';
import {
  Template,
  TemplateCategory,
  TemplateStatus,
  CreateTemplateDTO,
} from '../../../models/template.model';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-template-form',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon, PageTitle, TranslatePipe, CustomDropdown],
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

  // Dropdown options
  categoryOptions: DropdownOption[] = [
    { value: 'promotional', label: 'TEMPLATES.CATEGORY.PROMOTIONAL' },
    { value: 'newsletter', label: 'TEMPLATES.CATEGORY.NEWSLETTER' },
    { value: 'welcome', label: 'TEMPLATES.CATEGORY.WELCOME' },
    { value: 'transactional', label: 'TEMPLATES.CATEGORY.TRANSACTIONAL' },
    { value: 'announcement', label: 'TEMPLATES.CATEGORY.ANNOUNCEMENT' },
    { value: 'event', label: 'TEMPLATES.CATEGORY.EVENT' },
    { value: 'survey', label: 'TEMPLATES.CATEGORY.SURVEY' },
    { value: 'other', label: 'TEMPLATES.CATEGORY.OTHER' },
  ];

  statusOptions: DropdownOption[] = [
    { value: 'draft', label: 'TEMPLATES.STATUS.DRAFT' },
    { value: 'active', label: 'TEMPLATES.STATUS.ACTIVE' },
    { value: 'archived', label: 'TEMPLATES.STATUS.ARCHIVED' },
  ];

  fontFamilyOptions: DropdownOption[] = [
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: "'Helvetica Neue', Helvetica, Arial, sans-serif", label: 'Helvetica' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: "'Times New Roman', Times, serif", label: 'Times New Roman' },
    { value: "'Courier New', Courier, monospace", label: 'Courier New' },
    { value: 'Verdana, Geneva, sans-serif', label: 'Verdana' },
  ];

  constructor(
    private templateService: TemplateService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private confirmService: ConfirmService
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
            this.toastService.error('Szablon nie został znaleziony');
            this.goBack();
          }
        },
        error: (error) => {
          console.error('Error loading template:', error);
          this.toastService.error('Wystąpił błąd podczas ładowania szablonu');
          this.goBack();
        },
      });
  }

  saveTemplate(): void {
    // Basic validation
    if (!this.template.name?.trim()) {
      this.toastService.warning('Nazwa szablonu jest wymagana');
      return;
    }

    if (!this.template.subject?.trim()) {
      this.toastService.warning('Temat wiadomości jest wymagany');
      return;
    }

    if (!this.template.content?.html?.trim()) {
      this.toastService.warning('Treść HTML jest wymagana');
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
        this.toastService.error('Wystąpił błąd podczas zapisywania szablonu');
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
