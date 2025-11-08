import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { Observable, BehaviorSubject, combineLatest, map, switchMap } from 'rxjs';

import { PageTitle } from '../../../components/page-title/page-title';
import { ContactService } from '../../../services/contact.service';
import { ContactListService } from '../../../services/contact-list.service';
import { Contact, ContactFilter } from '../../../models/contact.model';
import { ContactList } from '../../../models/contact-list.model';
import { PagedData } from '../../../core/api/api.service';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NgIcon, PageTitle],
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

  // Pagination properties
  currentPage = 0;
  pageSize = 20;
  totalPages = 0;
  totalElements = 0;

  // Expose Math to template
  Math = Math;

  constructor(
    private contactService: ContactService,
    private contactListService: ContactListService
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

  clearFilters() {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedList = '';
    this.selectedTags = [];
    this.updateFilter();
  }

  deleteContact(contact: Contact) {
    if (confirm(`Are you sure you want to delete ${contact.firstName} ${contact.lastName}?`)) {
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
