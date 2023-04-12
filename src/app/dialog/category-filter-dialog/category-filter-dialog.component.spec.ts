import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryFilterDialogComponent } from './category-filter-dialog.component';

describe('CategoryFilterDialogComponent', () => {
  let component: CategoryFilterDialogComponent;
  let fixture: ComponentFixture<CategoryFilterDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CategoryFilterDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryFilterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
