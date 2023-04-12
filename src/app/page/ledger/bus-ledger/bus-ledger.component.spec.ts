import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusLedgerComponent } from './bus-ledger.component';

describe('BusLedgerComponent', () => {
  let component: BusLedgerComponent;
  let fixture: ComponentFixture<BusLedgerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusLedgerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusLedgerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
