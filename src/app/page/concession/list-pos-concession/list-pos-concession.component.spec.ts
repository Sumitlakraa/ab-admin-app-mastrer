import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPosConcessionComponent } from './list-pos-concession.component';

describe('ListPosConcessionComponent', () => {
  let component: ListPosConcessionComponent;
  let fixture: ComponentFixture<ListPosConcessionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListPosConcessionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListPosConcessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
