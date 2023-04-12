import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusRouteStoppageListComponent } from './bus-route-stoppage-list.component';

describe('BusRouteStoppageListComponent', () => {
  let component: BusRouteStoppageListComponent;
  let fixture: ComponentFixture<BusRouteStoppageListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusRouteStoppageListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusRouteStoppageListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
