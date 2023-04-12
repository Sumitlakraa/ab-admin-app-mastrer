import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusFilterDialogComponent } from './bus-filter-dialog.component';

describe('BusFilterDialogComponent', () => {
  let component: BusFilterDialogComponent;
  let fixture: ComponentFixture<BusFilterDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusFilterDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusFilterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
