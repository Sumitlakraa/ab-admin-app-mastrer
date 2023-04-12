import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatorLedgerComponent } from './operator-ledger.component';

describe('OperatorLedgerComponent', () => {
  let component: OperatorLedgerComponent;
  let fixture: ComponentFixture<OperatorLedgerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OperatorLedgerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OperatorLedgerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
