import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { Observable, BehaviorSubject, combineLatest, map, switchMap } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';

import { PageTitle } from '../../../components/page-title/page-title';
import { CustomDropdown, DropdownOption } from '../../../components/custom-dropdown/custom-dropdown';
import { ContactService } from '../../../services/contact.service';
import { ContactListService } from '../../../services/contact-list.service';
import { ConfirmService } from '../../../services/confirm.service';
import { Contact, ContactFilter } from '../../../models/contact.model';
import { ContactList } from '../../../models/contact-list.model';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NgIcon, PageTitle, TranslatePipe, CustomDropdown],
  templateUrl: './contact-list.html'
})
export class ContactListComponent implements OnInit {
  contacts$!: Observable<Contact[]>;
  lists$!: Observable<ContactList[]>;
  statistics$!: Observable<any>;

  private filterSubject = new BehaviorSubject<ContactFilter>({});
  private pageSubject = new BehaviorSubject<{page: number, size: number}>({page: 0, size: 20});

  searchTerm = '';
  selectedStatus = '';
  selectedList = '';
  selectedTags: string[] = [];

  availableTags = ['premium', 'developer', 'designer', 'angular', 'asp.net', 'senior'];

  // Dropdown options
  statusOptions: DropdownOption[] = [
    { value: '', label: 'CONTACTS.ALL_STATUS' },
    { value: 'active', label: 'CONTACTS.STATUS.ACTIVE' },
    { value: 'unconfirmed', label: 'CONTACTS.STATUS.UNCONFIRMED' },
    { value: 'unsubscribed', label: 'CONTACTS.STATUS.UNSUBSCRIBED' },
    { value: 'bounced', label: 'CONTACTS.STATUS.BOUNCED' },
    { value: 'blocked', label: 'CONTACTS.STATUS.BLOCKED' }
  ];

  listOptions: DropdownOption[] = [];

  pageSizeOptions: DropdownOption[] = [
    { value: 10, label: 'COMMON.PER_PAGE_10' },
    { value: 20, label: 'COMMON.PER_PAGE_20' },
    { value: 50, label: 'COMMON.PER_PAGE_50' },
    { value: 100, label: 'COMMON.PER_PAGE_100' }
  ];

  // Pagination properties
  currentPage = 0;
  pageSize = 20;
  totalPages = 0;
  totalElements = 0;

  // Expose Math to template
  Math = Math;

  constructor(
    private contactService: ContactService,
    private contactListService: ContactListService,
    private confirmService: ConfirmService
  ) {}

  ngOnInit() {
    this.loadLists();
    this.loadStatistics();

    this.contacts$ = combineLatest([
      this.filterSubject.asObservable(),
      this.pageSubject.asObservable()
    ]).pipe(
      switchMap(([filter, page]) => this.contactService.getContacts(filter, page.page, page.size)),
      map(pagedData => {
        this.currentPage = pagedData.page.number;
        this.pageSize = pagedData.page.size;
        this.totalPages = pagedData.page.totalPages;
        this.totalElements = pagedData.page.totalElements;
        return pagedData.content;
      })
    );
  }

  private loadStatistics() {
    this.statistics$ = this.contactService.getContactStatistics();
  }

  private loadLists() {
    this.lists$ = this.contactListService.getLists();

    // Populate list options for dropdown
    this.lists$.subscribe(lists => {
      this.listOptions = [
        { value: '', label: 'CONTACTS.ALL_LISTS' },
        ...lists.map(list => ({ value: list.id, label: list.name }))
      ];
    });
  }

// Pagination methods
  onPageChange(page: number) {
    this.pageSubject.next({page, size: this.pageSize});
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.pageSubject.next({page: 0, size});
  }

  get pages(): number[] {
    return Array.from({length: this.totalPages}, (_, i) => i);
  }

  onSearch() {
    this.updateFilter();
  }

  onFilterChange() {
    this.updateFilter();
  }

  onTagToggle(tag: string) {
    if (this.selectedTags.includes(tag)) {
      this.selectedTags = this.selectedTags.filter(t => t !== tag);
    } else {
      this.selectedTags.push(tag);
    }
    this.updateFilter();
  }

  async deleteContact(contact: Contact) {
    const confirmed = await this.confirmService.confirmDanger(
      'Usuń kontakt',
      `Czy na pewno chcesz usunąć ${contact.firstName} ${contact.lastName}? Ta operacja jest nieodwracalna.`,
      'Usuń',
      'Anuluj'
    );

    if (confirmed) {
      this.contactService.deleteContact(contact.id).subscribe({
        next: () => {
          this.loadLists();
          this.loadStatistics();
        }
      });
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

  trackByContactId(index: number, contact: Contact): string {
    return contact.id;
  }

  private updateFilter() {
    const filter: ContactFilter = {
      search: this.searchTerm || undefined,
      status: this.selectedStatus ? [this.selectedStatus as any] : undefined,
      lists: this.selectedList ? [this.selectedList] : undefined,
      tags: this.selectedTags.length > 0 ? this.selectedTags : undefined
    };

    // Reset to first page when filter changes
    this.currentPage = 0;
    this.filterSubject.next(filter);
  }
}
