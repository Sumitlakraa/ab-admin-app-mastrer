import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditOperatorComponent } from './edit-operator.component';

describe('EditOperatorComponent', () => {
  let component: EditOperatorComponent;
  let fixture: ComponentFixture<EditOperatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditOperatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditOperatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
