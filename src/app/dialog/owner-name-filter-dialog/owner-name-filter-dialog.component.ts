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
  selector: 'app-owner-name-filter-dialog',
  templateUrl: './owner-name-filter-dialog.component.html',
  styleUrls: ['./owner-name-filter-dialog.component.scss']
})
export class OwnerNameFilterDialogComponent implements OnInit {

  ownerName!: any;

  formGrp!: FormGroup;
  ownerNameControl!: FormControl;

  serachValue!: any;
  serachValueLettersCount!: number;

  allSearchedOwnerName: any[] = [];
  filteredOwnerNameOptions!: Observable<any[]>;

  constructor(public dialogRef: MatDialogRef<OwnerNameFilterDialogComponent>, private operatorService: OperatorService, 
    private formBuilder: FormBuilder, private snackBar: MatSnackBar, public dialog: MatDialog, private router: Router) { 
      
    }

  ngOnInit(): void {
    this.initFormGrp();

    this.filteredOwnerNameOptions = this.ownerNameControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterOwnerName(value)),
    );
  }

  initFormGrp() {
    this.ownerNameControl = new FormControl('', [Validators.required]);

    this.formGrp = this.formBuilder.group(
      {
        ownerName : this.ownerNameControl
      }
    );
  }

  _filterOwnerName(value: string): Bus[] {
    const filterValue = value.toLowerCase();

    return this.allSearchedOwnerName.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  onOwnerNameSelectionChanged(ownerName: any, event: any) {
    if(event.isUserInput) {
      this.ownerName = CommonUtil.deepCopy(ownerName);
    }
  }

  onKeyUpEvent(event: any) {
    this.serachValueLettersCount = event.target.value.length;
    this.serachValue = event.target.value;

    if(this.serachValueLettersCount != 0 && this.serachValueLettersCount != 1  ){
      this.getOwnerNameList();  
    }
  }

  getOwnerNameList() {
    // if(this.allSearchedOwnerName.length == 0) {
      // const dialogRef = this.dialog.open(ProgressDialogComponent);

      let data = JSON.parse(localStorage.getItem('token') || '{}');
      var token = data.token;

      this.operatorService.searchOwnerName(token, 'owner=', this.serachValue)
      .pipe(
              catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
        // finalize(() => dialogRef.close())
      ).subscribe(
        data => {
          if(data.body.status == 200) {
            this.onGettingOwnerNameListSuccessfully(data.body);
          } else {
            if(data.body.ui_message != null){
              NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
            } else if(data.body.developer_message != null){
              NetworkUtil.showSnackBar(this.snackBar, data.body.developer_message);
            } else {
              NetworkUtil.showSnackBar(this.snackBar, 'Unable to get Owner Name data, please try again');
            }
          }
        }
      );
    
  }

  onGettingOwnerNameListSuccessfully(data: any) {
    this.allSearchedOwnerName = [];

    for(var item of data.data) {
      let ownerName = {
        id: item.id,
        name: item.owner
      };

      this.allSearchedOwnerName.push(ownerName);
    }
  }
  
  onSubmit() {
    if(this.ownerName == null) {
      return;
    }
    this.dialogRef.close(this.ownerName);
  }

}
