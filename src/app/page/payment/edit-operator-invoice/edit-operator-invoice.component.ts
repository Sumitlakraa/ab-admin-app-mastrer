import { Component, OnInit } from '@angular/core';
import { Router, Navigation } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { HttpErrorResponse, HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError  } from 'rxjs';
import { catchError, retry, finalize } from 'rxjs/operators';
import { Location } from '@angular/common';
import {map, startWith} from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { MatChip } from '@angular/material/chips';
import { ProgressDialogComponent } from 'src/app/dialog/progress-dialog/progress-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

import { UploadFileModel } from 'src/app/model/upload-file-model';
import { FileUploadService } from 'src/app/services/file-upload/file-upload.service';

import { Operator } from 'src/app/model/operator';
import { Bus } from 'src/app/model/bus';
import { BusImageData } from 'src/app/model/image-data';
import { OperatorService } from 'src/app/services/operator/operator.service';
import { NetworkUtil } from 'src/app/util/network-util';
import { BusRouteMappingMetaData } from 'src/app/model/route';
import { OperatorInvoice } from 'src/app/model/payment';
import { BusService } from 'src/app/services/bus/bus.service';


@Component({
  selector: 'app-edit-operator-invoice',
  templateUrl: './edit-operator-invoice.component.html',
  styleUrls: ['./edit-operator-invoice.component.scss']
})
export class EditOperatorInvoiceComponent implements OnInit {


  payment_mode_options: string[] = ['digital', 'cash'];

  allSearchedOperators: OperatorSearchModel[] = [];
  filteredOptions!: Observable<OperatorSearchModel[]>;

  formGrp!: FormGroup;
  operatorInvoiceControl!: FormControl;

  operatorInvoice!: OperatorInvoice;

  userRole!: any;

  constructor(private router: Router, private formBuilder: FormBuilder, private snackBar: MatSnackBar, private location: Location,
    public dialog: MatDialog, private operatorService: OperatorService, private busService: BusService, private fileUploadService: FileUploadService) { 

    var navigation = this.router.getCurrentNavigation();
    if(navigation != null) {
      let operatorInvoice = navigation.extras.state as OperatorInvoice;
      this.operatorInvoice = operatorInvoice as OperatorInvoice;
      // this.operator = busOperator.operator;

      // console.log('busOperator :::');
      // console.log(busOperator);
    }

    if(this.operatorInvoice == null) {
      this.operatorInvoice = {
        operatorName: '',
        operatorNumber: '',
        companyName: '',
        title: '',
        subtitle: '',
        gstText: '',
        totleAmount: 0,
        payableamountWithoutGst: 0,
        gstAmount: 0,
        payableamountWithGst: 0,
        date: '',
        remarks: '',
        payment_mode: '',
        isVisible: true,
        isPaid: false,

      };
    }

    this.initFormGrp();
    this.getOperatorList();
  }

  ngOnInit(): void {
    this.filteredOptions = this.operatorInvoiceControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value)),
    );

    if(this.operatorInvoice.id != undefined) {
      // this.updateFormBasedOnSeatSelection(this.operatorInvoice.seating_type);
    }

    let data = JSON.parse(localStorage.getItem('userRole') || '{}');
    this.userRole = data.userRole;
    console.log(this.userRole)
  }

  initFormGrp() {
    this.operatorInvoiceControl = new FormControl({value: this.operatorInvoice.operatorNumber, 
    disabled: false});

    this.formGrp = this.formBuilder.group(
      {
        bus_operator : this.operatorInvoiceControl,
        company_name : new FormControl({value: this.operatorInvoice.companyName, disabled: true}),
        owner_name : new FormControl({value: this.operatorInvoice.operatorName, disabled: true}),

        title : new FormControl(this.operatorInvoice.title, [Validators.required]),
        subtitle : new FormControl(this.operatorInvoice.subtitle, [Validators.required]),

        total_amount_without_gst : new FormControl(this.operatorInvoice.totleAmount, [Validators.required]),
        payable_amount_without_gst : new FormControl(this.operatorInvoice.payableamountWithoutGst, [Validators.required]),
        gst_amount : new FormControl(this.operatorInvoice.gstAmount, [Validators.required]),
        payable_amount_with_gst : new FormControl(this.operatorInvoice.payableamountWithGst, [Validators.required]),
        gst_text : new FormControl(this.operatorInvoice.gstText, [Validators.required]),


        date : new FormControl(this.operatorInvoice.date, [Validators.required]),


        payment_mode : new FormControl(this.operatorInvoice.payment_mode, [Validators.required]),


        is_visible: new FormControl(this.operatorInvoice.isVisible, [Validators.required]),
        is_paid : new FormControl(this.operatorInvoice.isPaid, [Validators.required]),
        remarks : new FormControl(this.operatorInvoice.remarks, [Validators.required]),
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
      this.operatorInvoice.operatorId = selectedOperator.operatorId;
      this.formGrp.controls['company_name'].setValue(selectedOperator.operatorOrganizationName);
      this.formGrp.controls['company_name'].updateValueAndValidity();
      this.formGrp.controls['owner_name'].setValue(selectedOperator.operatorName);
      this.formGrp.controls['owner_name'].updateValueAndValidity();
    }
  }



  // onDeleteBusClick(){
  //   if(confirm("Are you sure to delete bus "+ this.operatorInvoice.id)) {
  //     this.deleteBus();
  //   }
  // }


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
        operatorNumber: operator.mobile,
        operatorName: operator.owner
      };

      this.allSearchedOperators.push(searchOperator);
    }

    console.log('#############');
    console.log(this.allSearchedOperators);
  }

  onSubmit() {

    console.log(this.operatorInvoice.operatorId)
    console.log(this.formGrp)
    if(this.formGrp.invalid || this.operatorInvoice.operatorId === undefined) {
      NetworkUtil.showSnackBar( this.snackBar, 'Please complete form');
      return;
    }

    if(this.operatorInvoice.id == null) {
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

    this.operatorService.createInvoice(token, jsonData)
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

    this.operatorService.updateOperatorInvoice(token, this.operatorInvoice.id as string, jsonData)
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

  // deleteBus(){
  //   const dialogRef = this.dialog.open(ProgressDialogComponent);

  //   let data = JSON.parse(localStorage.getItem('token') || '{}');
  //   var token = data.token;

  //   this.operatorInvoice.deleteBus(token, this.operatorInvoice.id )
  //   .pipe(
  //           catchError((err) => {
  //       return NetworkUtil.handleErrorForAll2(err, this.snackBar);
  //     }),
  //     finalize(() => dialogRef.close())
  //   ).subscribe(
  //     data => {
  //       if(data.body.status == 200) {
  //         this.onDeleteBusSuccessful();
  //       } else {
  //         if(data.body.ui_message != null){
  //           NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
  //         } else if(data.body.developer_message != null) {
  //           NetworkUtil.showSnackBar(this.snackBar, data.body.developer_message);
  //         } else {
  //           NetworkUtil.showSnackBar(this.snackBar, 'Unable to submit data, please try again');
  //         }
  //       }
  //     }
  //   );
  // }

  onDeleteBusSuccessful(){
    NetworkUtil.showSnackBar(this.snackBar, 'Bus deleted successfully');
  }

  onSubmitDataSuccessful(data: any) {
    this.operatorInvoice.id = data.data.id;
    this.location.back();
  }

  createJSONDataFromFormData(value: any) {
    console.log('createJSONDataFromFormData', value);

    var data = {
        'title': value.title, 
        'subtitle': value.subtitle,
        'total_amount_without_gst': value.total_amount_without_gst ?? 0,
        'payable_amount_without_gst': value.payable_amount_without_gst ?? 0,
        'gst_amount': value.gst_amount ?? 0,
        'payable_amount_with_gst': value.payable_amount_with_gst ?? 0,
        'operator_id': this.operatorInvoice.operatorId,
        'date' : value.date,
        'is_paid': value.is_paid,
        'is_visible': value.is_visible,
        'remarks': value.remarks,
        'payment_mode': value.payment_mode,
        'gst_text': value.gst_text,

      };

    return data;
  }

}

interface OperatorSearchModel {
  operatorId: string;
  operatorOrganizationName: string;
  operatorNumber: string;
  operatorName: string;
}