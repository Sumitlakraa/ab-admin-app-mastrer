import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketLedgerComponent } from './ticket-ledger.component';

describe('TicketLedgerComponent', () => {
  let component: TicketLedgerComponent;
  let fixture: ComponentFixture<TicketLedgerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TicketLedgerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketLedgerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
