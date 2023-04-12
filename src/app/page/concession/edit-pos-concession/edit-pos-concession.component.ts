import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, finalize, map, Observable, startWith, throwError } from 'rxjs';
import { ProgressDialogComponent } from 'src/app/dialog/progress-dialog/progress-dialog.component';
import { Bus } from 'src/app/model/bus';
import { Concession } from 'src/app/model/concession';
import { BusRouteMappingMetaData, Route, RouteMetaData } from 'src/app/model/route';
import { BusRouteService } from 'src/app/services/bus-route/bus-route.service';
import { ConcessionService } from 'src/app/services/concession/concession.service';
import { CommonUtil } from 'src/app/util/common-util';
import { NetworkUtil } from 'src/app/util/network-util';

@Component({
  selector: 'app-edit-pos-concession',
  templateUrl: './edit-pos-concession.component.html',
  styleUrls: ['./edit-pos-concession.component.scss']
})
export class EditPosConcessionComponent implements OnInit {

  concession!: Concession;

  formGrp!: FormGroup;
  busControl!: FormControl;

  allSearchedBuses: any[] = [];
  filteredBusesOptions!: Observable<any[]>;

  constructor(private router: Router, private formBuilder: FormBuilder, private snackBar: MatSnackBar, private location: Location,
    public dialog: MatDialog, private busRouteService: BusRouteService, private concessionService: ConcessionService) { 
      var navigation = this.router.getCurrentNavigation();
      if(navigation != null) {
        let concession = navigation.extras.state as Concession;
        this.concession = concession as Concession;
      }

      if(this.concession == null) {
        this.concession = {
          bus_number: '',
          bus_id: '',
          name: '',
          value: '',
          is_active:false,
        } as Concession;
      }

      this.initFormGrp();
      this.getBusList();
  }

  ngOnInit(): void {
    this.filteredBusesOptions = this.busControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterBus(value)),
    );
  }

  initFormGrp() {
    this.busControl = new FormControl({value : this.concession.bus_number, 
      disabled: false});

    this.formGrp = this.formBuilder.group(
      {
        bus : this.busControl,
        is_active : new FormControl( this.concession.is_active, [Validators.required]),
        name : new FormControl( this.concession.name, [Validators.required]),
        value : new FormControl( this.concession.value, [Validators.required, Validators.max(100), Validators.min(0)]),
      }
    );
  }

  _filterBus(value: string): Bus[] {
    const filterValue = value.toLowerCase();

    return this.allSearchedBuses.filter(option => option.number.toLowerCase().includes(filterValue));
  }

  onBusSelectionChanged(bus: any, event: any) {
    if(event.isUserInput) {
      this.concession.bus_number = bus.number;
      this.concession.bus_id = bus.id;
    }
  }

  getBusList() {
    if(this.allSearchedBuses.length == 0) {
      const dialogRef = this.dialog.open(ProgressDialogComponent);

      let data = JSON.parse(localStorage.getItem('token') || '{}');
      var token = data.token;

      this.busRouteService.searchBus(token, '')
      .pipe(
              catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
        finalize(() => dialogRef.close())
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
    if(this.formGrp.invalid ||  this.concession.bus_number === undefined) {
      NetworkUtil.showSnackBar(this.snackBar, 'Please complete form');
      return;
    }
    if(this.concession.concession_id == null) {
      this.createData();
    } else {
      this.updateData();
    }
  }

  createData() {
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    let jsonData = this.createJSONDataFromFormData(this.formGrp.value);

    this.concessionService.createTicketConcession(token, jsonData)
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        if(data.body.status == 200) {
          this.onSubmitDataSuccessful(data.body);
        } else {
          if(data.body.ui_message != null){
            NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
          } else if(data.body.developer_message != null){
            NetworkUtil.showSnackBar(this.snackBar, data.body.developer_message);
          } else {
            NetworkUtil.showSnackBar(this.snackBar, 'Unable to submit data, please try again');
          }
        }
      }
    );
  }

  updateData() {
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    let jsonData = this.createJSONDataFromFormData(this.formGrp.value);

    this.concessionService.updateTicketConcession(token, this.concession.concession_id as string, jsonData)
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        if(data.body.status == 200) {
          this.onSubmitDataSuccessful(data.body);
        } else {
          if(data.body.ui_message != null){
            NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
          } else if(data.body.developer_message != null) {
            NetworkUtil.showSnackBar(this.snackBar, data.body.developer_message);
          } else {
            NetworkUtil.showSnackBar(this.snackBar, 'Unable to update data, please try again');
          }
        }
      }
    );
  }

  onSubmitDataSuccessful(body: any) {
    if(this.concession.concession_id == null) {
      this.concession.concession_id = body.data.id;
    }
    this.location.back();
  }

  createJSONDataFromFormData(value: any) {
    console.log('createJSONDataFromFormData', value);

    var data = {
        'bus': this.concession.bus_id, 
        'name': value.name,
        'value': value.value,
        'is_active': value.is_active
      };

    return data;
  }

}
