import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcFilterDialogComponent } from './ac-filter-dialog.component';

describe('AcFilterDialogComponent', () => {
  let component: AcFilterDialogComponent;
  let fixture: ComponentFixture<AcFilterDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AcFilterDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AcFilterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
