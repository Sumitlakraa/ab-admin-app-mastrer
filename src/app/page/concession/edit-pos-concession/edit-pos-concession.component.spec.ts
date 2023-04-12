import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPosConcessionComponent } from './edit-pos-concession.component';

describe('EditPosConcessionComponent', () => {
  let component: EditPosConcessionComponent;
  let fixture: ComponentFixture<EditPosConcessionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditPosConcessionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPosConcessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
