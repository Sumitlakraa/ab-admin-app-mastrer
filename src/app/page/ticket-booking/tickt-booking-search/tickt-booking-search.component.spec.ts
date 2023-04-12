import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicktBookingSearchComponent } from './tickt-booking-search.component';

describe('TicktBookingSearchComponent', () => {
  let component: TicktBookingSearchComponent;
  let fixture: ComponentFixture<TicktBookingSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TicktBookingSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TicktBookingSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
