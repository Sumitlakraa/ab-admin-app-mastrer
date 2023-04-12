import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListBusAddasComponent } from './list-bus-addas.component';

describe('ListBusAddasComponent', () => {
  let component: ListBusAddasComponent;
  let fixture: ComponentFixture<ListBusAddasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListBusAddasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListBusAddasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
