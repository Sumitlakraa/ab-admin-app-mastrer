import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadNotificationImageComponent } from './upload-notification-image.component';

describe('UploadNotificationImageComponent', () => {
  let component: UploadNotificationImageComponent;
  let fixture: ComponentFixture<UploadNotificationImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadNotificationImageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadNotificationImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
