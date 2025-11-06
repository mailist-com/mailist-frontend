import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { Observable, combineLatest, map, switchMap, BehaviorSubject, tap } from 'rxjs';

import { PageTitle } from '../../../components/page-title/page-title';
import { ContactListService } from '../../../services/contact-list.service';
import { ContactService } from '../../../services/contact.service';
import { ContactList, ListType, ListStatus } from '../../../models/contact-list.model';
import { Contact, ContactFilter } from '../../../models/contact.model';

@Component({
  selector: 'app-list-detail',
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule, NgIcon, PageTitle],
  templateUrl: './list-detail.html'
})
export class ListDetailComponent implements OnInit {
  list$!: Observable<ContactList | undefined>;
  contacts$!: Observable<Contact[]>;
  currentList?: ContactList;

  private filterSubject = new BehaviorSubject<ContactFilter>({});

  searchTerm = '';
  selectedStatus = '';

  // Edit mode
  isEditMode = false;
  editForm!: FormGroup;
  isSaving = false;
  saveSuccess = false;
  saveError: string | null = null;
  newTag = '';

  listTypes: { value: ListType; label: string }[] = [
    { value: 'regular', label: 'Regular List' },
    { value: 'smart', label: 'Smart List' },
    { value: 'static', label: 'Static List' }
  ];

  listStatuses: { value: ListStatus; label: string }[] = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'archived', label: 'Archived' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contactListService: ContactListService,
    private contactService: ContactService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    const listId$ = this.route.params.pipe(
      map(params => params['id'])
    );

    this.list$ = listId$.pipe(
      switchMap(id => this.contactListService.getList(id)),
      tap(list => {
        if (list) {
          this.currentList = list;
          this.populateForm(list);
        }
      })
    );

    this.contacts$ = combineLatest([
      listId$,
      this.contactService.getContacts(),
      this.filterSubject.asObservable()
    ]).pipe(
      map(([listId, contacts, filter]) => {
        // Filter contacts that belong to this list
        let filtered = contacts.filter(contact => contact.lists.includes(listId));

        // Apply search filter
        if (filter.search) {
          const searchLower = filter.search.toLowerCase();
          filtered = filtered.filter(contact =>
            contact.email.toLowerCase().includes(searchLower) ||
            contact.firstName.toLowerCase().includes(searchLower) ||
            contact.lastName.toLowerCase().includes(searchLower) ||
            contact.organization?.toLowerCase().includes(searchLower)
          );
        }

        // Apply status filter
        if (filter.status?.length) {
          filtered = filtered.filter(contact => filter.status!.includes(contact.status));
        }

        return filtered;
      })
    );
  }

  onSearch() {
    this.updateFilter();
  }

  onFilterChange() {
    this.updateFilter();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.updateFilter();
  }

  deleteContact(contact: Contact) {
    if (confirm(`Are you sure you want to delete ${contact.firstName} ${contact.lastName}?`)) {
      this.contactService.deleteContact(contact.id).subscribe();
    }
  }

  getInitials(contact: Contact): string {
    return `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase();
  }

  getStatusClass(status: string): string {
    const statusClasses = {
      'active': 'bg-success/10 text-success',
      'unconfirmed': 'bg-warning/10 text-warning',
      'unsubscribed': 'bg-danger/10 text-danger',
      'bounced': 'bg-default-200 text-default-600',
      'blocked': 'bg-danger/20 text-danger'
    };
    return statusClasses[status as keyof typeof statusClasses] || 'bg-default-200 text-default-600';
  }

  getStatusIcon(status: string): string {
    const statusIcons = {
      'active': 'lucideCircleCheck',
      'unconfirmed': 'lucideClock',
      'unsubscribed': 'lucideCircleX',
      'bounced': 'lucideCircleAlert',
      'blocked': 'lucideShieldX'
    };
    return statusIcons[status as keyof typeof statusIcons] || 'lucideCircle';
  }

  getTypeIcon(type: string): string {
    const typeIcons = {
      'regular': 'lucideList',
      'smart': 'lucideZap',
      'static': 'lucideDatabase'
    };
    return typeIcons[type as keyof typeof typeIcons] || 'lucideList';
  }

  getTypeClass(type: string): string {
    const typeClasses = {
      'regular': 'bg-primary/10 text-primary',
      'smart': 'bg-success/10 text-success',
      'static': 'bg-info/10 text-info'
    };
    return typeClasses[type as keyof typeof typeClasses] || 'bg-default-200 text-default-600';
  }

  getListStatusClass(status: string): string {
    const statusClasses = {
      'active': 'bg-success/10 text-success',
      'inactive': 'bg-warning/10 text-warning',
      'archived': 'bg-default-200 text-default-600'
    };
    return statusClasses[status as keyof typeof statusClasses] || 'bg-default-200 text-default-600';
  }

  getEngagementRate(list: ContactList): number {
    if (list.subscriberCount === 0) return 0;
    return ((list.subscriberCount - list.unsubscribedCount) / list.subscriberCount) * 100;
  }

  trackByContactId(index: number, contact: Contact): string {
    return contact.id;
  }

  private updateFilter() {
    const filter: ContactFilter = {
      search: this.searchTerm || undefined,
      status: this.selectedStatus ? [this.selectedStatus as any] : undefined
    };

    this.filterSubject.next(filter);
  }

  // Edit mode methods
  private initializeForm() {
    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      type: ['regular', Validators.required],
      status: ['active', Validators.required],
      tags: this.fb.array([]),
      settings: this.fb.group({
        doubleOptIn: [true],
        welcomeEmail: [true],
        welcomeEmailId: [''],
        unsubscribeRedirectUrl: [''],
        confirmationRedirectUrl: [''],
        notifyOnSubscribe: [false],
        notifyOnUnsubscribe: [false],
        notificationEmail: [''],
        allowPublicSubscription: [false],
        requireNameOnSignup: [false],
        requirePhoneOnSignup: [false],
        respectUnsubscribes: [true],
        respectBounces: [true]
      })
    });
  }

  private populateForm(list: ContactList) {
    this.editForm.patchValue({
      name: list.name,
      description: list.description,
      type: list.type,
      status: list.status,
      settings: list.settings
    });

    // Populate tags
    const tagsArray = this.editForm.get('tags') as FormArray;
    tagsArray.clear();
    list.tags.forEach(tag => {
      tagsArray.push(this.fb.control(tag, Validators.required));
    });
  }

  get tags() {
    return this.editForm.get('tags') as FormArray;
  }

  toggleEditMode() {
    if (this.isEditMode && this.currentList) {
      // Cancel editing - reset form
      this.populateForm(this.currentList);
      this.saveError = null;
      this.saveSuccess = false;
    }
    this.isEditMode = !this.isEditMode;
  }

  addTag() {
    if (this.newTag.trim()) {
      this.tags.push(this.fb.control(this.newTag.trim(), Validators.required));
      this.newTag = '';
    }
  }

  removeTag(index: number) {
    this.tags.removeAt(index);
  }

  toggleSetting(settingName: string) {
    if (!this.isEditMode) return;

    const settingsGroup = this.editForm.get('settings') as FormGroup;
    const currentValue = settingsGroup.get(settingName)?.value;
    settingsGroup.patchValue({ [settingName]: !currentValue });
  }

  saveChanges() {
    if (this.editForm.invalid || !this.currentList) {
      this.markFormGroupTouched(this.editForm);
      return;
    }

    this.isSaving = true;
    this.saveError = null;
    this.saveSuccess = false;

    const formValue = this.editForm.value;
    const listData = {
      ...formValue,
      tags: formValue.tags.filter((tag: string) => tag.trim())
    };

    this.contactListService.updateList(this.currentList.id, listData).subscribe({
      next: (updatedList) => {
        this.isSaving = false;
        this.saveSuccess = true;
        this.currentList = updatedList;
        this.populateForm(updatedList);
        this.isEditMode = false;

        // Hide success message after 3 seconds
        setTimeout(() => {
          this.saveSuccess = false;
        }, 3000);
      },
      error: (err) => {
        this.isSaving = false;

        if (err.status === 403) {
          this.saveError = 'Access forbidden. You do not have permission to edit this list.';
        } else if (err.status === 401) {
          this.saveError = 'Your session has expired. Please log in again.';
        } else if (err.status === 400) {
          this.saveError = err.error?.message || 'Invalid data. Please check your input.';
        } else if (err.status === 0) {
          this.saveError = 'Unable to connect to the server. Please check your connection.';
        } else {
          this.saveError = err.message || err.error?.message || 'Failed to save changes. Please try again.';
        }

        console.error('Error saving list:', err);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  deleteList() {
    if (!this.currentList) return;

    if (confirm(`Are you sure you want to delete "${this.currentList.name}"? This action cannot be undone.`)) {
      this.contactListService.deleteList(this.currentList.id).subscribe({
        next: () => {
          this.router.navigate(['/contacts/lists']);
        },
        error: (err) => {
          this.saveError = 'Failed to delete list. Please try again.';
          console.error('Error deleting list:', err);
        }
      });
    }
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
    const field = this.editForm.get(fieldName);
    if (field?.invalid && field?.touched) {
      if (field.errors?.['required']) return `${fieldName} is required`;
      if (field.errors?.['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
    }
    return null;
  }
}
