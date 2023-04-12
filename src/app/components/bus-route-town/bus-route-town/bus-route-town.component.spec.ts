import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusRouteTownComponent } from './bus-route-town.component';

describe('BusRouteTownComponent', () => {
  let component: BusRouteTownComponent;
  let fixture: ComponentFixture<BusRouteTownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusRouteTownComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusRouteTownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
