import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResendCode } from './resend-code';

describe('ResendCode', () => {
  let component: ResendCode;
  let fixture: ComponentFixture<ResendCode>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResendCode]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResendCode);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
