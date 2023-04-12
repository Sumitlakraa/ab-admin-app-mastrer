import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBusAddasComponent } from './edit-bus-addas.component';

describe('EditBusAddasComponent', () => {
  let component: EditBusAddasComponent;
  let fixture: ComponentFixture<EditBusAddasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditBusAddasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditBusAddasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
