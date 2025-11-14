import { Component, Input, forwardRef, ViewChild, ElementRef, signal, computed, HostListener } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgIcon } from "@ng-icons/core";
import { TranslatePipe } from '@ngx-translate/core';

export interface DropdownOption {
  value: any;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-custom-dropdown',
  imports: [CommonModule, NgIcon, TranslatePipe, FormsModule],
  templateUrl: './custom-dropdown.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomDropdown),
      multi: true
    }
  ],
  styles: ``
})
export class CustomDropdown implements ControlValueAccessor {
  @Input() options: DropdownOption[] = [];
  @Input() placeholder: string = 'Select an option';
  @Input() size: 'sm' | 'md' = 'md';
  @Input() searchable: boolean = false;
  @Input() disabled: boolean = false;
  @Input() allowClear: boolean = false;

  @ViewChild('dropdownElement', { static: false }) dropdownElement!: ElementRef;
  @ViewChild('searchInput', { static: false }) searchInput!: ElementRef;

  isOpen = signal(false);
  searchTerm = signal('');
  selectedValue = signal<any>(null);

  onChange: any = () => {};
  onTouched: any = () => {};

  filteredOptions = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.options;
    return this.options.filter(option =>
      option.label.toLowerCase().includes(term)
    );
  });

  selectedOption = computed(() => {
    return this.options.find(opt => opt.value === this.selectedValue());
  });

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.dropdownElement && !this.dropdownElement.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  // Keyboard navigation
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.isOpen()) return;

    if (event.key === 'Escape') {
      this.close();
      event.preventDefault();
    }
  }

  writeValue(value: any): void {
    this.selectedValue.set(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  toggle() {
    if (this.disabled) return;

    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    if (this.disabled) return;
    this.isOpen.set(true);
    this.searchTerm.set('');

    // Focus search input if searchable
    if (this.searchable) {
      setTimeout(() => {
        this.searchInput?.nativeElement?.focus();
      }, 0);
    }
  }

  close() {
    this.isOpen.set(false);
    this.searchTerm.set('');
    this.onTouched();
  }

  selectOption(option: DropdownOption) {
    if (option.disabled || this.disabled) return;

    this.selectedValue.set(option.value);
    this.onChange(option.value);
    this.close();
  }

  clear(event: Event) {
    event.stopPropagation();
    if (this.disabled) return;

    this.selectedValue.set(null);
    this.onChange(null);
    this.onTouched();
  }

  get buttonClasses(): string {
    const baseClasses = 'w-full flex items-center justify-between border rounded-md bg-card transition-colors';
    const sizeClasses = this.size === 'sm'
      ? 'px-3 py-1.5 text-sm'
      : 'px-4 py-2';
    const stateClasses = this.disabled
      ? 'bg-default-100 border-default-200 text-default-500 cursor-not-allowed'
      : 'border-default-200 text-default-700 hover:border-primary focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer';

    return `${baseClasses} ${sizeClasses} ${stateClasses}`;
  }

  get dropdownClasses(): string {
    const baseClasses = 'absolute z-50 w-full mt-1 bg-card border border-default-300/40 rounded-md shadow-lg max-h-60 overflow-auto transition-all';
    return baseClasses;
  }
}
