import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, finalize, map, Observable, startWith } from 'rxjs';
import { BusRouteService } from 'src/app/services/bus-route/bus-route.service';

@Component({
  selector: 'app-booking-date-filter-dialog',
  templateUrl: './booking-date-filter-dialog.component.html',
  styleUrls: ['./booking-date-filter-dialog.component.scss']
})
export class BookingDateFilterDialogComponent implements OnInit {

  formGrp!: FormGroup;

  constructor(public dialogRef: MatDialogRef<BookingDateFilterDialogComponent>, private busRouteService: BusRouteService, 
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

