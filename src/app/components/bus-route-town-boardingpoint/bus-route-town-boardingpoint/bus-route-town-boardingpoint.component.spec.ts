import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusRouteTownBoardingpointComponent } from './bus-route-town-boardingpoint.component';

describe('BusRouteTownBoardingpointComponent', () => {
  let component: BusRouteTownBoardingpointComponent;
  let fixture: ComponentFixture<BusRouteTownBoardingpointComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusRouteTownBoardingpointComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusRouteTownBoardingpointComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
