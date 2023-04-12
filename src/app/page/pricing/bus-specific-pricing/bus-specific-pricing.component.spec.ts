import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusSpecificPricingComponent } from './bus-specific-pricing.component';

describe('BusSpecificPricingComponent', () => {
  let component: BusSpecificPricingComponent;
  let fixture: ComponentFixture<BusSpecificPricingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusSpecificPricingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusSpecificPricingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
