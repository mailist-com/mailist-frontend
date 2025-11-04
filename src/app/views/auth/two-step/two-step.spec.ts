import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwoStep } from './two-step';

describe('TwoStep', () => {
  let component: TwoStep;
  let fixture: ComponentFixture<TwoStep>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TwoStep]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TwoStep);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
