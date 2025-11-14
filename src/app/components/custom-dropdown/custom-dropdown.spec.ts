import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomDropdown } from './custom-dropdown';
import { provideIcons } from '@ng-icons/core';
import { lucideChevronDown, lucideCheck, lucideX, lucideSearch } from '@ng-icons/lucide';
import { TranslateModule } from '@ngx-translate/core';

describe('CustomDropdown', () => {
  let component: CustomDropdown;
  let fixture: ComponentFixture<CustomDropdown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomDropdown, TranslateModule.forRoot()],
      providers: [
        provideIcons({ lucideChevronDown, lucideCheck, lucideX, lucideSearch })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomDropdown);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle dropdown', () => {
    expect(component.isOpen()).toBe(false);
    component.toggle();
    expect(component.isOpen()).toBe(true);
    component.toggle();
    expect(component.isOpen()).toBe(false);
  });

  it('should select option', () => {
    const options = [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' }
    ];
    component.options = options;
    component.selectOption(options[0]);
    expect(component.selectedValue()).toBe('1');
  });

  it('should filter options when searchable', () => {
    component.options = [
      { value: '1', label: 'Apple' },
      { value: '2', label: 'Banana' },
      { value: '3', label: 'Orange' }
    ];
    component.searchable = true;
    component.searchTerm.set('an');
    expect(component.filteredOptions().length).toBe(2);
  });
});
