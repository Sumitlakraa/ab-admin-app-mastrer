import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteFilterDialogComponent } from './route-filter-dialog.component';

describe('RouteFilterDialogComponent', () => {
  let component: RouteFilterDialogComponent;
  let fixture: ComponentFixture<RouteFilterDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RouteFilterDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RouteFilterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
