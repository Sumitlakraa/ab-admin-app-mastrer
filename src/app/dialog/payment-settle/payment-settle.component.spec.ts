import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentSettleComponent } from './payment-settle.component';

describe('PaymentSettleComponent', () => {
  let component: PaymentSettleComponent;
  let fixture: ComponentFixture<PaymentSettleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentSettleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentSettleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
