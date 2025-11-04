import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { Observable } from 'rxjs';

import { PageTitle } from '../../../components/page-title/page-title';
import { ContactListService } from '../../../services/contact-list.service';
import { ContactList } from '../../../models/contact-list.model';

@Component({
  selector: 'app-contact-lists',
  imports: [CommonModule, FormsModule, RouterLink, NgIcon, PageTitle],
  templateUrl: './contact-lists.html'
})
export class ContactListsComponent implements OnInit {
  lists$!: Observable<ContactList[]>;
  statistics$!: Observable<any>;
  
  searchTerm = '';
  selectedType = '';
  selectedStatus = '';
  
  constructor(private contactListService: ContactListService) {}

  ngOnInit() {
    this.lists$ = this.contactListService.getLists();
    this.statistics$ = this.contactListService.getListStatistics();
  }

  onSearch() {
    // Implement search filtering
  }

  onFilterChange() {
    // Implement filter logic
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedType = '';
    this.selectedStatus = '';
    this.onFilterChange();
  }

  deleteList(list: ContactList) {
    if (confirm(`Are you sure you want to delete "${list.name}"? This action cannot be undone.`)) {
      this.contactListService.deleteList(list.id).subscribe();
    }
  }

  duplicateList(list: ContactList) {
    const duplicatedList = {
      ...list,
      name: `${list.name} (Copy)`,
      subscriberCount: 0,
      unsubscribedCount: 0,
      cleanedCount: 0,
      bouncedCount: 0
    };
    delete (duplicatedList as any).id;
    delete (duplicatedList as any).createdAt;
    delete (duplicatedList as any).updatedAt;
    
    this.contactListService.createList(duplicatedList).subscribe();
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
      'regular': 'badge-primary',
      'smart': 'badge-success',
      'static': 'badge-info'
    };
    return typeClasses[type as keyof typeof typeClasses] || 'badge-default';
  }

  getStatusClass(status: string): string {
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

  getEngagementClass(rate: number): string {
    if (rate >= 80) return 'text-success';
    if (rate >= 60) return 'text-warning';
    return 'text-danger';
  }

  trackByListId(index: number, list: ContactList): string {
    return list.id;
  }

  exportList(list: ContactList, format: 'csv' | 'xlsx' = 'csv') {
    this.contactListService.exportList(list.id, format).subscribe({
      next: (data) => {
        this.downloadFile(data, `${list.name}-export.${format}`, format);
      },
      error: (error) => {
        console.error('Export failed:', error);
      }
    });
  }

  exportAllLists(format: 'csv' | 'xlsx' = 'csv') {
    this.contactListService.exportAllLists(format).subscribe({
      next: (data) => {
        this.downloadFile(data, `all-lists-export.${format}`, format);
      },
      error: (error) => {
        console.error('Export failed:', error);
      }
    });
  }

  private downloadFile(data: Blob, filename: string, format: string) {
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}