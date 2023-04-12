import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassengerMobileFilterDialogComponent } from './passenger-mobile-filter-dialog.component';

describe('PassengerMobileFilterDialogComponent', () => {
  let component: PassengerMobileFilterDialogComponent;
  let fixture: ComponentFixture<PassengerMobileFilterDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PassengerMobileFilterDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PassengerMobileFilterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
