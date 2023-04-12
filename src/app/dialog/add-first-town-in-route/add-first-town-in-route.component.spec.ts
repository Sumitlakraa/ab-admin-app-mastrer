import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFirstTownInRouteComponent } from './add-first-town-in-route.component';

describe('AddFirstTownInRouteComponent', () => {
  let component: AddFirstTownInRouteComponent;
  let fixture: ComponentFixture<AddFirstTownInRouteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddFirstTownInRouteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFirstTownInRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
