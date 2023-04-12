import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, finalize, map, Observable, startWith } from 'rxjs';
import { Bus } from 'src/app/model/bus';
import { BusRouteService } from 'src/app/services/bus-route/bus-route.service';
import { CommonUtil } from 'src/app/util/common-util';
import { NetworkUtil } from 'src/app/util/network-util';
import { ProgressDialogComponent } from '../progress-dialog/progress-dialog.component';


@Component({
  selector: 'app-create-journey-dialog',
  templateUrl: './create-journey-dialog.component.html',
  styleUrls: ['./create-journey-dialog.component.scss']
})
export class CreateJourneyDialogComponent implements OnInit {

  formGrp!: FormGroup;

  constructor(public dialogRef: MatDialogRef<CreateJourneyDialogComponent>, private busRouteService: BusRouteService, 
    private formBuilder: FormBuilder, private snackBar: MatSnackBar, public dialog: MatDialog, private router: Router) { 

    }

  ngOnInit(): void {
    this.initFormGrp();
  }

  initFormGrp() {
    this.formGrp = this.formBuilder.group(
      {
        date : new FormControl('', [Validators.required])
      }
    );
  }
  
  onSubmit() {
    if(this.formGrp.invalid) {
      return;
    }
    this.dialogRef.close(this.formGrp.value.date);
  }

}
