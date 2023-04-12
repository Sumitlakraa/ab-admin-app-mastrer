import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditOperatorInvoiceComponent } from './edit-operator-invoice.component';

describe('EditOperatorInvoiceComponent', () => {
  let component: EditOperatorInvoiceComponent;
  let fixture: ComponentFixture<EditOperatorInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditOperatorInvoiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditOperatorInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
