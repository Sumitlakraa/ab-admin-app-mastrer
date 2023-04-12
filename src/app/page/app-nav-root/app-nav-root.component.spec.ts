import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppNavRootComponent } from './app-nav-root.component';

describe('AppNavRootComponent', () => {
  let component: AppNavRootComponent;
  let fixture: ComponentFixture<AppNavRootComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppNavRootComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppNavRootComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
