import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadPricingDialogComponent } from './upload-pricing-dialog.component';

describe('UploadPricingDialogComponent', () => {
  let component: UploadPricingDialogComponent;
  let fixture: ComponentFixture<UploadPricingDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadPricingDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadPricingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
