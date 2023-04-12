import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasePaymentComponent } from './base-payment.component';

describe('BasePaymentComponent', () => {
  let component: BasePaymentComponent;
  let fixture: ComponentFixture<BasePaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BasePaymentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BasePaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
