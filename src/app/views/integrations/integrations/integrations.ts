import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { PageTitle } from '../../../components/page-title/page-title';
import { ApiKeyService } from '../../../services/api-key.service';
import {
  ApiKey,
  ApiKeyStatistics,
  ApiKeyActivity,
  ApiKeyStatus,
  ApiKeyPermission,
  CreateApiKeyDTO,
  CreateApiKeyResponse,
  PermissionInfo,
} from '../../../models/api-key.model';

@Component({
  selector: 'app-integrations',
  imports: [CommonModule, FormsModule, NgIcon, PageTitle, TranslateModule],
  templateUrl: './integrations.html',
  styleUrl: './integrations.css',
})
export class Integrations implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();

  apiKeys: ApiKey[] = [];
  statistics: ApiKeyStatistics | null = null;
  selectedKey: ApiKey | null = null;
  showKeyModal = false;
  showCreateModal = false;

  // Filters
  searchTerm = '';
  selectedStatus: ApiKeyStatus | '' = '';

  // Create form
  newKeyName = '';
  newKeyDescription = '';
  newKeyPermissions: ApiKeyPermission[] = [];
  availablePermissions: { value: ApiKeyPermission; label: string }[] = [
    { value: 'contacts.read', label: 'INTEGRATIONS.PERMISSIONS.CONTACTS_READ' },
    { value: 'contacts.write', label: 'INTEGRATIONS.PERMISSIONS.CONTACTS_WRITE' },
    { value: 'contacts.delete', label: 'INTEGRATIONS.PERMISSIONS.CONTACTS_DELETE' },
    { value: 'lists.read', label: 'INTEGRATIONS.PERMISSIONS.LISTS_READ' },
    { value: 'lists.write', label: 'INTEGRATIONS.PERMISSIONS.LISTS_WRITE' },
    { value: 'campaigns.read', label: 'INTEGRATIONS.PERMISSIONS.CAMPAIGNS_READ' },
    { value: 'campaigns.write', label: 'INTEGRATIONS.PERMISSIONS.CAMPAIGNS_WRITE' },
    { value: 'campaigns.send', label: 'INTEGRATIONS.PERMISSIONS.CAMPAIGNS_SEND' },
    { value: 'automation.read', label: 'INTEGRATIONS.PERMISSIONS.AUTOMATION_READ' },
    { value: 'automation.write', label: 'INTEGRATIONS.PERMISSIONS.AUTOMATION_WRITE' },
    { value: '*', label: 'INTEGRATIONS.PERMISSIONS.FULL_ACCESS' },
  ];

  constructor(private apiKeyService: ApiKeyService) {}

  ngOnInit() {
    this.loadApiKeys();
    this.loadStatistics();
  }

  ngAfterViewInit() {
    // Reinitialize Preline dropdowns after view is loaded
    this.reinitializePreline();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadApiKeys() {
    this.apiKeyService
      .getApiKeys()
      .pipe(takeUntil(this.destroy$))
      .subscribe((keys) => {
        this.apiKeys = keys;
        this.reinitializePreline();
      });
  }

  loadStatistics() {
    this.apiKeyService
      .getStatistics()
      .pipe(takeUntil(this.destroy$))
      .subscribe((stats) => {
        this.statistics = stats;
        this.reinitializePreline();
      });
  }

  private reinitializePreline() {
    setTimeout(() => {
      if (typeof window !== 'undefined' && (window as any).HSStaticMethods) {
        (window as any).HSStaticMethods.autoInit();
      }
    }, 100);
  }

  getFilteredKeys(): ApiKey[] {
    return this.apiKeys.filter((key) => {
      const matchesSearch =
        !this.searchTerm ||
        key.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        key.key.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = !this.selectedStatus || key.status === this.selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedStatus = '';
  }

  regenerateKey(key: ApiKey) {
    if (
      confirm(
        `Czy na pewno chcesz wygenerować nowy klucz dla "${key.name}"? Stary klucz przestanie działać.`
      )
    ) {
      this.apiKeyService
        .regenerateApiKey(key.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe((updatedKey) => {
          this.selectedKey = updatedKey;
          this.showKeyModal = true;
          this.loadApiKeys();
        });
    }
  }

  revokeKey(key: ApiKey) {
    if (
      confirm(
        `Czy na pewno chcesz odwołać klucz "${key.name}"? Klucz zostanie dezaktywowany.`
      )
    ) {
      this.apiKeyService
        .revokeApiKey(key.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.loadApiKeys();
          this.loadStatistics();
        });
    }
  }

  deleteKey(key: ApiKey) {
    if (
      confirm(
        `Czy na pewno chcesz usunąć klucz "${key.name}"? Tej operacji nie można cofnąć.`
      )
    ) {
      this.apiKeyService
        .deleteApiKey(key.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.loadApiKeys();
          this.loadStatistics();
        });
    }
  }

  toggleKeyStatus(key: ApiKey) {
    const newStatus: ApiKeyStatus = key.status === 'ACTIVE' ? 'REVOKED' : 'ACTIVE';
    this.apiKeyService
      .updateApiKey(key.id, { status: newStatus })
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadApiKeys();
        this.loadStatistics();
      });
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
      console.log('Skopiowano do schowka');
    });
  }

  getStatusClass(status: ApiKeyStatus): string {
    const classes = {
      ACTIVE: 'bg-success/10 text-success',
      REVOKED: 'bg-warning/10 text-warning',
      EXPIRED: 'bg-danger/10 text-danger',
    };
    return classes[status] || 'bg-default-200 text-default-600';
  }

  getStatusIcon(status: ApiKeyStatus): string {
    const icons = {
      ACTIVE: 'lucideCircleCheck',
      REVOKED: 'lucideCirclePause',
      EXPIRED: 'lucideCircleX',
    };
    return icons[status] || 'lucideCircle';
  }

  getStatusLabel(status: ApiKeyStatus): string {
    const labels = {
      ACTIVE: 'Aktywny',
      REVOKED: 'Odwołany',
      EXPIRED: 'Wygasły',
    };
    return labels[status] || status;
  }

  getMethodClass(method: string): string {
    const classes = {
      GET: 'bg-info/10 text-info',
      POST: 'bg-success/10 text-success',
      PUT: 'bg-warning/10 text-warning',
      DELETE: 'bg-danger/10 text-danger',
    };
    return classes[method as keyof typeof classes] || 'bg-default-200 text-default-600';
  }

  getStatusCodeClass(statusCode: number): string {
    if (statusCode >= 200 && statusCode < 300) return 'text-success';
    if (statusCode >= 400 && statusCode < 500) return 'text-warning';
    if (statusCode >= 500) return 'text-danger';
    return 'text-default-600';
  }

  getMaskedKey(key: string): string {
    if (key.length <= 12) return key;
    const prefix = key.substring(0, 10);
    return `${prefix}${'*'.repeat(12)}`;
  }

  closeKeyModal() {
    this.showKeyModal = false;
    this.selectedKey = null;
  }

  trackByKeyId(index: number, key: ApiKey): string {
    return key.id;
  }

  trackByActivityId(index: number, activity: ApiKeyActivity): string {
    return activity.id;
  }

  togglePermission(permission: ApiKeyPermission) {
    const index = this.newKeyPermissions.indexOf(permission);
    if (index > -1) {
      this.newKeyPermissions.splice(index, 1);
    } else {
      this.newKeyPermissions.push(permission);
    }
  }

  isPermissionSelected(permission: ApiKeyPermission): boolean {
    return this.newKeyPermissions.includes(permission);
  }

  createNewKey() {
    if (!this.newKeyName.trim()) {
      alert('Proszę podać nazwę klucza API');
      return;
    }

    if (this.newKeyPermissions.length === 0) {
      alert('Proszę wybrać co najmniej jedno uprawnienie');
      return;
    }

    const createDto: CreateApiKeyDTO = {
      name: this.newKeyName.trim(),
      description: this.newKeyDescription.trim() || undefined,
      permissions: this.newKeyPermissions,
    };

    this.apiKeyService
      .createApiKey(createDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: CreateApiKeyResponse) => {
        this.showCreateModal = false;
        // Use the apiKey from response but with the plainKey for display
        this.selectedKey = {
          ...response.apiKey,
          key: response.plainKey, // Show the plainKey in modal
        };
        this.showKeyModal = true;
        this.resetCreateForm();
        this.loadApiKeys();
        this.loadStatistics();
      });
  }

  resetCreateForm() {
    this.newKeyName = '';
    this.newKeyDescription = '';
    this.newKeyPermissions = [];
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.resetCreateForm();
  }
}
