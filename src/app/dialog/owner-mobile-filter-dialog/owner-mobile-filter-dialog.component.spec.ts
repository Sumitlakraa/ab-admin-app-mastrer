import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerMobileFilterDialogComponent } from './owner-mobile-filter-dialog.component';

describe('OwnerMobileFilterDialogComponent', () => {
  let component: OwnerMobileFilterDialogComponent;
  let fixture: ComponentFixture<OwnerMobileFilterDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OwnerMobileFilterDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OwnerMobileFilterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
