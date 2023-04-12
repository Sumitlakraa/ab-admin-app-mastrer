import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiplePricingComponent } from './multiple-pricing.component';

describe('MultiplePricingComponent', () => {
  let component: MultiplePricingComponent;
  let fixture: ComponentFixture<MultiplePricingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultiplePricingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiplePricingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
