import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteTownBoardingpointComponent } from './route-town-boardingpoint.component';

describe('RouteTownBoardingpointComponent', () => {
  let component: RouteTownBoardingpointComponent;
  let fixture: ComponentFixture<RouteTownBoardingpointComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RouteTownBoardingpointComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RouteTownBoardingpointComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
