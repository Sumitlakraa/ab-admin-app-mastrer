import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchedBusesListComponent } from './searched-buses-list.component';

describe('SearchedBusesListComponent', () => {
  let component: SearchedBusesListComponent;
  let fixture: ComponentFixture<SearchedBusesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchedBusesListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchedBusesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
