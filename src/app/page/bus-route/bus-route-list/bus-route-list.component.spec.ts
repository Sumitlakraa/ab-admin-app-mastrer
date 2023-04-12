import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusRouteListComponent } from './bus-route-list.component';

describe('BusRouteListComponent', () => {
  let component: BusRouteListComponent;
  let fixture: ComponentFixture<BusRouteListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusRouteListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusRouteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
