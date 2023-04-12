import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBusRouteComponent } from './edit-bus-route.component';

describe('EditBusRouteComponent', () => {
  let component: EditBusRouteComponent;
  let fixture: ComponentFixture<EditBusRouteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditBusRouteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditBusRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
