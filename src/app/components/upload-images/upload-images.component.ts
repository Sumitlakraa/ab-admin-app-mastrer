import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { FileUploadService } from '../../services/file-upload/file-upload.service';

@Component({
  selector: 'app-upload-images',
  templateUrl: './upload-images.component.html',
  styleUrls: ['./upload-images.component.scss']
})
export class UploadImagesComponent implements OnInit {

  @Input() title: string = '';
  @Input() imagesOnServer: any[] = [];

  @Output() notify = new EventEmitter();
  @Output() notifyDeletionOfServerImages = new EventEmitter();

  selectedFiles: File[] = [];
  selectedFileNames: string[] = [];
  // progressInfos: any[] = [];
  // message: string[] = [];
  previews: string[] = [];
  // imageInfos?: Observable<any>;

  imagesToBeDeletedFromServer: any[] = [];

  constructor(private uploadService: FileUploadService) { }

  ngOnInit(): void {
    // this.imageInfos = this.uploadService.getFiles();
  }

  selectFiles(event: any): void {
    let selectedFilesFromEvent: File[] = event.target.files;

    // this.message = [];
    // this.progressInfos = [];
    // this.selectedFiles = [];
    
    const numberOfFiles = selectedFilesFromEvent.length;
    for (let i = 0; i < numberOfFiles; i++) {
      this.selectedFiles.push(selectedFilesFromEvent[i]);
    }

    this.notify.emit(this.selectedFiles);
    this.handleFileSelectionChanged(this.selectedFiles);
  }

  deleteSelection(index: any) {
    this.selectedFiles?.splice(index, 1);

    this.notify.emit(this.selectedFiles);
    this.handleFileSelectionChanged(this.selectedFiles as File[]);
  }

  handleFileSelectionChanged(selectedFiles: File[]) {
    this.selectedFileNames = [];
    this.previews = [];

    if (selectedFiles && selectedFiles[0]) {
      const numberOfFiles = selectedFiles.length;
      for (let i = 0; i < numberOfFiles; i++) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          console.log(e.target.result);
          this.previews.push(e.target.result);
        };
        reader.readAsDataURL(selectedFiles[i]);
        this.selectedFileNames.push(selectedFiles[i].name);
      }
    }
  }

  deleteServerImage(index: number) {
    let imageData = this.imagesOnServer[index];
    this.imagesToBeDeletedFromServer.push(imageData);
    this.notifyDeletionOfServerImages.emit(imageData);

    this.imagesOnServer?.splice(index, 1);
   }

  // uploadFiles(): void {
  //   this.message = [];
  //   if (this.selectedFiles) {
  //     for (let i = 0; i < this.selectedFiles.length; i++) {
  //       this.upload(i, this.selectedFiles[i]);
  //     }
  //   }
  // }

  // upload(idx: number, file: File): void {
  //   this.progressInfos[idx] = { value: 0, fileName: file.name };
  //   if (file) {
  //     this.uploadService.upload(file).subscribe(
  //       (event: any) => {
  //         if (event.type === HttpEventType.UploadProgress) {
  //           this.progressInfos[idx].value = Math.round(100 * event.loaded / event.total);
  //         } else if (event instanceof HttpResponse) {
  //           const msg = 'Uploaded the file successfully: ' + file.name;
  //           this.message.push(msg);
  //           // this.imageInfos = this.uploadService.getFiles();
  //         }
  //       },
  //       (err: any) => {
  //         this.progressInfos[idx].value = 0;
  //         const msg = 'Could not upload the file: ' + file.name;
  //         this.message.push(msg);
  //       });
  //   }
  // }

}
