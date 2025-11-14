import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideInfo } from '@ng-icons/lucide';
import { CommonModule } from '@angular/common';
import { INodeSettings } from '../i-node-settings.interface';

@Component({
  selector: 'app-wait-settings',
  standalone: true,
  imports: [FormsModule, NgIcon, CommonModule],
  providers: [provideIcons({ lucideInfo })],
  styleUrls: ['../../flow-node-settings.component.scss'],
  template: `
    <div class="settings-section">
      <label class="settings-label">Rodzaj oczekiwania</label>
      <div class="toggle-group">
        <button type="button"
                class="toggle-btn"
                [class.active]="waitMode() === 'duration'"
                (click)="waitMode.set('duration'); triggerChange()">
          Przez określony czas
        </button>
        <button type="button"
                class="toggle-btn"
                [class.active]="waitMode() === 'until'"
                (click)="waitMode.set('until'); triggerChange()">
          Do określonej daty
        </button>
      </div>
    </div>

    @if (waitMode() === 'duration') {
      <div class="settings-section">
        <label class="settings-label">Czas oczekiwania</label>
        <div class="flex gap-2">
          <input type="number" class="form-input form-input-sm flex-1"
                 [ngModel]="waitDuration()"
                 (ngModelChange)="waitDuration.set($event); triggerChange()"
                 min="1" />
          <select class="form-input form-input-sm"
                  [ngModel]="waitUnit()"
                  (ngModelChange)="waitUnit.set($event); triggerChange()">
            <option value="minutes">Minut</option>
            <option value="hours">Godzin</option>
            <option value="days">Dni</option>
            <option value="weeks">Tygodni</option>
          </select>
        </div>
      </div>

      <div class="settings-info">
        <ng-icon name="lucideInfo"></ng-icon>
        <span>Automatyzacja wstrzyma się na {{ waitDuration() }} {{ getWaitUnitLabel(waitUnit()) }} przed przejściem dalej.</span>
      </div>
    }

    @if (waitMode() === 'until') {
      <div class="settings-section">
        <label class="settings-label">Data</label>
        <input type="date" class="form-input form-input-sm"
               [ngModel]="waitUntilDate()"
               (ngModelChange)="waitUntilDate.set($event); triggerChange()" />
      </div>

      <div class="settings-section">
        <label class="settings-label">Godzina</label>
        <input type="time" class="form-input form-input-sm"
               [ngModel]="waitUntilTime()"
               (ngModelChange)="waitUntilTime.set($event); triggerChange()" />
      </div>

      <div class="settings-info">
        <ng-icon name="lucideInfo"></ng-icon>
        <span>Automatyzacja wstrzyma się do {{ waitUntilDate() }} o {{ waitUntilTime() }} przed przejściem dalej.</span>
      </div>
    }
  `,
  styles: []
})
export class WaitSettingsComponent implements INodeSettings {
  private readonly _changeCounter = signal(0);

  public readonly dataChanged = this._changeCounter.asReadonly();

  protected waitMode = signal<'duration' | 'until'>('duration');
  protected waitDuration = signal(1);
  protected waitUnit = signal<'minutes' | 'hours' | 'days' | 'weeks'>('days');
  protected waitUntilDate = signal('');
  protected waitUntilTime = signal('09:00');

  loadData(data: Record<string, any>): void {
    this.waitMode.set(data['waitMode'] || 'duration');
    this.waitDuration.set(data['waitDuration'] || 1);
    this.waitUnit.set(data['waitUnit'] || 'days');
    this.waitUntilDate.set(data['waitUntilDate'] || '');
    this.waitUntilTime.set(data['waitUntilTime'] || '09:00');
  }

  exportData(): Record<string, any> {
    const data: Record<string, any> = {
      waitMode: this.waitMode()
    };

    if (this.waitMode() === 'duration') {
      data['waitDuration'] = this.waitDuration();
      data['waitUnit'] = this.waitUnit();
    } else {
      data['waitUntilDate'] = this.waitUntilDate();
      data['waitUntilTime'] = this.waitUntilTime();
    }

    return data;
  }

  isValid(): boolean {
    if (this.waitMode() === 'duration') {
      return this.waitDuration() > 0;
    } else {
      return !!this.waitUntilDate() && !!this.waitUntilTime();
    }
  }

  protected triggerChange(): void {
    this._changeCounter.set(this._changeCounter() + 1);
  }

  protected getWaitUnitLabel(unit: string): string {
    const labels: Record<string, string> = {
      'minutes': 'minut',
      'hours': 'godzin',
      'days': 'dni',
      'weeks': 'tygodni'
    };
    return labels[unit] || unit;
  }
}
