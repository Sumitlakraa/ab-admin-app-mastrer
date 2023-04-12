import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusStatusFilterDialogComponent } from './bus-status-filter-dialog.component';

describe('BusStatusFilterDialogComponent', () => {
  let component: BusStatusFilterDialogComponent;
  let fixture: ComponentFixture<BusStatusFilterDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusStatusFilterDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusStatusFilterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
