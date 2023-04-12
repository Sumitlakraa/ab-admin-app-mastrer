import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateJourneyDialogComponent } from './create-journey-dialog.component';

describe('CreateJourneyDialogComponent', () => {
  let component: CreateJourneyDialogComponent;
  let fixture: ComponentFixture<CreateJourneyDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateJourneyDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateJourneyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
