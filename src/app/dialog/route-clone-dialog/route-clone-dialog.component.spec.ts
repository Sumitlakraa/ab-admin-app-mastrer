import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteCloneDialogComponent } from './route-clone-dialog.component';

describe('RouteCloneDialogComponent', () => {
  let component: RouteCloneDialogComponent;
  let fixture: ComponentFixture<RouteCloneDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RouteCloneDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RouteCloneDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
