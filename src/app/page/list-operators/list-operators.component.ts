import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError  } from 'rxjs';
import { catchError, retry, finalize } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { OperatorService } from 'src/app/services/operator/operator.service';
import { ProgressDialogComponent } from '../../dialog/progress-dialog/progress-dialog.component';

import { Operator } from '../../model/operator';
import { OperatorImageData } from '../../model/image-data';
import { NetworkUtil } from 'src/app/util/network-util';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

import { CompanyNameFilterDialogComponent } from 'src/app/dialog/company-name-filter-dialog/company-name-filter-dialog.component';
import { MatButton } from '@angular/material/button';
import { OwnerNameFilterDialogComponent } from 'src/app/dialog/owner-name-filter-dialog/owner-name-filter-dialog.component';
import { OwnerMobileFilterDialogComponent } from 'src/app/dialog/owner-mobile-filter-dialog/owner-mobile-filter-dialog.component';
import { FilterStorageUtil } from 'src/app/util/filter-storage-util';
import { RemarksData } from 'src/app/model/remarks';

@Component({
  selector: 'app-list-operators',
  templateUrl: './list-operators.component.html',
  styleUrls: ['./list-operators.component.scss']
})
export class ListOperatorsComponent implements OnInit {

  operators: Operator[] = [];
  displayedColumns: string[] = ['company_name', 'owner_name', 'owner_number', 'total_buses', 'town', 'status'];

  itemCount!: number;
  pageEvent!: PageEvent;
  @ViewChild('paginator') paginator!: MatPaginator;

  filters = new Map();
  filtersDisplayValue = new Map();
  firstCallAfterFilterChanged: boolean = false;

  pageKey: string = 'listOperator';

  constructor(private router: Router, private operatorService: OperatorService, public dialog: MatDialog,
    private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    let savedFilterMaps = FilterStorageUtil.getAllFilters(this.pageKey , ['name', 'owner', 'mobile']);
    this.filters = savedFilterMaps[0];
    this.filtersDisplayValue = savedFilterMaps[1];
    this.getOperatorsListFromServer(1);
  }

  onAddOperatorClick() {
    this.router.navigateByUrl('/dashboard/editOperator');
  }

  onEditOperatorClick(operator:Operator) {
    this.retrieveOperatorDetailsFromServer(operator.operator_id as string);
  }

  onPaginateChange(event: PageEvent) {
    let page = event.pageIndex;
    let size = event.pageSize;

    page = page + 1;
    this.getOperatorsListFromServer(page);
  }

  getOperatorsListFromServer(pageIndex: number) {
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    this.operatorService.operatorsList(token, pageIndex, 
      this.filters.get('name')?? undefined, this.filters.get('owner')?? undefined, this.filters.get('mobile')?? undefined)
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        console.log('getOperatorsListFromServer response data ', data.body);

        if(data.body.status == 200) {
          dialogRef.close();  
          this.onSuccessfullyGettingOperators(data.body);
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

  onSuccessfullyGettingOperators(body: any) {
    this.operators = [];
    this.itemCount = body.data.count;

    for(var item of body.data.results) {
      try {
        let operator = this.convertJsonToObject(item);
        console.log(operator) 
        // this.addImagesData(operator, item);
        this.operators.push(operator);
      } catch(error) {
        console.log(error as string)
        NetworkUtil.showSnackBar(this.snackBar, error as string);
      }
    }
  }

  convertJsonToObject(item: any) {
    let operator: Operator = {
      operator_id: item.id,

      company_name: item.name,
      owner_name: item.owner,
      company_name_hindi: item.hindi_name,
      owner_number: item.mobile,
      email: item.email,
  
      poc_name: item.poc_name,
      poc_number: item.poc_number,
      town: item.town,
      address: item.address,
      bus_counts: item.bus_count,
      onboarded_bus_count: item.onboarded_bus_count,

      gst_number: item.gstin,
      adhaar_number: item.aadhar_number,
      pan_number: item.pan_number,
  
      bank_name: item.bank_accounts[0].bank_name,
      account_name: item.bank_accounts[0].account_holder_name,
      account_number: item.bank_accounts[0].account_number,
      ifsc_code: item.bank_accounts[0].ifsc,
      account_type: item.bank_accounts[0].account_type,

      status: item.status,

      cancel_cheque_images: [],
      gst_images: [],
      adhaar_images: [],
      pan_images: [],
      remarks: {
        id : item.remarks.id,
        user_name: item.remarks.user,
        remarks: item.remarks.remarks,
        date: item.remarks.action_type
      } as RemarksData,

      is_active: item.is_active
    };

    return operator;
  }

  addImagesData(operator: Operator, item: any) {
    for(var imageItem of item.images_data) {
      var type = imageItem.type;

      let operatorImageData: OperatorImageData = {
        id: imageItem.id,
        operator_image_id: imageItem.operator_image_id,
        operator: imageItem.operator,
        type: imageItem.type,
        image: imageItem.image
      }

      if(type === 'cancel_cheque') {
        operator.cancel_cheque_images.push(operatorImageData);
      } else if(type === 'gst') {
        operator.gst_images.push(operatorImageData);
      } else if(type === 'adhaar') {
        operator.adhaar_images.push(operatorImageData);
      } else if(type === 'pan') {
        operator.pan_images.push(operatorImageData);
      }

    }
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
    this.router.navigateByUrl('/dashboard/editOperator', { state: operator });
  }

  openCompanyNameFilterDialog(value: any){
  let button: MatButton = value;
    console.log(button._elementRef.nativeElement.getBoundingClientRect());

    let dialogPositionTop: string = button._elementRef.nativeElement.getBoundingClientRect().top + button._elementRef.nativeElement.getBoundingClientRect().height + 5 + 'px';
    let dialogPositionLeft: string = button._elementRef.nativeElement.getBoundingClientRect().left + 'px';

    const dialogRef = this.dialog.open(CompanyNameFilterDialogComponent, {
      position: { top: dialogPositionTop, left: dialogPositionLeft}
    }).afterClosed().subscribe(companyName => {
      if(companyName != null) {
        this.firstCallAfterFilterChanged = true;
        this.filters.set('name', companyName.name);
        this.filtersDisplayValue.set('name', companyName.name);

        FilterStorageUtil.saveFilter(this.pageKey, 'name', companyName.name, companyName.name );

        this.getOperatorsListFromServer(1);
      }
    });
  }

  openOwnerNameFilterDialog(value: any){
    let button: MatButton = value;
      console.log(button._elementRef.nativeElement.getBoundingClientRect());
  
      let dialogPositionTop: string = button._elementRef.nativeElement.getBoundingClientRect().top + button._elementRef.nativeElement.getBoundingClientRect().height + 5 + 'px';
      let dialogPositionLeft: string = button._elementRef.nativeElement.getBoundingClientRect().left + 'px';
  
      const dialogRef = this.dialog.open(OwnerNameFilterDialogComponent, {
        position: { top: dialogPositionTop, left: dialogPositionLeft}
      }).afterClosed().subscribe(ownerName => {
        if(ownerName != null) {
          this.firstCallAfterFilterChanged = true;
          this.filters.set('owner', ownerName.name);
          this.filtersDisplayValue.set('owner', ownerName.name);

          FilterStorageUtil.saveFilter(this.pageKey, 'owner', ownerName.name, ownerName.name );

          this.getOperatorsListFromServer(1);
        }
      });
    }

    removeFilter(key: string) {
      this.filters.delete(key);
      this.filtersDisplayValue.delete(key);
      this.firstCallAfterFilterChanged = true;

      FilterStorageUtil.removeFilter(this.pageKey, key);
      
      this.getOperatorsListFromServer(1);
    }

    openMobileFilterDialog(value: any){
      let button: MatButton = value;
        console.log(button._elementRef.nativeElement.getBoundingClientRect());
    
        let dialogPositionTop: string = button._elementRef.nativeElement.getBoundingClientRect().top + button._elementRef.nativeElement.getBoundingClientRect().height + 5 + 'px';
        let dialogPositionLeft: string = button._elementRef.nativeElement.getBoundingClientRect().left + 'px';
    
        const dialogRef = this.dialog.open(OwnerMobileFilterDialogComponent, {
          position: { top: dialogPositionTop, left: dialogPositionLeft}
        }).afterClosed().subscribe(ownerMobile => {
          if(ownerMobile != null) {
            this.firstCallAfterFilterChanged = true;
            this.filters.set('mobile', ownerMobile.number);
            this.filtersDisplayValue.set('mobile', ownerMobile.number);

            FilterStorageUtil.saveFilter(this.pageKey, 'mobile', ownerMobile.number, ownerMobile.number );

            this.getOperatorsListFromServer(1);
          }
        });
      }

}