import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasePricingComponent } from './base-pricing.component';

describe('BasePricingComponent', () => {
  let component: BasePricingComponent;
  let fixture: ComponentFixture<BasePricingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BasePricingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BasePricingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
