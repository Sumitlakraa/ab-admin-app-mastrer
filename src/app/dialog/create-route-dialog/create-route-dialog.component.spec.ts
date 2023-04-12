import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRouteDialogComponent } from './create-route-dialog.component';

describe('CreateRouteDialogComponent', () => {
  let component: CreateRouteDialogComponent;
  let fixture: ComponentFixture<CreateRouteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateRouteDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateRouteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
