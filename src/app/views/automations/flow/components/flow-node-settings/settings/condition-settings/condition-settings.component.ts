import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideInfo } from '@ng-icons/lucide';
import { CommonModule } from '@angular/common';
import { INodeSettings } from '../i-node-settings.interface';

@Component({
  selector: 'app-condition-settings',
  standalone: true,
  imports: [FormsModule, NgIcon, CommonModule],
  providers: [provideIcons({ lucideInfo })],
  styleUrls: ['../../flow-node-settings.component.scss'],
  template: `
    <div class="settings-section">
      <label class="settings-label">Pole do sprawdzenia</label>
      <select class="form-input form-input-sm"
              [ngModel]="conditionField()"
              (ngModelChange)="conditionField.set($event); triggerChange()">
        <option value="">Wybierz pole...</option>
        <option value="email">Email</option>
        <option value="name">Imię</option>
        <option value="surname">Nazwisko</option>
        <option value="tags">Tagi</option>
        <option value="groups">Grupy</option>
        <option value="custom_field">Pole niestandardowe</option>
      </select>
    </div>

    <div class="settings-section">
      <label class="settings-label">Operator</label>
      <select class="form-input form-input-sm"
              [ngModel]="conditionOperator()"
              (ngModelChange)="conditionOperator.set($event); triggerChange()">
        <option value="equals">Jest równe</option>
        <option value="not_equals">Nie jest równe</option>
        <option value="contains">Zawiera</option>
        <option value="not_contains">Nie zawiera</option>
        <option value="greater">Większe niż</option>
        <option value="less">Mniejsze niż</option>
        <option value="exists">Istnieje</option>
        <option value="not_exists">Nie istnieje</option>
      </select>
    </div>

    @if (conditionOperator() !== 'exists' && conditionOperator() !== 'not_exists') {
      <div class="settings-section">
        <label class="settings-label">Wartość</label>
        <input type="text" class="form-input form-input-sm" placeholder="Wartość do porównania..."
               [ngModel]="conditionValue()"
               (ngModelChange)="conditionValue.set($event); triggerChange()" />
      </div>
    }

    <div class="settings-info">
      <ng-icon name="lucideInfo"></ng-icon>
      <span>Subskrybent przejdzie ścieżką "Tak" jeśli warunek zostanie spełniony, w przeciwnym razie "Nie".</span>
    </div>
  `,
  styles: []
})
export class ConditionSettingsComponent implements INodeSettings {
  private readonly _changeCounter = signal(0);

  public readonly dataChanged = this._changeCounter.asReadonly();

  protected conditionField = signal('');
  protected conditionOperator = signal<'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater' | 'less' | 'exists' | 'not_exists'>('equals');
  protected conditionValue = signal('');

  loadData(data: Record<string, any>): void {
    this.conditionField.set(data['conditionField'] || '');
    this.conditionOperator.set(data['conditionOperator'] || 'equals');
    this.conditionValue.set(data['conditionValue'] || '');
  }

  exportData(): Record<string, any> {
    const data: Record<string, any> = {
      conditionOperator: this.conditionOperator()
    };

    if (this.conditionField()) {
      data['conditionField'] = this.conditionField();
    }

    if (this.conditionValue() &&
        this.conditionOperator() !== 'exists' &&
        this.conditionOperator() !== 'not_exists') {
      data['conditionValue'] = this.conditionValue();
    }

    return data;
  }

  isValid(): boolean {
    if (!this.conditionField()) {
      return false;
    }

    if (this.conditionOperator() === 'exists' || this.conditionOperator() === 'not_exists') {
      return true;
    }

    return !!this.conditionValue();
  }

  protected triggerChange(): void {
    this._changeCounter.set(this._changeCounter() + 1);
  }
}
