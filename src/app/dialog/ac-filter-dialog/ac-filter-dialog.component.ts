import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, finalize, map, Observable, startWith } from 'rxjs';
import { Bus } from 'src/app/model/bus';
import { BusRouteService } from 'src/app/services/bus-route/bus-route.service';
import { LocationService } from 'src/app/services/location/location.service';
import { RouteService } from 'src/app/services/route/route.service';
import { CommonUtil } from 'src/app/util/common-util';
import { NetworkUtil } from 'src/app/util/network-util';
import { ProgressDialogComponent } from '../progress-dialog/progress-dialog.component';

@Component({
  selector: 'app-ac-filter-dialog',
  templateUrl: './ac-filter-dialog.component.html',
  styleUrls: ['./ac-filter-dialog.component.scss']
})
export class AcFilterDialogComponent implements OnInit {

  acState: boolean = false;

  constructor(public dialogRef: MatDialogRef<AcFilterDialogComponent>, private busRouteService: BusRouteService, 
    private formBuilder: FormBuilder, private snackBar: MatSnackBar, public dialog: MatDialog) { 
  }

  ngOnInit(): void {
  }

  onSubmit() {
    this.dialogRef.close(this.acState);
  }

}
