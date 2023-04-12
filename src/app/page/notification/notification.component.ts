import { Component, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { UploadNotificationImageComponent } from 'src/app/dialog/upload-notification-image/upload-notification-image.component';

import { UploadPricingDialogComponent } from 'src/app/dialog/upload-pricing-dialog/upload-pricing-dialog.component';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {

  constructor(public dialog: MatDialog) {  }

  ngOnInit(): void {
  }

  onUploadNotificationImageClick(value:any) {
    let button: MatButton = value;
    console.log(button._elementRef.nativeElement.getBoundingClientRect());

    let dialogPositionTop: string = button._elementRef.nativeElement.getBoundingClientRect().top 
          + button._elementRef.nativeElement.getBoundingClientRect().height + 5 + 'px';
    let dialogPositionLeft: string = button._elementRef.nativeElement.getBoundingClientRect().left + 'px';

    const dialogRef = this.dialog.open(UploadNotificationImageComponent, {
      position: { top: dialogPositionTop, left: dialogPositionLeft}
    })
  }

}
