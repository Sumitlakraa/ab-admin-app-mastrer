import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViaRouteListComponent } from './via-route-list.component';

describe('ViaRouteListComponent', () => {
  let component: ViaRouteListComponent;
  let fixture: ComponentFixture<ViaRouteListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViaRouteListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViaRouteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
