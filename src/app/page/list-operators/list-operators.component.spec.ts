import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListOperatorsComponent } from './list-operators.component';

describe('ListOperatorsComponent', () => {
  let component: ListOperatorsComponent;
  let fixture: ComponentFixture<ListOperatorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListOperatorsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListOperatorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
