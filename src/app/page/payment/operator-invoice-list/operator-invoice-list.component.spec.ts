import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatorInvoiceListComponent } from './operator-invoice-list.component';

describe('OperatorInvoiceListComponent', () => {
  let component: OperatorInvoiceListComponent;
  let fixture: ComponentFixture<OperatorInvoiceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OperatorInvoiceListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OperatorInvoiceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
