import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PnrFilterDialogComponent } from './pnr-filter-dialog.component';

describe('PnrFilterDialogComponent', () => {
  let component: PnrFilterDialogComponent;
  let fixture: ComponentFixture<PnrFilterDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PnrFilterDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PnrFilterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
