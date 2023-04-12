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
  selector: 'app-company-name-filter-dialog',
  templateUrl: './company-name-filter-dialog.component.html',
  styleUrls: ['./company-name-filter-dialog.component.scss']
})
export class CompanyNameFilterDialogComponent implements OnInit {

  companyName!: any;

  formGrp!: FormGroup;
  companyNameControl!: FormControl;

  serachValue!: any;
  serachValueLettersCount!: number;

  allSearchedCompanyName: any[] = [];
  filteredCompanyNameOptions!: Observable<any[]>;

  constructor(public dialogRef: MatDialogRef<CompanyNameFilterDialogComponent>, private operatorService: OperatorService, 
    private formBuilder: FormBuilder, private snackBar: MatSnackBar, public dialog: MatDialog, private router: Router) { 
      
    }

  ngOnInit(): void {
    this.initFormGrp();

    this.filteredCompanyNameOptions = this.companyNameControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterCompanyName(value)),
    );
  }

  initFormGrp() {
    this.companyNameControl = new FormControl('', [Validators.required]);

    this.formGrp = this.formBuilder.group(
      {
        companyName : this.companyNameControl
      }
    );
  }

  _filterCompanyName(value: string): Bus[] {
    const filterValue = value.toLowerCase();

    return this.allSearchedCompanyName.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  onCompanyNameSelectionChanged(companyName: any, event: any) {
    if(event.isUserInput) {
      this.companyName = CommonUtil.deepCopy(companyName);
    }
  }

  onKeyUpEvent(event: any) {
    this.serachValueLettersCount = event.target.value.length;
    this.serachValue = event.target.value;

    if(this.serachValueLettersCount != 0 && this.serachValueLettersCount != 1  ){
      this.getCompanyNameList();   
    }
  }

  getCompanyNameList() {
    // if(this.allSearchedCompanyName.length == 0) {
      // const dialogRef = this.dialog.open(ProgressDialogComponent);

      let data = JSON.parse(localStorage.getItem('token') || '{}');
      var token = data.token;

      this.operatorService.searchCompanyName(token,'name=', this.serachValue)
      .pipe(
              catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
        // finalize(() => dialogRef.close())
      ).subscribe(
        data => {
          if(data.body.status == 200) {
            this.onGettingCompanyNameListSuccessfully(data.body);
          } else {
            if(data.body.ui_message != null){
              NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
            } else if(data.body.developer_message != null){
              NetworkUtil.showSnackBar(this.snackBar, data.body.developer_message);
            } else {
              NetworkUtil.showSnackBar(this.snackBar, 'Unable to get Company Name data, please try again');
            }
          }
        }
      );
    
  }

  onGettingCompanyNameListSuccessfully(data: any) {
    this.allSearchedCompanyName = [];

    for(var item of data.data) {
      let companyName = {
        id: item.id,
        name: item.name
      };

      this.allSearchedCompanyName.push(companyName);
    }
  }
  
  onSubmit() {
    if(this.companyName == null) {
      return;
    }
    this.dialogRef.close(this.companyName);
  }

}
