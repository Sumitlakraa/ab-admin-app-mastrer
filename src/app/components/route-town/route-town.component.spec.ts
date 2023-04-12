import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteTownComponent } from './route-town.component';

describe('RouteTownComponent', () => {
  let component: RouteTownComponent;
  let fixture: ComponentFixture<RouteTownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RouteTownComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RouteTownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
