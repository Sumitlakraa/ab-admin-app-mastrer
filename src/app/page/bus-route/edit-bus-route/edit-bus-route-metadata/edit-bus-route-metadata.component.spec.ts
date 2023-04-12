import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBusRouteMetadataComponent } from './edit-bus-route-metadata.component';

describe('EditBusRouteMetadataComponent', () => {
  let component: EditBusRouteMetadataComponent;
  let fixture: ComponentFixture<EditBusRouteMetadataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditBusRouteMetadataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditBusRouteMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
