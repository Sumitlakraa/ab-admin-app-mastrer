import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyNameFilterDialogComponent } from './company-name-filter-dialog.component';

describe('CompanyNameFilterDialogComponent', () => {
  let component: CompanyNameFilterDialogComponent;
  let fixture: ComponentFixture<CompanyNameFilterDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompanyNameFilterDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyNameFilterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
