import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusRouteJourneyListComponent } from './bus-route-journey-list.component';

describe('BusRouteJourneyListComponent', () => {
  let component: BusRouteJourneyListComponent;
  let fixture: ComponentFixture<BusRouteJourneyListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusRouteJourneyListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusRouteJourneyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
