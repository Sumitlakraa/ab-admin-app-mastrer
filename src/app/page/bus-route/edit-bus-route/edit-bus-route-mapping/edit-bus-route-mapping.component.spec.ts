import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBusRouteMappingComponent } from './edit-bus-route-mapping.component';

describe('EditBusRouteMappingComponent', () => {
  let component: EditBusRouteMappingComponent;
  let fixture: ComponentFixture<EditBusRouteMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditBusRouteMappingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditBusRouteMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
