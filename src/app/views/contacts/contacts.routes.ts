import { Routes } from '@angular/router';

export const CONTACTS_ROUTES: Routes = [
  {
    path: 'contacts',
    children: [
      {
        path: '',
        loadComponent: () => import('./contact-list/contact-list').then(m => m.ContactListComponent),
        data: { title: 'Contact List' }
      },
      {
        path: 'create',
        loadComponent: () => import('./contact-form/contact-form').then(m => m.ContactForm),
        data: { title: 'Create Contact' }
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./contact-form/contact-form').then(m => m.ContactForm),
        data: { title: 'Edit Contact' }
      },
      {
        path: 'view/:id',
        loadComponent: () => import('./contact-detail/contact-detail').then(m => m.ContactDetail),
        data: { title: 'Contact Details' }
      },
      {
        path: 'lists',
        loadComponent: () => import('./lists/contact-lists').then(m => m.ContactListsComponent),
        data: { title: 'Contact Lists' }
      },
      {
        path: 'lists/create',
        loadComponent: () => import('./list-form/contact-list-form').then(m => m.ContactListFormComponent),
        data: { title: 'Create Contact List' }
      },
      {
        path: 'lists/edit/:id',
        loadComponent: () => import('./list-form/contact-list-form').then(m => m.ContactListFormComponent),
        data: { title: 'Edit Contact List' }
      },
      {
        path: 'import',
        loadComponent: () => import('./import/contact-import').then(m => m.ContactImport),
        data: { title: 'Import Contacts' }
      },
    ]
  }
];
