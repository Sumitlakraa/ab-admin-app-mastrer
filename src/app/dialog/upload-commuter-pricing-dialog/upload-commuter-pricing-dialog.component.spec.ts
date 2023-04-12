import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadCommuterPricingDialogComponent } from './upload-commuter-pricing-dialog.component';

describe('UploadCommuterPricingDialogComponent', () => {
  let component: UploadCommuterPricingDialogComponent;
  let fixture: ComponentFixture<UploadCommuterPricingDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadCommuterPricingDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadCommuterPricingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
