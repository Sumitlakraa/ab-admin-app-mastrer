import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TownFilterDialogComponent } from './town-filter-dialog.component';

describe('TownFilterDialogComponent', () => {
  let component: TownFilterDialogComponent;
  let fixture: ComponentFixture<TownFilterDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TownFilterDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TownFilterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
