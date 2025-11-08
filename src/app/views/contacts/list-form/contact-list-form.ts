import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgIcon } from '@ng-icons/core';

import { PageTitle } from '../../../components/page-title/page-title';
import { ContactListService } from '../../../services/contact-list.service';
import { ContactList, ListType, ListStatus } from '../../../models/contact-list.model';

@Component({
  selector: 'app-contact-list-form',
  imports: [CommonModule, ReactiveFormsModule, NgIcon, PageTitle],
  templateUrl: './contact-list-form.html'
})
export class ContactListFormComponent implements OnInit {
  listForm!: FormGroup;
  isEditing = false;
  isLoading = false;
  listId?: string;
  error: string | null = null;

  listTypes = [
    { value: 'regular', label: 'Regular List', description: 'Standard mailing list for manual contact management' },
    { value: 'smart', label: 'Smart List', description: 'Automatically updates based on contact criteria' },
    { value: 'static', label: 'Static List', description: 'Fixed list that doesn\'t change automatically' }
  ];

  listStatuses = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'archived', label: 'Archived' }
  ];

  customFieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'boolean', label: 'Boolean' },
    { value: 'dropdown', label: 'Dropdown' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private contactListService: ContactListService,
    private cdr: ChangeDetectorRef
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.listId = this.route.snapshot.paramMap.get('id') || undefined;
    this.isEditing = !!this.listId;

    if (this.isEditing && this.listId) {
      this.loadList(this.listId);
    }
  }

  private initializeForm() {
    this.listForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      type: ['regular', Validators.required],
      status: ['active', Validators.required],
      tags: this.fb.array([]),
      settings: this.fb.group({
        doubleOptIn: [true],
        sendWelcomeEmail: [true],
        welcomeEmailSubject: ['Welcome to our mailing list!'],
        welcomeEmailContent: ['Thank you for subscribing to our mailing list.'],
        respectUnsubscribes: [true],
        respectBounces: [true],
        allowPublicSubscription: [false],
        requireConfirmation: [true],
        autoResponderEnabled: [false],
        autoResponderDelay: [0]
      }),
      customFields: this.fb.array([])
    });
  }

  private loadList(id: string) {
    this.isLoading = true;
    this.contactListService.getList(id).subscribe({
      next: (list) => {
        if (list) {
          // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
          setTimeout(() => {
            this.populateForm(list);
            this.isLoading = false;
            this.cdr.markForCheck();
          });
        } else {
          this.isLoading = false;
          this.router.navigate(['/contacts/lists']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.message || 'Failed to load list. Please try again.';
        console.error('Error loading list:', err);
      }
    });
  }

  private populateForm(list: ContactList) {
    this.listForm.patchValue({
      name: list.name,
      description: list.description,
      type: list.type,
      status: list.status,
      settings: list.settings
    });

    // Populate tags
    const tagsArray = this.listForm.get('tags') as FormArray;
    if (list.tags && list.tags.length > 0) {
      list.tags.forEach(tag => {
        tagsArray.push(this.fb.control(tag));
      });
    }

    // Populate custom fields
    const customFieldsArray = this.listForm.get('customFields') as FormArray;
    if (list.customFields && list.customFields.length > 0) {
      list.customFields.forEach(field => {
        customFieldsArray.push(this.fb.group({
          name: [field.name, Validators.required],
          type: [field.type, Validators.required],
          required: [field.required],
          defaultValue: [field.defaultValue],
          options: [field.options?.join(', ') || '']
        }));
      });
    }
  }

  get tags() {
    return this.listForm.get('tags') as FormArray;
  }

  get customFields() {
    return this.listForm.get('customFields') as FormArray;
  }

  addTag() {
    this.tags.push(this.fb.control(''));
  }

  removeTag(index: number) {
    this.tags.removeAt(index);
  }

  addCustomField() {
    this.customFields.push(this.fb.group({
      name: ['', Validators.required],
      type: ['text', Validators.required],
      required: [false],
      defaultValue: [''],
      options: ['']
    }));
  }

  removeCustomField(index: number) {
    this.customFields.removeAt(index);
  }

  onSubmit() {
    if (this.listForm.invalid) {
      this.markFormGroupTouched(this.listForm);
      return;
    }

    this.isLoading = true;
    this.error = null;
    const formValue = this.listForm.value;

    // Process custom fields
    const customFields = formValue.customFields.map((field: any) => ({
      ...field,
      options: field.type === 'dropdown' && field.options
        ? field.options.split(',').map((opt: string) => opt.trim()).filter((opt: string) => opt)
        : undefined
    }));

    const listData = {
      ...formValue,
      customFields,
      tags: formValue.tags.filter((tag: string) => tag.trim())
    };

    // Choose service method based on editing state
    const request$ = this.isEditing && this.listId
      ? this.contactListService.updateList(this.listId, listData)
      : this.contactListService.createList(listData);

    // Handle response in component
    request$.subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/contacts/lists']);
      },
      error: (err) => {
        this.isLoading = false;

        // Handle different error types
        if (err.status === 403) {
          this.error = 'Access forbidden. You do not have permission to perform this action. Please check with your administrator.';
        } else if (err.status === 401) {
          this.error = 'Your session has expired. Please log in again.';
        } else if (err.status === 400) {
          this.error = err.error?.message || 'Invalid data. Please check your input and try again.';
        } else if (err.status === 0) {
          this.error = 'Unable to connect to the server. Please check your internet connection and try again.';
        } else {
          this.error = err.message || err.error?.message || 'Failed to save list. Please try again later.';
        }

        console.error('Error saving list:', err);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  onCancel() {
    this.router.navigate(['/contacts/lists']);
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  getFieldError(fieldName: string): string | null {
    const field = this.listForm.get(fieldName);
    if (field?.invalid && field?.touched) {
      if (field.errors?.['required']) return `${fieldName} is required`;
      if (field.errors?.['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors?.['email']) return 'Please enter a valid email address';
    }
    return null;
  }

  getTypeIcon(type: string): string {
    const typeIcons = {
      'regular': 'lucideList',
      'smart': 'lucideZap',
      'static': 'lucideDatabase'
    };
    return typeIcons[type as keyof typeof typeIcons] || 'lucideList';
  }

  getTypeDescription(type: string): string {
    const typeDesc = this.listTypes.find(t => t.value === type);
    return typeDesc?.description || '';
  }
}