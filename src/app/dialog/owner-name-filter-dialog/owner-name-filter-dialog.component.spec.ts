import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerNameFilterDialogComponent } from './owner-name-filter-dialog.component';

describe('OwnerNameFilterDialogComponent', () => {
  let component: OwnerNameFilterDialogComponent;
  let fixture: ComponentFixture<OwnerNameFilterDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OwnerNameFilterDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OwnerNameFilterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
