import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, finalize, map, Observable, startWith } from 'rxjs';
import { Bus } from 'src/app/model/bus';
import { OperatorService } from 'src/app/services/operator/operator.service';
import { LocationService } from 'src/app/services/location/location.service';
import { RouteService } from 'src/app/services/route/route.service';
import { CommonUtil } from 'src/app/util/common-util';
import { NetworkUtil } from 'src/app/util/network-util';
import { ProgressDialogComponent } from '../progress-dialog/progress-dialog.component';

@Component({
  selector: 'app-owner-mobile-filter-dialog',
  templateUrl: './owner-mobile-filter-dialog.component.html',
  styleUrls: ['./owner-mobile-filter-dialog.component.scss']
})
export class OwnerMobileFilterDialogComponent implements OnInit {

  mobile!: any;

  formGrp!: FormGroup;
  mobileControl!: FormControl;

  serachValue!: any;
  serachValueLettersCount!: number;

  allSearchedMobile: any[] = [];
  filteredMobileOptions!: Observable<any[]>;

  constructor(public dialogRef: MatDialogRef<OwnerMobileFilterDialogComponent>, private operatorService: OperatorService, 
    private formBuilder: FormBuilder, private snackBar: MatSnackBar, public dialog: MatDialog, private router: Router) { 
      
    }

  ngOnInit(): void {
    this.initFormGrp();

    this.filteredMobileOptions = this.mobileControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterMobile(value)),
    );
  }

  initFormGrp() {
    this.mobileControl = new FormControl('', [Validators.required]);

    this.formGrp = this.formBuilder.group(
      {
        mobile : this.mobileControl
      }
    );
  }

  _filterMobile(value: number): Bus[] {
    const filterValue = value;

    return this.allSearchedMobile.filter(option => option.number.includes(filterValue));
  }

  onMobileSelectionChanged(mobile: any, event: any) {
    if(event.isUserInput) {
      this.mobile = CommonUtil.deepCopy(mobile);
    }
  }

  onKeyUpEvent(event: any) {
    this.serachValueLettersCount = event.target.value.length;
    this.serachValue = event.target.value;

    if(this.serachValueLettersCount != 0 && this.serachValueLettersCount != 1  ){
      this.getMobileList();   
    }
  }

  getMobileList() {
    // if(this.allSearchedMobile.length == 0) {
      // const dialogRef = this.dialog.open(ProgressDialogComponent);

      let data = JSON.parse(localStorage.getItem('token') || '{}');
      var token = data.token;

      this.operatorService.searchOwnerMobile(token,'mobile=' , this.serachValue)
      .pipe(
              catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
        // finalize(() => dialogRef.close())
      ).subscribe(
        data => {
          if(data.body.status == 200) {
            this.onGettingMobileListSuccessfully(data.body);
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

  onGettingMobileListSuccessfully(data: any) {
    this.allSearchedMobile = [];

    for(var item of data.data) {
      let OwnerMobile = {
        id: item.id,
        number: item.mobile
      };

      this.allSearchedMobile.push(OwnerMobile);
    }
  }
  
  onSubmit() {
    if(this.mobile == null) {
      return;
    }
    this.dialogRef.close(this.mobile);
  }

}
