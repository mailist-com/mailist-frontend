import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
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
  showEditModal = false;

  // Filters
  searchTerm = '';
  selectedStatus: ApiKeyStatus | '' = '';

  // Create form
  newKeyName = '';
  newKeyDescription = '';
  newKeyPermissions: ApiKeyPermission[] = [];

  // Edit form
  editingKey: ApiKey | null = null;
  editKeyName = '';
  editKeyDescription = '';
  editKeyPermissions: ApiKeyPermission[] = [];
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

  constructor(
    private apiKeyService: ApiKeyService,
    private cdr: ChangeDetectorRef
  ) {}

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
        this.cdr.detectChanges();
      });
  }

  loadStatistics() {
    this.apiKeyService
      .getStatistics()
      .pipe(takeUntil(this.destroy$))
      .subscribe((stats) => {
        this.statistics = stats;
        this.cdr.detectChanges();
      });
  }

  private reinitializePreline() {
    if (typeof window !== 'undefined' && (window as any).HSStaticMethods) {
      (window as any).HSStaticMethods.autoInit();
    }
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
        .subscribe({
          next: (response: CreateApiKeyResponse) => {
            this.selectedKey = {
              ...response.apiKey,
              key: response.plainKey,
            };
            this.showKeyModal = true;
            this.loadApiKeys();
            this.loadStatistics();
          },
          error: (error) => {
            console.error('Error regenerating key:', error);
            alert('Wystąpił błąd podczas regeneracji klucza');
          }
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
        .subscribe({
          next: () => {
            this.loadApiKeys();
            this.loadStatistics();
          },
          error: (error) => {
            console.error('Error revoking key:', error);
            alert('Wystąpił błąd podczas odwoływania klucza');
          }
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
        .subscribe({
          next: () => {
            this.loadApiKeys();
            this.loadStatistics();
          },
          error: (error) => {
            console.error('Error deleting key:', error);
            alert('Wystąpił błąd podczas usuwania klucza');
          }
        });
    }
  }

  toggleKeyStatus(key: ApiKey) {
    this.apiKeyService
      .toggleApiKeyStatus(key.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadApiKeys();
          this.loadStatistics();
        },
        error: (error) => {
          console.error('Error toggling key status:', error);
          alert('Wystąpił błąd podczas zmiany statusu klucza');
        }
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
      .subscribe({
        next: (response: CreateApiKeyResponse) => {
          this.showCreateModal = false;
          this.selectedKey = {
            ...response.apiKey,
            key: response.plainKey,
          };
          this.showKeyModal = true;
          this.resetCreateForm();
          this.loadApiKeys();
          this.loadStatistics();
        },
        error: (error) => {
          console.error('Error creating key:', error);
          alert('Wystąpił błąd podczas tworzenia klucza API');
        }
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

  openEditModal(key: ApiKey) {
    this.editingKey = key;
    this.editKeyName = key.name;
    this.editKeyDescription = key.description || '';
    this.editKeyPermissions = [...key.permissions];
    this.showEditModal = true;
    this.reinitializePreline();
  }

  saveEditedKey() {
    if (!this.editingKey) return;

    if (!this.editKeyName.trim()) {
      alert('Proszę podać nazwę klucza API');
      return;
    }

    if (this.editKeyPermissions.length === 0) {
      alert('Proszę wybrać co najmniej jedno uprawnienie');
      return;
    }

    this.apiKeyService
      .updateApiKey(this.editingKey.id, {
        name: this.editKeyName.trim(),
        description: this.editKeyDescription.trim() || undefined,
        permissions: this.editKeyPermissions,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showEditModal = false;
          this.resetEditForm();
          this.loadApiKeys();
          this.loadStatistics();
        },
        error: (error) => {
          console.error('Error updating key:', error);
          alert('Wystąpił błąd podczas aktualizacji klucza');
        }
      });
  }

  resetEditForm() {
    this.editingKey = null;
    this.editKeyName = '';
    this.editKeyDescription = '';
    this.editKeyPermissions = [];
  }

  closeEditModal() {
    this.showEditModal = false;
    this.resetEditForm();
  }

  toggleEditPermission(permission: ApiKeyPermission) {
    const index = this.editKeyPermissions.indexOf(permission);
    if (index > -1) {
      this.editKeyPermissions.splice(index, 1);
    } else {
      this.editKeyPermissions.push(permission);
    }
  }

  isEditPermissionSelected(permission: ApiKeyPermission): boolean {
    return this.editKeyPermissions.includes(permission);
  }

  getTopEndpointsArray(): { path: string; count: number }[] {
    if (!this.statistics || !this.statistics.topEndpoints) {
      return [];
    }

    return Object.entries(this.statistics.topEndpoints)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Show top 10
  }
}
