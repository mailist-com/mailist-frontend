import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideInfo } from '@ng-icons/lucide';
import { CommonModule } from '@angular/common';
import { TemplateService } from '../../../../../../../services/template.service';
import { Template } from '../../../../../../../models/template.model';
import { INodeSettings } from '../i-node-settings.interface';

@Component({
  selector: 'app-send-email-settings',
  standalone: true,
  imports: [FormsModule, NgIcon, CommonModule],
  providers: [provideIcons({ lucideInfo })],
  template: `
    <div class="settings-section">
      <label class="settings-label">Typ wiadomości</label>
      <div class="toggle-group">
        <button type="button"
                class="toggle-btn"
                [class.active]="emailMode() === 'simple'"
                (click)="emailMode.set('simple'); triggerChange()">
          Prosty formularz
        </button>
        <button type="button"
                class="toggle-btn"
                [class.active]="emailMode() === 'template'"
                (click)="emailMode.set('template'); triggerChange()">
          Szablon
        </button>
      </div>
    </div>

    @if (emailMode() === 'simple') {
      <div class="settings-section">
        <label class="settings-label">Temat</label>
        <input type="text" class="form-input form-input-sm" placeholder="Temat emaila..."
               [ngModel]="emailSubject()" (ngModelChange)="emailSubject.set($event); triggerChange()" />
      </div>

      <div class="settings-section">
        <label class="settings-label">Treść</label>
        <textarea class="form-textarea form-input-sm" rows="6" placeholder="Treść wiadomości..."
                  [ngModel]="emailContent()" (ngModelChange)="emailContent.set($event); triggerChange()"></textarea>
      </div>
    }

    @if (emailMode() === 'template') {
      <div class="settings-section">
        <label class="settings-label">Wybierz szablon</label>
        <select class="form-input form-input-sm" [ngModel]="emailTemplateId()" (ngModelChange)="emailTemplateId.set($event); triggerChange()">
          <option value="">Wybierz szablon...</option>
          @for (template of availableTemplates(); track template.id) {
            <option [value]="template.id">{{ template.name }}</option>
          }
        </select>
      </div>

      @if (emailTemplateId()) {
        <div class="settings-info">
          <ng-icon name="lucideInfo"></ng-icon>
          <span>Wybrany szablon: {{ getTemplateName(emailTemplateId()) }}</span>
        </div>
      }
    }

    <div class="settings-info">
      <ng-icon name="lucideInfo"></ng-icon>
      <span>Email zostanie wysłany do subskrybenta w momencie osiągnięcia tego kroku.</span>
    </div>
  `,
  styles: []
})
export class SendEmailSettingsComponent implements INodeSettings {
  private readonly _templateService = inject(TemplateService);
  private readonly _changeCounter = signal(0);

  public readonly dataChanged = this._changeCounter.asReadonly();

  protected availableTemplates = signal<Template[]>([]);
  protected emailMode = signal<'simple' | 'template'>('simple');
  protected emailSubject = signal('');
  protected emailContent = signal('');
  protected emailTemplateId = signal('');

  constructor() {
    // Load templates from API
    this._templateService.getTemplates().subscribe(templates => {
      this.availableTemplates.set(templates.filter(t => t.status === 'active'));
    });
  }

  loadData(data: Record<string, any>): void {
    this.emailMode.set(data['emailMode'] || 'simple');
    this.emailSubject.set(data['emailSubject'] || '');
    this.emailContent.set(data['emailContent'] || '');
    this.emailTemplateId.set(data['emailTemplateId'] || '');
  }

  exportData(): Record<string, any> {
    const data: Record<string, any> = {
      emailMode: this.emailMode()
    };

    if (this.emailMode() === 'simple') {
      if (this.emailSubject()) data['emailSubject'] = this.emailSubject();
      if (this.emailContent()) data['emailContent'] = this.emailContent();
    } else {
      if (this.emailTemplateId()) data['emailTemplateId'] = this.emailTemplateId();
    }

    return data;
  }

  isValid(): boolean {
    if (this.emailMode() === 'simple') {
      return !!this.emailSubject() && !!this.emailContent();
    } else {
      return !!this.emailTemplateId();
    }
  }

  protected triggerChange(): void {
    this._changeCounter.set(this._changeCounter() + 1);
  }

  protected getTemplateName(templateId: string): string {
    const template = this.availableTemplates().find(t => t.id === templateId);
    return template?.name || 'Nieznany szablon';
  }
}
