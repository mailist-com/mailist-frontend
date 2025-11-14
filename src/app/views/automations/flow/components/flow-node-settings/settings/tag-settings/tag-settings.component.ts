import { Component, signal, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideInfo } from '@ng-icons/lucide';
import { CommonModule } from '@angular/common';
import { INodeSettings } from '../i-node-settings.interface';

@Component({
  selector: 'app-tag-settings',
  standalone: true,
  imports: [FormsModule, NgIcon, CommonModule],
  providers: [provideIcons({ lucideInfo })],
  template: `
    <div class="settings-section">
      <label class="settings-label">Tag</label>
      <input type="text" class="form-input form-input-sm"
             [ngModel]="tagName()"
             (ngModelChange)="tagName.set($event); triggerChange()"
             placeholder="Nazwa tagu..." />
    </div>

    <div class="settings-info">
      <ng-icon name="lucideInfo"></ng-icon>
      <span>{{ infoText() }}</span>
    </div>
  `,
  styles: []
})
export class TagSettingsComponent implements INodeSettings {
  public readonly infoText = input<string>('Tag zostanie dodany do subskrybenta.');

  private readonly _changeCounter = signal(0);
  public readonly dataChanged = this._changeCounter.asReadonly();

  protected tagName = signal('');

  loadData(data: Record<string, any>): void {
    this.tagName.set(data['tagName'] || '');
  }

  exportData(): Record<string, any> {
    const data: Record<string, any> = {};
    if (this.tagName()) {
      data['tagName'] = this.tagName();
    }
    return data;
  }

  isValid(): boolean {
    return !!this.tagName();
  }

  protected triggerChange(): void {
    this._changeCounter.set(this._changeCounter() + 1);
  }
}
