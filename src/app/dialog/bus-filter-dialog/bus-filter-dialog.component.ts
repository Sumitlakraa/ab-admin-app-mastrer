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
  selector: 'app-bus-filter-dialog',
  templateUrl: './bus-filter-dialog.component.html',
  styleUrls: ['./bus-filter-dialog.component.scss']
})
export class BusFilterDialogComponent implements OnInit {

  bus!: any;

  formGrp!: FormGroup;
  busControl!: FormControl;

  serachValue!: any;
  serachValueLettersCount!: number;

  allSearchedBuses: any[] = [];
  filteredBusesOptions!: Observable<any[]>;

  constructor(public dialogRef: MatDialogRef<BusFilterDialogComponent>, private busRouteService: BusRouteService, 
    private formBuilder: FormBuilder, private snackBar: MatSnackBar, public dialog: MatDialog, private router: Router) { 
      
    }

  ngOnInit(): void {
    this.initFormGrp();

    this.filteredBusesOptions = this.busControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterBus(value)),
    );
  }

  initFormGrp() {
    this.busControl = new FormControl('', [Validators.required]);

    this.formGrp = this.formBuilder.group(
      {
        bus : this.busControl
      }
    );
  }

  _filterBus(value: string): Bus[] {
    const filterValue = value.toLowerCase();

    return this.allSearchedBuses.filter(option => option.number.toLowerCase().includes(filterValue));
  }

  onBusSelectionChanged(bus: any, event: any) {
    if(event.isUserInput) {
      this.bus = CommonUtil.deepCopy(bus);
    }
  }

  onKeyUpEvent(event: any) {
    this.serachValueLettersCount = event.target.value.length;
    this.serachValue = event.target.value;

    if(this.serachValueLettersCount != 0 && this.serachValueLettersCount != 1  ){
       this.getBusList();   
    }
  }

  getBusList() {
      // const dialogRef = this.dialog.open(ProgressDialogComponent);

      let data = JSON.parse(localStorage.getItem('token') || '{}');
      var token = data.token;

      this.busRouteService.searchBus(token, this.serachValue)
      .pipe(
              catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
        // finalize(() => dialogRef.close())
      ).subscribe(
        data => {
          if(data.body.status == 200) {
            this.onGettingBusListSuccessfully(data.body);
          } else {
            if(data.body.ui_message != null){
              NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
            } else if(data.body.developer_message != null){
              NetworkUtil.showSnackBar(this.snackBar, data.body.developer_message);
            } else {
              NetworkUtil.showSnackBar(this.snackBar, 'Unable to get buses data, please try again');
            }
          }
        }
      );
    
  }

  onGettingBusListSuccessfully(data: any) {
    this.allSearchedBuses = [];

    for(var item of data.data) {
      let bus = {
        id: item.id,
        number: item.number
      };

      this.allSearchedBuses.push(bus);
    }
  }
  
  onSubmit() {
    if(this.bus == null) {
      return;
    }
    this.dialogRef.close(this.bus);
  }

}
