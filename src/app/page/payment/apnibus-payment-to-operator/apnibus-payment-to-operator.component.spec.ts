import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApnibusPaymentToOperatorComponent } from './apnibus-payment-to-operator.component';

describe('ApnibusPaymentToOperatorComponent', () => {
  let component: ApnibusPaymentToOperatorComponent;
  let fixture: ComponentFixture<ApnibusPaymentToOperatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApnibusPaymentToOperatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApnibusPaymentToOperatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
