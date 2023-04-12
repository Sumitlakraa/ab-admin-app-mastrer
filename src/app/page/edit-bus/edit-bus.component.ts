import { Component, OnInit } from '@angular/core';
import { Router, Navigation } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { HttpErrorResponse, HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError  } from 'rxjs';
import { catchError, retry, finalize } from 'rxjs/operators';
import { DatePipe, Location } from '@angular/common';
import {map, startWith} from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { MatChip } from '@angular/material/chips';
import { ProgressDialogComponent } from '../../dialog/progress-dialog/progress-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

import { UploadFileModel } from '../../model/upload-file-model';
import { FileUploadService } from 'src/app/services/file-upload/file-upload.service';

import { Operator } from '../../model/operator';
import { Bus } from '../../model/bus';
import { BusImageData } from '../../model/image-data';
import { BusService } from 'src/app/services/bus/bus.service';
import { NetworkUtil } from 'src/app/util/network-util';
import { BusRouteMappingMetaData } from 'src/app/model/route';
import { RemarksData } from 'src/app/model/remarks';

@Component({
  selector: 'app-edit-bus',
  templateUrl: './edit-bus.component.html',
  styleUrls: ['./edit-bus.component.scss']
})
export class EditBusComponent implements OnInit {

  bus_makers: string[] = ['Tata', 'Ashok Leyland', 'Bharat Benz', 'Volvo', 'Mercedes', 'Scania', 'Marcopolo', 'Eicher', 'Other'];
  seating_types: string[] = ['Seater', 'Seater_Sleeper', 'Sleeper'];

  layout_options: string[] = ['2+1', '2+2', '1+2', '2+3', '3+3'];
  gps_options: string[] = ['in_progress', 'installed', 'not_installed', 'faulty'];
  status_options: string[] = ['onboarded', 'active', 'inactive'];
  ac_options: string[] = ['AC', 'Non-AC'];

  allSearchedOperators: OperatorSearchModel[] = [];
  // options: string[] = ['one', 'two', 'three'];
  filteredOptions!: Observable<OperatorSearchModel[]>;

  formGrp!: FormGroup;
  busOperatorControl!: FormControl;

  // operator!: Operator;
  bus!: Bus;

  busRCSelectedFiles!: File[];
  busSelectedFiles!: File[];
  adhaarSelectedFiles!: File[];

  listOfFilesToBeUploaded!: UploadFileModel[];
  imagesToBeDeletedFromServer: BusImageData[] = [];

  remarks: RemarksData[] = [];


  userRole!: any;

  constructor(private datePipe: DatePipe,private router: Router, private formBuilder: FormBuilder, private snackBar: MatSnackBar, private location: Location,
    public dialog: MatDialog, private busService: BusService, private fileUploadService: FileUploadService) { 

    var navigation = this.router.getCurrentNavigation();
    if(navigation != null) {
      let bus = navigation.extras.state as Bus;
      this.bus = bus as Bus;
      // this.operator = busOperator.operator;

      // console.log('busOperator :::');
      // console.log(busOperator);
    }

    if(this.bus == null) {
      this.bus = {
        operator_name: '',
        operator_number: '',

        bus_number: '',
        bus_make: '',

        seating_type: '',
        // total_seats: ,
        // total_sleepers: ,
        // total_sharing_sleepers: ,
        layout_type: '',
        gps_status: '',
        status: '',
    
        bus_type: '',
        type: '',

        has_ac: undefined,

        driver_name: '',
        driver_number: '',
    
        conductor_name: '',
        conductor_number: '',
        pos_lock: false,
        // commission: ,
        bookingAllowed: false,
        is_pos_connected: false,        

        print_bus_number: true,
        ticket_header: '',

        bus_rc_images: [],
        bus_images: [],
        adhaar_images: []
      };
    }

    this.initFormGrp();
    this.getOperatorList();
  }

  ngOnInit(): void {
    this.filteredOptions = this.busOperatorControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value)),
    );

    if(this.bus.bus_id != undefined) {
      this.updateFormBasedOnSeatSelection(this.bus.seating_type);
    }

    let data = JSON.parse(localStorage.getItem('userRole') || '{}');
    this.userRole = data.userRole;
    console.log(this.userRole)

    if(this.bus.bus_id != undefined) {
      this.retrieveOperatorDetailsFromServer(this.bus.bus_id as string)    }

  }

  initFormGrp() {
    this.busOperatorControl = new FormControl({value: this.bus.operator_number, 
    disabled: false});

    this.formGrp = this.formBuilder.group(
      {
        bus_operator : this.busOperatorControl,
        company_name : new FormControl({value: this.bus.operator_name, disabled: true}),

        bus_number : new FormControl(this.bus.bus_number, [Validators.required]),
        bus_make : new FormControl(this.bus.bus_make, [Validators.required]),

        seating_type : new FormControl(this.bus.seating_type, [Validators.required]),
        total_seats : new FormControl(this.bus.total_seats, [Validators.required]),
        total_sleepers : new FormControl(this.bus.total_sleepers, [Validators.required]),
        total_sharing_sleepers : new FormControl(this.bus.total_sharing_sleepers, [Validators.required]),
        total_upper_sleepers : new FormControl(this.bus.total_upper_sleepers, [Validators.required]),
        total_upper_sharing_sleepers : new FormControl(this.bus.total_upper_sharing_sleepers, [Validators.required]),
        layout_type : new FormControl(this.bus.layout_type, [Validators.required]),
        gps_status : new FormControl(this.bus.gps_status, [Validators.required]),
        status : new FormControl(this.bus.status, [Validators.required]),
        pos_lock : new FormControl(this.bus.pos_lock, [Validators.required]),


        bus_type : new FormControl(this.bus.bus_type),
        type: new FormControl(this.bus.type, [Validators.required]),

        ac_state : new FormControl(this.bus.has_ac == undefined ? undefined : ( this.bus.has_ac ? 'AC' : 'Non-AC') , [Validators.required]),

        driver_name : new FormControl(this.bus.driver_name),
        driver_number : new FormControl(this.bus.driver_number),

        conductor_name : new FormControl(this.bus.conductor_name),
        conductor_number : new FormControl(this.bus.conductor_number),
        cash_commission : new FormControl(this.bus.cash_commission, [Validators.required]),
        digital_commission : new FormControl(this.bus.digital_commission, [Validators.required]),

        booking_allowed : new FormControl(this.bus.bookingAllowed, [Validators.required]),
        is_pos_connected : new FormControl(this.bus.is_pos_connected, [Validators.required]),
        print_bus_number : new FormControl(this.bus.print_bus_number, [Validators.required]),
        ticket_header : new FormControl(this.bus.ticket_header),
        remark:new FormControl(),
      }
    );
  }

  _filter(value: string): OperatorSearchModel[] {
    console.log(value);
    const filterValue = value.toLowerCase();

    return this.allSearchedOperators.filter(option => option.operatorNumber.toLowerCase().includes(filterValue));
  }

  keyPressAlphaNumeric(event: any) {
    var inp = String.fromCharCode(event.keyCode);
    if (/[a-zA-Z0-9]/.test(inp)) {
      return true;
    } else {
      event.preventDefault();
      return false;
    }
  }

  onOperatorSelectionChanged(selectedOperator: OperatorSearchModel, event: any) {
    if(event.isUserInput) {
      this.bus.operator_id = selectedOperator.operatorId;
      this.formGrp.controls['company_name'].setValue(selectedOperator.operatorOrganizationName);
      this.formGrp.controls['company_name'].updateValueAndValidity();
    }
  }

  busTypeSelection(chip: MatChip) {
    chip.selected = true;

    this.formGrp.controls['bus_type'].setValue( chip.value);
    this.formGrp.controls['bus_type'].updateValueAndValidity();
  }

  typeSelection(chip: MatChip) {
    chip.selected = true;

    this.formGrp.controls['type'].setValue( chip.value);
    this.formGrp.controls['type'].updateValueAndValidity();
  }

  acTypeSelection(chip: MatChip) {
    chip.selected = true;

    this.formGrp.controls['ac_type'].setValue( chip.value);
    this.formGrp.controls['ac_type'].updateValueAndValidity();
  }

  onDeleteBusClick(){
    if(confirm("Are you sure to delete bus "+ this.bus.bus_number)) {
      this.deleteBus();
    }
  }

  onUpdateOfImagesToBeDeletedFromServer(imageData: any) {
    // this.imagesToBeDeletedFromServer.push(imageData);
  }

  onSelectionChanged(field: any) {
    this.updateFormBasedOnSeatSelection(field.value);
  }

  updateFormBasedOnSeatSelection(value: string) {
    if(value === 'sleeper') {
      this.formGrp.controls['total_seats'].disable();
      this.formGrp.controls['total_seats'].setValue(undefined);

      this.formGrp.controls['total_sleepers'].enable();
      this.formGrp.controls['total_sharing_sleepers'].enable();

      this.formGrp.controls['total_upper_sleepers'].enable();
      this.formGrp.controls['total_upper_sharing_sleepers'].enable();
    } else if(value === 'seater') {
      this.formGrp.controls['total_sleepers'].disable();
      this.formGrp.controls['total_sleepers'].setValue(undefined);

      this.formGrp.controls['total_seats'].enable();

      this.formGrp.controls['total_sharing_sleepers'].disable();
      this.formGrp.controls['total_sharing_sleepers'].setValue(undefined);

      this.formGrp.controls['total_upper_sleepers'].disable();
      this.formGrp.controls['total_upper_sleepers'].setValue(undefined);


      this.formGrp.controls['total_upper_sharing_sleepers'].disable();
      this.formGrp.controls['total_upper_sharing_sleepers'].setValue(undefined);
    } else {
      this.formGrp.controls['total_sleepers'].enable();
      this.formGrp.controls['total_seats'].enable();
      this.formGrp.controls['total_sharing_sleepers'].enable();
      this.formGrp.controls['total_upper_sleepers'].enable();
      this.formGrp.controls['total_upper_sharing_sleepers'].enable();      
    }
  }

  onBusRCFilesSelected(selectedFiles: File[]) {
    this.busRCSelectedFiles = selectedFiles;
  }

  onBusFilesSelected(selectedFiles: File[]) {
    this.busSelectedFiles = selectedFiles;
  }

  onAdhaarFilesSelected(selectedFiles: File[]) {
    this.adhaarSelectedFiles = selectedFiles;
  }

  onMapRouteClick() {
    let busRouteMappingMetaData = {
      routeMetaData: {

      },
      bus: {
        id: this.bus.bus_id,
        number: this.bus.bus_number,
        category: this.bus.bus_type
      },
      startTime: '',
      interval: 0,
      isActive: true
    } as BusRouteMappingMetaData;

    this.router.navigateByUrl('/dashboard/editBusRouteMapping', { state: busRouteMappingMetaData });
  }

  getOperatorList() {
    if(this.allSearchedOperators.length == 0) {
      const dialogRef = this.dialog.open(ProgressDialogComponent);

      let data = JSON.parse(localStorage.getItem('token') || '{}');
      var token = data.token;

      this.busService.searchOperator(token, '')
      .pipe(
              catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
        finalize(() => dialogRef.close())
      ).subscribe(
        data => {
          if(data.body.status == 200) {
            this.onGettingOperatorsListSuccessfully(data.body);
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
  }

  onGettingOperatorsListSuccessfully(data: any) {
    this.allSearchedOperators = [];

    for(var operator of data.data) {
      let searchOperator = {
        operatorId: operator.id,
        operatorOrganizationName: operator.name,
        operatorNumber: operator.mobile
      };

      this.allSearchedOperators.push(searchOperator);
    }

    console.log('#############');
    console.log(this.allSearchedOperators);
  }

  onSubmit() {
    if(this.formGrp.invalid || this.bus.operator_id === undefined) {
      NetworkUtil.showSnackBar( this.snackBar, 'Please complete form');
      return;
    }

    if(this.bus.bus_id == null) {
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

    this.busService.submitData(token, jsonData)
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

    this.busService.updateData(token, this.bus.bus_id as string, jsonData)
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

  deleteBus(){
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    this.busService.deleteBus(token, this.bus.bus_number )
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        if(data.body.status == 200) {
          this.onDeleteBusSuccessful();
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

  onDeleteBusSuccessful(){
    NetworkUtil.showSnackBar(this.snackBar, 'Bus deleted successfully');
  }

  onSubmitDataSuccessful(data: any) {
    this.bus.bus_id = data.data.bus_id;
    this.location.back();
  }

  createJSONDataFromFormData(value: any) {
    console.log('createJSONDataFromFormData', value);

    var data = {
        'number': value.bus_number, 'brand': value.bus_make,
        'seat_type': value.seating_type, 
        'normal_seats_capacity': value.total_seats ?? 0, 'single_sleeper_capacity': value.total_sleepers ?? 0, 'sharing_sleeper_capacity': value.total_sharing_sleepers ?? 0,
        'upper_single_sleeper_capacity': value.total_upper_sleepers ?? 0, 'upper_sharing_sleeper_capacity': value.total_upper_sharing_sleepers ?? 0,
        'category': value.bus_type, 'operating_as': value.type, 'is_air_conditioned': value.ac_state == 'AC',
        'driver_name': value.driver_name, 'driver_contact': value.driver_number,
        'conductor_name': value.conductor_name, 'conductor_contact': value.conductor_number,
        'operator_id': this.bus.operator_id, 
        'cash_commission' : value.cash_commission,
        'digital_commission' : value.digital_commission,
        'layout_type': value.layout_type, 'gps_status': value.gps_status, 'status': value.status,
        'is_booking_allowed': value.booking_allowed,
        'is_pos_connected': value.is_pos_connected,
        'print_bus_number': value.print_bus_number,
        'pos_lock': value.pos_lock,

        'ticket_header': value.ticket_header,
        'extra_fields': {
          'start_town': value.start_town, 'start_time': value.start_time, 'end_town': value.end_town
        },
        'remarks': value.remark
      };

    return data;
  }

  retrieveOperatorDetailsFromServer(busId: string) {
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    this.busService.retrieveData(token, busId)
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        console.log('retrieveOperatorDetailsFromServer response data ', data.body);

        if(data.body.status == 200) {
          dialogRef.close();
          this.onSuccessfullyGettingBusDetails(data.body);
        } else {
          if(data.body.ui_message != null){
            NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
          } else if(data.body.developer_message != null) {
            NetworkUtil.showSnackBar(this.snackBar, data.body.developer_message);
          } else {
            NetworkUtil.showSnackBar(this.snackBar, 'Unable to retrieve data, please try again');
          }
        }
      }
    );
  }

  onSuccessfullyGettingBusDetails(data: any) {
    let bus = this.convertJsonToObject(data.data);
  }

  convertJsonToObject(item: any) {
    console.log(item.remarks)
    this.remarks = [];
    for(var item of item.remarks) {

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

interface OperatorSearchModel {
  operatorId: string;
  operatorOrganizationName: string;
  operatorNumber: string
}