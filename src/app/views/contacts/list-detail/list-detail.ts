import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { Observable, combineLatest, map, switchMap, BehaviorSubject } from 'rxjs';

import { PageTitle } from '../../../components/page-title/page-title';
import { ContactListService } from '../../../services/contact-list.service';
import { ContactService } from '../../../services/contact.service';
import { ContactList } from '../../../models/contact-list.model';
import { Contact, ContactFilter } from '../../../models/contact.model';

@Component({
  selector: 'app-list-detail',
  imports: [CommonModule, RouterLink, FormsModule, NgIcon, PageTitle],
  templateUrl: './list-detail.html'
})
export class ListDetailComponent implements OnInit {
  list$!: Observable<ContactList | undefined>;
  contacts$!: Observable<Contact[]>;

  private filterSubject = new BehaviorSubject<ContactFilter>({});

  searchTerm = '';
  selectedStatus = '';

  constructor(
    private route: ActivatedRoute,
    private contactListService: ContactListService,
    private contactService: ContactService
  ) {}

  ngOnInit() {
    const listId$ = this.route.params.pipe(
      map(params => params['id'])
    );

    this.list$ = listId$.pipe(
      switchMap(id => this.contactListService.getList(id))
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
}
