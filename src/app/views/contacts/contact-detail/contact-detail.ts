import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { Observable } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';

import { PageTitle } from '../../../components/page-title/page-title';
import { ContactService } from '../../../services/contact.service';
import { ContactListService } from '../../../services/contact-list.service';
import { Contact } from '../../../models/contact.model';
import { ContactList } from '../../../models/contact-list.model';

@Component({
  selector: 'app-contact-detail',
  imports: [CommonModule, RouterLink, NgIcon, PageTitle, TranslatePipe],
  templateUrl: './contact-detail.html'
})
export class ContactDetail implements OnInit {
  contact$!: Observable<Contact | undefined>;
  lists$!: Observable<ContactList[]>;
  contactId!: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contactService: ContactService,
    private contactListService: ContactListService
  ) {}

  ngOnInit() {
    this.contactId = this.route.snapshot.paramMap.get('id')!;
    this.contact$ = this.contactService.getContact(this.contactId);
    this.lists$ = this.contactListService.getLists();
  }

  deleteContact(contact: Contact) {
    if (confirm(`Are you sure you want to delete ${contact.firstName} ${contact.lastName}?`)) {
      this.contactService.deleteContact(contact.id).subscribe(() => {
        this.router.navigate(['/contacts']);
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

  getListName(lists: ContactList[], listId: string): string {
    const list = lists.find(l => l.id === listId);
    return list ? list.name : `List ${listId.slice(-3)}`;
  }

  removeFromList(contact: Contact, listId: string) {
    this.contactService.removeFromList(contact.id, listId).subscribe(() => {
      this.contact$ = this.contactService.getContact(this.contactId);
    });
  }

  removeTag(contact: Contact, tag: string) {
    this.contactService.removeTagFromContact(contact.id, tag).subscribe(() => {
      this.contact$ = this.contactService.getContact(this.contactId);
    });
  }
}