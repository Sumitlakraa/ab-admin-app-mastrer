import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, finalize, map, Observable, startWith } from 'rxjs';
import { Bus } from 'src/app/model/bus';
import { OperatorService } from 'src/app/services/operator/operator.service';
import { TicketService } from 'src/app/services/ticket/ticket.service';
import { LocationService } from 'src/app/services/location/location.service';
import { RouteService } from 'src/app/services/route/route.service';
import { CommonUtil } from 'src/app/util/common-util';
import { NetworkUtil } from 'src/app/util/network-util';
import { ProgressDialogComponent } from '../progress-dialog/progress-dialog.component';

@Component({
  selector: 'app-passenger-mobile-filter-dialog',
  templateUrl: './passenger-mobile-filter-dialog.component.html',
  styleUrls: ['./passenger-mobile-filter-dialog.component.scss']
})
export class PassengerMobileFilterDialogComponent implements OnInit {

  passengerMobile!: any;

  formGrp!: FormGroup;
  passengerMobileControl!: FormControl;

  allSearchedPassengerMobile: any[] = [];
  filteredPassengerMobileOptions!: Observable<any[]>;

  serachValue!: any;
  serachValueLettersCount!: number;

  constructor(public dialogRef: MatDialogRef<PassengerMobileFilterDialogComponent>, private ticketService: TicketService, 
    private formBuilder: FormBuilder, private snackBar: MatSnackBar, public dialog: MatDialog, private router: Router) { 
    }

  ngOnInit(): void {
    this.initFormGrp();

    this.filteredPassengerMobileOptions = this.passengerMobileControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterPassengerMobile(value)),
    );
  }

  initFormGrp() {
    this.passengerMobileControl = new FormControl('', [Validators.required]);

    this.formGrp = this.formBuilder.group(
      {
        mobile : this.passengerMobileControl
      }
    );
  }

  _filterPassengerMobile(value: number): Bus[] {
    const filterValue = value;

    return this.allSearchedPassengerMobile.filter(option => option.number.includes(filterValue));
  }

  onMobileSelectionChanged(mobile: any, event: any) {
    if(event.isUserInput) {
      this.passengerMobile = CommonUtil.deepCopy(mobile);
    }
  }

  onKeyUpEvent(event: any){

    this.serachValueLettersCount = event.target.value.length;
    this.serachValue = event.target.value;

    if(this.serachValueLettersCount != 0 && this.serachValueLettersCount != 1 ){
        this.getPassengerMobileList();     
    }
  }

  getPassengerMobileList() {
    // if(this.allSearchedPassengerMobile.length == 0) {
      // const dialogRef = this.dialog.open(ProgressDialogComponent);

      let data = JSON.parse(localStorage.getItem('token') || '{}');
      var token = data.token;

      this.ticketService.passengerMobileSearch(token, 'passenger_mobile=', this.serachValue )
      .pipe(
              catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
        // finalize(() => dialogRef.close())
      ).subscribe(
        data => {
          if(data.body.status == 200) {
            this.onGettingPassengerMobileListSuccessfully(data.body);
          } else {
            if(data.body.ui_message != null){
              NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
            } else if(data.body.developer_message != null){
              NetworkUtil.showSnackBar(this.snackBar, data.body.developer_message);
            } else {
              NetworkUtil.showSnackBar(this.snackBar, 'Unable to get Mobile data, please try again');
            }
          }
        }
      );
    
  }

  onGettingPassengerMobileListSuccessfully(data: any) {
    this.allSearchedPassengerMobile = [];

    for(var item of data.data) {
      let passengerMobile = {
        id: item.id,
        number: item.passenger_mobile
      };

      this.allSearchedPassengerMobile.push(passengerMobile);
    }
  }
  
  onSubmit() {
    if(this.passengerMobile == null) {
      return;
    }
    this.dialogRef.close(this.passengerMobile);
  }

}
