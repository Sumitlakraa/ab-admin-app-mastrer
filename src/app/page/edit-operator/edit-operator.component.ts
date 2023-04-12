import { Component, OnInit } from '@angular/core';
import { Router, Navigation } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { HttpErrorResponse, HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError  } from 'rxjs';
import { catchError, retry, finalize } from 'rxjs/operators';
import { DatePipe, Location } from '@angular/common'

import { Operator } from 'src/app/model/operator';
import { FileUploadService } from 'src/app/services/file-upload/file-upload.service';
import { UploadFileModel } from '../../model/upload-file-model';
import { OperatorImageData } from '../../model/image-data';

import { ProgressDialogComponent } from '../../dialog/progress-dialog/progress-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OperatorService } from 'src/app/services/operator/operator.service';
import { NetworkUtil } from 'src/app/util/network-util';
import { Bus } from 'src/app/model/bus';
import { RemarksData } from 'src/app/model/remarks';

@Component({
  selector: 'app-edit-operator',
  templateUrl: './edit-operator.component.html',
  styleUrls: ['./edit-operator.component.scss']
})
export class EditOperatorComponent implements OnInit {

  account_type_options: string[] = ['Saving', 'Current'];

  formGrp!: FormGroup;
  operator!: Operator;

  cancelChequeSelectedFiles!: File[];
  gstSelectedFiles!: File[];
  adhaarSelectedFiles!: File[];
  panSelectedFiles!: File[];

  remarks: RemarksData[] = [];
  status_options: string[] = ['onboarded', 'deboarded', 'locked'];

  constructor(private datePipe: DatePipe,private router: Router, private formBuilder: FormBuilder, private snackBar: MatSnackBar, private location: Location, 
    public dialog: MatDialog, private operatorService: OperatorService, private fileUploadService: FileUploadService) { 
    var navigation = this.router.getCurrentNavigation();
    if(navigation != null) {
      this.operator = navigation.extras.state as Operator;
    }

    if(this.operator == null) {
      this.operator = {
        company_name: '',
        company_name_hindi: '',
        owner_name: '',
        owner_number: '',
        email: '',
    
        poc_name: '',
        poc_number: '',
        town: '',
        address: '',
        status: '',
        bus_counts: undefined,
        onboarded_bus_count: undefined,
    
        gst_number: '',
        adhaar_number: '',
        pan_number: '',

        bank_name: '',
        account_name: '',
        account_number: '',
        ifsc_code: '',
        account_type: '',

        cancel_cheque_images: [],
        gst_images: [],
        adhaar_images: [],
        pan_images: [],
        remarks: {
          id: '',
          remarks: '',
          user_name: '',
          date:'',
        } as RemarksData,

        is_active: false
      }
    }

    this.initFormGrp();
  }

  ngOnInit(): void {

    if(this.operator.operator_id != null) {
      this.retrieveOperatorDetailsFromServer(this.operator.operator_id as string)
    }   
  }

  initFormGrp() {
    this.formGrp = this.formBuilder.group(
      {
        company_name : new FormControl(this.operator.company_name, [Validators.required]),
        company_name_hindi : new FormControl(this.operator.company_name_hindi, [Validators.required]),
        owner_name : new FormControl(this.operator.owner_name, [Validators.required]),
        owner_number : new FormControl(this.operator.owner_number, [Validators.required]),
        email : new FormControl(this.operator.email),

        poc_name : new FormControl(this.operator.poc_name),
        poc_number : new FormControl(this.operator.poc_number),
        town : new FormControl(this.operator.town, [Validators.required]),
        address : new FormControl(this.operator.address, [Validators.required]),
        bus_counts : new FormControl(this.operator.bus_counts, [Validators.required]),

        account_type : new FormControl(this.operator.account_type, [Validators.required]),
        bank_name : new FormControl(this.operator.bank_name, [Validators.required]),
        account_name : new FormControl(this.operator.account_name, [Validators.required]),
        account_number : new FormControl(this.operator.account_number, [Validators.required]),
        ifsc_code : new FormControl(this.operator.ifsc_code, [Validators.required]),
        gst_number : new FormControl(this.operator.gst_number),
        adhaar_number : new FormControl(this.operator.adhaar_number, [Validators.required]),
        pan_number : new FormControl(this.operator.pan_number),
        status : new FormControl(this.operator.status, [Validators.required]),
        remark : new FormControl(),

      }
    );
  }

  onCancelChequeFilesSelected(selectedFiles: File[]) {
    this.cancelChequeSelectedFiles = selectedFiles;
  }

  onGSTFilesSelected(selectedFiles: File[]) {
    this.gstSelectedFiles = selectedFiles;
  }

  onAdhaarFilesSelected(selectedFiles: File[]) {
    this.adhaarSelectedFiles = selectedFiles;
  }

  onPANFilesSelected(selectedFiles: File[]) {
    this.panSelectedFiles = selectedFiles;
  }

  onUpdateOfImagesToBeDeletedFromServer(imageData: any) {
    // this.imagesToBeDeletedFromServer.push(imageData);

    // console.log(this.imagesToBeDeletedFromServer);
  }

  onAddBusClick() {
    let bus = {
      operator_id: this.operator.operator_id,
      operator_name: this.operator.company_name,
      operator_number: this.operator.owner_number,

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

      has_ac: false,

      driver_name: '',
      driver_number: '',
  
      conductor_name: '',
      conductor_number: '',
      // commission: ,
      bookingAllowed: false,
      is_pos_connected: false,
      pos_lock: false,

      print_bus_number: true,
      ticket_header: '',

      bus_rc_images: [],
      bus_images: [],
      adhaar_images: []
    } as Bus;

    this.router.navigateByUrl('/dashboard/editBus', {state: bus});
  }

  onSubmit() {
    if(this.formGrp.invalid) {
      NetworkUtil.showSnackBar(this.snackBar, 'Please complete form');
      return;
    }

    if(this.operator.operator_id == null) {
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

    this.operatorService.submitData(token, jsonData)
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

  updateData() {
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    let jsonData = this.createJSONDataFromFormData(this.formGrp.value);

    this.operatorService.updateData(token, this.operator.operator_id as string, jsonData)
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

  onSubmitDataSuccessful(data: any) {
    this.operator.operator_id = data.data.operator_id;
    this.location.back();
  }

  createJSONDataFromFormData(value: any) {
    console.log('createJSONDataFromFormData', value);

    var data = {
        'name': value.company_name, 'hindi_name': value.company_name_hindi, 'owner': value.owner_name,
        'mobile': value.owner_number, 'email': value.email,
        'address': value.address, 'town': value.town,
        'poc_name': value.poc_name, 'poc_number': value.poc_number,
        'bus_count': value.bus_counts,
        'gstin': value.gst_number, 'aadhar_number': value.adhaar_number, 'pan_number': value.pan_number,
        'bank_accounts': [
          {
            'account_holder_name': value.account_name,
            'bank_name': value.bank_name,
            'account_number': value.account_number,
            'ifsc': value.ifsc_code,
            'account_type': value.account_type
          }
        ],
        'remarks': value.remark,
        'status': value.status
      };

    return data;
  }


  retrieveOperatorDetailsFromServer(operatorId: string) {
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    this.operatorService.retrieveData(token, operatorId)
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
          this.onSuccessfullyGettingOperatorDetails(data.body);
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

  onSuccessfullyGettingOperatorDetails(data: any) {
    let operator = this.convertJsonToObject(data.data);
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
