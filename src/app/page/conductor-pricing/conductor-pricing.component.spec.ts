import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConductorPricingComponent } from './conductor-pricing.component';

describe('ConductorPricingComponent', () => {
  let component: ConductorPricingComponent;
  let fixture: ComponentFixture<ConductorPricingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConductorPricingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConductorPricingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
