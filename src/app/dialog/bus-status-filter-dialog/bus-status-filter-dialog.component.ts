import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, finalize, map, Observable, startWith } from 'rxjs';

@Component({
  selector: 'app-bus-status-filter-dialog',
  templateUrl: './bus-status-filter-dialog.component.html',
  styleUrls: ['./bus-status-filter-dialog.component.scss']
})
export class BusStatusFilterDialogComponent implements OnInit {

  busStatus!: any;

  formGrp!: FormGroup;
  busStatusControl!: FormControl;

  allSearchedBusStatus: any[] = ["Active", "Onboarded", "Inactive"];
  filteredBusStatusOptions!: Observable<any[]>;

  constructor(public dialogRef: MatDialogRef<BusStatusFilterDialogComponent>, 
    private formBuilder: FormBuilder, private snackBar: MatSnackBar, public dialog: MatDialog, private router: Router) { 

    }

  ngOnInit(): void {
    this.initFormGrp();

    this.filteredBusStatusOptions = this.busStatusControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterBusStatus(value)),
    );
  }

  initFormGrp() {
    this.busStatusControl = new FormControl('', [Validators.required]);

    this.formGrp = this.formBuilder.group(
      {
        busStatus : this.busStatusControl
      }
    );
  }

  _filterBusStatus(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allSearchedBusStatus.filter(option => option.toLowerCase().includes(filterValue));
  }

  onBusStatusSelectionChanged(busStatus: any, event: any) {
    if(event.isUserInput) {
      this.busStatus = busStatus;
    }
  }
  
  onSubmit() {
    if(this.busStatus == null) {
      return;
    }
    this.dialogRef.close(this.busStatus);
  }

}
