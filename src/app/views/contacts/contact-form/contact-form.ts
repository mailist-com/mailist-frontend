import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { TranslatePipe } from '@ngx-translate/core';

import { PageTitle } from '../../../components/page-title/page-title';
import { ContactService } from '../../../services/contact.service';
import { ContactListService } from '../../../services/contact-list.service';
import { Contact, CustomField } from '../../../models/contact.model';
import { ContactList } from '../../../models/contact-list.model';

@Component({
  selector: 'app-contact-form',
  imports: [CommonModule, ReactiveFormsModule, NgIcon, PageTitle, TranslatePipe],
  templateUrl: './contact-form.html'
})
export class ContactForm implements OnInit {
  contactForm!: FormGroup;
  contactId: string | null = null;
  isEditing = false;
  isLoading = false;
  availableLists: ContactList[] = [];
  availableTags = ['premium', 'developer', 'designer', 'angular', 'asp.net', 'senior', 'customer', 'prospect'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private contactService: ContactService,
    private contactListService: ContactListService
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.contactId = this.route.snapshot.paramMap.get('id');
    this.isEditing = !!this.contactId;

    this.loadLists();

    if (this.isEditing && this.contactId) {
      this.loadContact(this.contactId);
    }
  }

  get customFields() {
    return this.contactForm.get('customFields') as FormArray;
  }

  get lists() {
    return this.contactForm.get('lists') as FormArray;
  }

  get tags() {
    return this.contactForm.get('tags') as FormArray;
  }

  initForm() {
    this.contactForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      organization: [''],
      status: ['active', Validators.required],
      subscriptionStatus: ['subscribed', Validators.required],
      customFields: this.fb.array([]),
      lists: this.fb.array([]),
      tags: this.fb.array([]),
      location: this.fb.group({
        country: [''],
        state: [''],
        city: [''],
        zipCode: [''],
        timezone: ['']
      })
    });
  }

  loadContact(id: string) {
    this.isLoading = true;
    this.contactService.getContact(id).subscribe({
      next: (contact) => {
        if (contact) {
          this.populateForm(contact);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading contact:', error);
        this.isLoading = false;
      }
    });
  }

  loadLists() {
    this.contactListService.getLists().subscribe({
      next: (lists) => {
        this.availableLists = lists;
      }
    });
  }

  populateForm(contact: Contact) {
    this.contactForm.patchValue({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone || '',
      organization: contact.organization || '',
      status: contact.status,
      subscriptionStatus: contact.subscriptionStatus,
      location: contact.location || {}
    });

    // Populate custom fields
    if (contact.customFields && contact.customFields.length > 0) {
      contact.customFields.forEach(field => {
        this.addCustomField(field);
      });
    }

    // Populate lists
    if (contact.lists && contact.lists.length > 0) {
      contact.lists.forEach(listId => {
        this.addList(listId);
      });
    }

    // Populate tags
    if (contact.tags && contact.tags.length > 0) {
      contact.tags.forEach(tag => {
        this.addTag(tag);
      });
    }
  }

  addCustomField(field?: CustomField) {
    const customFieldGroup = this.fb.group({
      id: [field?.id || this.generateId()],
      name: [field?.name || '', Validators.required],
      value: [field?.value || ''],
      type: [field?.type || 'text', Validators.required]
    });

    this.customFields.push(customFieldGroup);
  }

  removeCustomField(index: number) {
    this.customFields.removeAt(index);
  }

  addList(listId?: string) {
    if (listId && !this.isListSelected(listId)) {
      this.lists.push(this.fb.control(listId));
    }
  }

  removeList(index: number) {
    this.lists.removeAt(index);
  }

  toggleList(listId: string) {
    const index = this.lists.controls.findIndex(control => control.value === listId);
    if (index >= 0) {
      this.removeList(index);
    } else {
      this.addList(listId);
    }
  }

  isListSelected(listId: string): boolean {
    return this.lists.controls.some(control => control.value === listId);
  }

  addTag(tag?: string) {
    if (tag && !this.isTagSelected(tag)) {
      this.tags.push(this.fb.control(tag));
    }
  }

  removeTag(index: number) {
    this.tags.removeAt(index);
  }

  toggleTag(tag: string) {
    const index = this.tags.controls.findIndex(control => control.value === tag);
    if (index >= 0) {
      this.removeTag(index);
    } else {
      this.addTag(tag);
    }
  }

  isTagSelected(tag: string): boolean {
    return this.tags.controls.some(control => control.value === tag);
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.isLoading = true;
      const formValue = this.contactForm.value;

      const contactData = {
        ...formValue,
        customFields: formValue.customFields || [],
        // Convert list IDs from strings to numbers
        listIds: (formValue.lists || []).map((id: string) => Number(id)).filter((id: number) => !isNaN(id)),
        tags: formValue.tags || []
      };

      // Remove the old 'lists' property
      delete (contactData as any).lists;

      const operation = this.isEditing
        ? this.contactService.updateContact(this.contactId!, contactData)
        : this.contactService.createContact(contactData);

      operation.subscribe({
        next: () => {
          this.router.navigate(['/contacts']);
        },
        error: (error) => {
          console.error('Error saving contact:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel() {
    this.router.navigate(['/contacts']);
  }

  getFieldError(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Invalid email format';
      if (field.errors['minlength']) return `${fieldName} is too short`;
    }
    return '';
  }

  private markFormGroupTouched() {
    Object.keys(this.contactForm.controls).forEach(field => {
      const control = this.contactForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}