import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistrictFilterDialogComponent } from './district-filter-dialog.component';

describe('DistrictFilterDialogComponent', () => {
  let component: DistrictFilterDialogComponent;
  let fixture: ComponentFixture<DistrictFilterDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DistrictFilterDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DistrictFilterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
