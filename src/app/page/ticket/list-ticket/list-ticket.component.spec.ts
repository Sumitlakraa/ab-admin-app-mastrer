import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleTicketComponent } from './list-ticket.component';

describe('MultipleTicketComponent', () => {
  let component: MultipleTicketComponent;
  let fixture: ComponentFixture<MultipleTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultipleTicketComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultipleTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
