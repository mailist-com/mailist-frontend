import { Component, signal, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideInfo } from '@ng-icons/lucide';
import { CommonModule } from '@angular/common';
import { INodeSettings } from '../i-node-settings.interface';

@Component({
  selector: 'app-group-settings',
  standalone: true,
  imports: [FormsModule, NgIcon, CommonModule],
  providers: [provideIcons({ lucideInfo })],
  styleUrls: ['../../flow-node-settings.component.scss'],
  template: `
    <div class="settings-section">
      <label class="settings-label">Grupa</label>
      <select class="form-input form-input-sm"
              [ngModel]="groupName()"
              (ngModelChange)="groupName.set($event); triggerChange()">
        <option value="">Wybierz grupę...</option>
        <option value="newsletter">Newsletter</option>
        <option value="customers">Klienci</option>
        <option value="leads">Leady</option>
      </select>
    </div>

    <div class="settings-info">
      <ng-icon name="lucideInfo"></ng-icon>
      <span>{{ infoText() }}</span>
    </div>
  `,
  styles: []
})
export class GroupSettingsComponent implements INodeSettings {
  public readonly infoText = input<string>('Subskrybent zostanie dodany do wybranej grupy.');

  private readonly _changeCounter = signal(0);
  public readonly dataChanged = this._changeCounter.asReadonly();

  protected groupName = signal('');

  loadData(data: Record<string, any>): void {
    this.groupName.set(data['groupName'] || '');
  }

  exportData(): Record<string, any> {
    const data: Record<string, any> = {};
    if (this.groupName()) {
      data['groupName'] = this.groupName();
    }
    return data;
  }

  isValid(): boolean {
    return !!this.groupName();
  }

  protected triggerChange(): void {
    this._changeCounter.set(this._changeCounter() + 1);
  }
}
