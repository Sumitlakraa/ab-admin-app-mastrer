import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingDateFilterDialogComponent } from './booking-date-filter-dialog.component';

describe('BookingDateFilterDialogComponent', () => {
  let component: BookingDateFilterDialogComponent;
  let fixture: ComponentFixture<BookingDateFilterDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BookingDateFilterDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BookingDateFilterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
