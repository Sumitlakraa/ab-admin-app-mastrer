import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { BusRouteService } from 'src/app/services/bus-route/bus-route.service';
import { FileUploadService } from 'src/app/services/file-upload/file-upload.service';
import { NetworkUtil } from 'src/app/util/network-util';
import { ProgressDialogComponent } from '../progress-dialog/progress-dialog.component';


@Component({
  selector: 'app-upload-pricing-dialog',
  templateUrl: './upload-pricing-dialog.component.html',
  styleUrls: ['./upload-pricing-dialog.component.scss']
})
export class UploadPricingDialogComponent implements OnInit {

  formGrp!: FormGroup;

  selectedFile!: File|undefined;
  selectedFileName!: string|undefined;

  constructor(public dialogRef: MatDialogRef<UploadPricingDialogComponent>, private fileUploadService: FileUploadService, 
    private formBuilder: FormBuilder, private snackBar: MatSnackBar, public dialog: MatDialog, private router: Router) { 
  }

  ngOnInit(): void { 
    this.initFormGrp();
  }

  initFormGrp() {
    this.formGrp = this.formBuilder.group(
      {
        file : new FormControl(this.selectedFile, [Validators.required])
      }
    );
  }

  selectFiles(event: any): void {
    let selectedFilesFromEvent: File[] = event.target.files;

    if(selectedFilesFromEvent.length > 0) {
      this.selectedFile = selectedFilesFromEvent[0];
      this.selectedFileName = this.selectedFile.name;

      this.formGrp.controls['file'].setValue(this.selectedFileName);
    }
  }

  onSubmit() {
    if(this.formGrp.invalid || this.selectedFile === undefined) {
//      NetworkUtil.showSnackBar( this.snackBar, 'Please complete form');
      return;
    }

    this.uploadFile(this.selectedFile);
  }

  uploadFile(file: File) {
    if(file != null) {
      console.log('### upload next file ' + file.name);
      const dialogRef = this.dialog.open(ProgressDialogComponent);

      let data = JSON.parse(localStorage.getItem('token') || '{}');
      var token = data.token;

      this.fileUploadService.uploadConductorPricing(file, token)
      .pipe(
        finalize(() => dialogRef.close())
      )
      .subscribe(
        (event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
            console.log('Upload progress', Math.round(100 * event.loaded / event.total));
            // this.progressInfos[idx].value = Math.round(100 * event.loaded / event.total);
          } else if (event instanceof HttpResponse) {
            console.log('Uploaded the file successfully');
            // const msg = 'Uploaded the file successfully: ' + file.name;
            // this.message.push(msg);
            // this.imageInfos = this.uploadService.getFiles();

            if(data.body.ui_message != null){
              NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
            } else if(data.body.developer_message != null){
              NetworkUtil.showSnackBar(this.snackBar, data.body.developer_message);
            } else {
              NetworkUtil.showSnackBar(this.snackBar, 'Unable to update pricing, please try again');
            }


            this.uploadFilesSuccessfully();
          }
        },
        (err: any) => {
          console.log('Could not upload the file');
          // this.progressInfos[idx].value = 0;
          // const msg = 'Could not upload the file: ' + file.name;
          // this.message.push(msg);

          this.uploadFilesFailed();
        });
    }
  }

  uploadFilesSuccessfully() {
    NetworkUtil.showSnackBar(this.snackBar, 'Submitted successfully');
    this.dialogRef.close();
  }

  uploadFilesFailed() {
    this.selectedFile = undefined;
    this.selectedFileName = undefined;

    NetworkUtil.showSnackBar(this.snackBar, 'Data updated but not able to upload images, please try again');
  }

}
  
  
  