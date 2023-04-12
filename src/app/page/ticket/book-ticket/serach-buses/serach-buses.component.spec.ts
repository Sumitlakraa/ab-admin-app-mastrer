import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SerachBusesComponent } from './serach-buses.component';

describe('SerachBusesComponent', () => {
  let component: SerachBusesComponent;
  let fixture: ComponentFixture<SerachBusesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SerachBusesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SerachBusesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
