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
import { BusRouteMappingMetaData, Route, RouteMetaData } from 'src/app/model/route';
import { BusRouteService } from 'src/app/services/bus-route/bus-route.service';
import { CommonUtil } from 'src/app/util/common-util';
import { NetworkUtil } from 'src/app/util/network-util';
import { RemarksData } from 'src/app/model/remarks';
import { DatePipe } from '@angular/common';



@Component({
  selector: 'app-edit-bus-route-metadata',
  templateUrl: './edit-bus-route-metadata.component.html',
  styleUrls: ['./edit-bus-route-metadata.component.scss']
})
export class EditBusRouteMetadataComponent implements OnInit {

  @Input() busRouteMappingMetaData!: BusRouteMappingMetaData;
  @Output() notify = new EventEmitter();

  formGrp!: FormGroup;
  busControl!: FormControl;
  routeControl!: FormControl;

  serachValue!: any;
  serachValueLettersCount!: number;

  remarks: RemarksData[] = [];

  allSearchedBuses: any[] = [];
  filteredBusesOptions!: Observable<any[]>;

  allSearchedRoutes: any[] = [];
  filteredRoutesOptions!: Observable<any[]>;

  constructor(private datePipe: DatePipe,private router: Router, private formBuilder: FormBuilder, private snackBar: MatSnackBar, private location: Location,
    public dialog: MatDialog, private busRouteService: BusRouteService) { 

      // this.getRouteList();
    }

  ngOnInit(): void {
    this.initFormGrp();

    this.filteredBusesOptions = this.busControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterBus(value)),
    );

    this.filteredRoutesOptions = this.routeControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterRoute(value)),
    );

    if(this.busRouteMappingMetaData.id != null) {
      this.getRemarksFromServer();
    }
  }

  initFormGrp() {
    this.busControl = new FormControl({value : this.busRouteMappingMetaData.bus.number, 
      disabled: this.busRouteMappingMetaData.bus.id === undefined ? false : true});
    this.routeControl = new FormControl({value : this.busRouteMappingMetaData.routeMetaData.name, 
      disabled: this.busRouteMappingMetaData.routeMetaData.route_id === undefined ? false : true});

    this.formGrp = this.formBuilder.group(
      {
        bus : this.busControl,
        route : this.routeControl,
        bus_route_name : new FormControl( this.busRouteMappingMetaData.name),
        start_time : new FormControl( this.busRouteMappingMetaData.startTime, [Validators.required]),
        interval : new FormControl( this.busRouteMappingMetaData.interval, [Validators.required]),
        remark : new FormControl(),
      }
    );
  }

  _filterBus(value: string): Bus[] {
    const filterValue = value.toLowerCase();

    return this.allSearchedBuses.filter(option => option.number.toLowerCase().includes(filterValue));
  }

  _filterRoute(value: string): RouteMetaData[] {
    const filterValue = value.toLowerCase();

    return this.allSearchedRoutes.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  onBusSelectionChanged(bus: any, event: any) {
    if(event.isUserInput) {
      this.busRouteMappingMetaData.bus = CommonUtil.deepCopy(bus);
    }
  }

  onKeyUpEvent(event: any) {
    this.serachValueLettersCount = event.target.value.length;
    this.serachValue = event.target.value;

    if(this.serachValueLettersCount != 0 && this.serachValueLettersCount != 1 && this.serachValueLettersCount != 2&& this.serachValueLettersCount != 3 ){
        this.getRouteList();   
    }
  }

  onKeyUpEventForBus(event: any) {
    this.serachValueLettersCount = event.target.value.length;
    this.serachValue = event.target.value;

    if(this.serachValueLettersCount != 0 && this.serachValueLettersCount != 1 && this.serachValueLettersCount != 2&& this.serachValueLettersCount != 3 ){
        this.getBusList();
    }
  }



  onRouteSelectionChanged(routeMetaData: any, event: any) {
    if(event.isUserInput) {
      this.busRouteMappingMetaData.routeMetaData = CommonUtil.deepCopy(routeMetaData);
    }
  }

  getBusList() {
    // if(this.allSearchedBuses.length == 0) {
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

  getRouteList() {
    // if(this.allSearchedRoutes.length == 0) {
      // const dialogRef = this.dialog.open(ProgressDialogComponent);

      let data = JSON.parse(localStorage.getItem('token') || '{}');
      var token = data.token;

      this.busRouteService.searchRoute(token, this.serachValue)
      .pipe(
              catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
        // finalize(() => dialogRef.close())
      ).subscribe(
        data => {
          if(data.body.status == 200) {
            this.onGettingRouteListSuccessfully(data.body);
          } else {
            if(data.body.ui_message != null){
              NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
            } else if(data.body.developer_message != null){
              NetworkUtil.showSnackBar(this.snackBar, data.body.developer_message);
            } else {
              NetworkUtil.showSnackBar(this.snackBar, 'Unable to get operators data, please try again');
            }
          }
        }
      );
    
  }

  onGettingRouteListSuccessfully(data: any) {
    this.allSearchedRoutes = [];

    for(var item of data.data) {
      let route = {
        route_id: item.id,
        name: item.name
      };

      this.allSearchedRoutes.push(route);
    }

    console.log(this.allSearchedRoutes);
  }

  onSubmit() {
    if(this.formGrp.invalid || this.busRouteMappingMetaData.routeMetaData.route_id === undefined 
      || this.busRouteMappingMetaData.bus.id === undefined) {
        NetworkUtil.showSnackBar(this.snackBar, 'Please complete form');
      return;
    }

    if(this.busRouteMappingMetaData.id == null) {
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

    this.busRouteService.createBusRoute(token, jsonData)
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

    this.busRouteService.updateBusRoute(token, this.busRouteMappingMetaData.id as string, jsonData)
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
            NetworkUtil.showSnackBar(this.snackBar, 'Unable to submit data, please try again');
          }
        }
      }
    );
  }

  onSubmitDataSuccessful(body: any) {
    if(this.busRouteMappingMetaData.id == null) {
      this.busRouteMappingMetaData.id = body.data.id;
      this.notify.emit(this.busRouteMappingMetaData);
    }
  }

  createJSONDataFromFormData(value: any) {
    console.log('createJSONDataFromFormData', value);

    var data = {
        'bus_id': this.busRouteMappingMetaData.bus.id, 
        'route_id': this.busRouteMappingMetaData.routeMetaData.route_id,
        'start_time': value.start_time,
        'interval': value.interval,
        'name':value.bus_route_name,
        'remarks':value.remark
      };

    return data;
  }


  getRemarksFromServer() {
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    let jsonData = {"bus_id": this.busRouteMappingMetaData.bus.id}

    this.busRouteService.updateBusRoute(token, this.busRouteMappingMetaData.id as string, jsonData)
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        if(data.body.status == 200) {
          this.onRemarksDatagettingSuccessful(data.body);
        } else {
          if(data.body.ui_message != null){
            NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
          } else if(data.body.developer_message != null) {
            NetworkUtil.showSnackBar(this.snackBar, data.body.developer_message);
          } else {
            NetworkUtil.showSnackBar(this.snackBar, 'Unable to submit data, please try again');
          }
        }
      }
    );
  }

  onRemarksDatagettingSuccessful(data:any){
    this.remarks = [];
    for(var item of data.data.remarks) {

      let remark: RemarksData = {

        id : item.id,
        user_name: item.display_name,
        remarks: item.remarks,
        date: this.datePipe.transform(item.created_on, 'medium')
        
  
      };
      console.log(this.remarks)
  
      this.remarks.push(remark);
    }

  }



}
