import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTownsComponent } from './list-towns.component';

describe('ListTownsComponent', () => {
  let component: ListTownsComponent;
  let fixture: ComponentFixture<ListTownsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListTownsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListTownsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
