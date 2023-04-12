import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError  } from 'rxjs';
import { catchError, retry, finalize } from 'rxjs/operators';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Bus } from 'src/app/model/bus';
import { ProgressDialogComponent } from 'src/app/dialog/progress-dialog/progress-dialog.component';
import { BusImageData } from 'src/app/model/image-data';
import { NetworkUtil } from 'src/app/util/network-util';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { BusRouteMappingMetaData, RouteMetaData } from 'src/app/model/route';
import { BusFilterDialogComponent } from 'src/app/dialog/bus-filter-dialog/bus-filter-dialog.component';
import { BusRouteService } from 'src/app/services/bus-route/bus-route.service';
import { CompanyNameFilterDialogComponent } from 'src/app/dialog/company-name-filter-dialog/company-name-filter-dialog.component';

import { OwnerMobileFilterDialogComponent } from 'src/app/dialog/owner-mobile-filter-dialog/owner-mobile-filter-dialog.component';
import { FilterStorageUtil } from 'src/app/util/filter-storage-util';
import { OwnerNameFilterDialogComponent } from 'src/app/dialog/owner-name-filter-dialog/owner-name-filter-dialog.component';
import { ApnibusPayment, OperatorInvoice } from 'src/app/model/payment';
import { OperatorService } from 'src/app/services/operator/operator.service';
import { PaymentSettleComponent } from 'src/app/dialog/payment-settle/payment-settle.component';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-apnibus-payment-to-operator',
  templateUrl: './apnibus-payment-to-operator.component.html',
  styleUrls: ['./apnibus-payment-to-operator.component.scss']
})
export class ApnibusPaymentToOperatorComponent implements OnInit {

  displayedColumns: string[] = ['company_name', 'owner_name', 'mobile' , 'action', 'amount', 'reference_number','is_settle', 'date' , 'payment_date'];
  apnibusPayment: ApnibusPayment[] = [];

  itemCount!: number;
  pageEvent!: PageEvent;
  @ViewChild('paginator') paginator!: MatPaginator;

  constructor(private datePipe: DatePipe, private router: Router,  private operatorService: OperatorService,
     public dialog: MatDialog,
    private snackBar: MatSnackBar) {
  }

  filters = new Map();
  filtersDisplayValue = new Map();
  firstCallAfterFilterChanged: boolean = false;

  date: any;

  pageKey: string = 'listOperatorInvoice';

  ngOnInit(): void {
    let savedFilterMaps = FilterStorageUtil.getAllFilters(this.pageKey , ['owner', 'name', 'mobile']);
    this.filters = savedFilterMaps[0];
    this.filtersDisplayValue = savedFilterMaps[1];


    let todayDate = new Date();
    this.date = this.datePipe.transform(todayDate, 'yyyy-MM-dd');

    console.log(this.date)

    this.getOperatorInvoiceListFromServer(1);


  }

  // onAutoFillPricing(event: Event, busRouteMappingMetaData: BusRouteMappingMetaData) {
  //   this.openPaymentSettleDialog(busRouteMappingMetaData);
  //   event.stopPropagation();
  // }

  onAddBusClick() {
    this.router.navigateByUrl('/dashboard/editOperatorInvoice');
  }

  // onAddBusClick() {
  //   let busOperator: BusOperator = {
  //     operator: this.operator
  //   };

  //   this.router.navigateByUrl('/edit-bus', { state: busOperator });
  // }

  onEditOperatorInvoiceClick(operatorInvoice:OperatorInvoice) {
    // this.router.navigateByUrl('/dashboard/editOperatorInvoice', { state: operatorInvoice });

    // this.retrieveOperatorDetailsFromServer(operatorInvoice.id as string);
  }

  onPaginateChange(event: PageEvent) {
    let page = event.pageIndex;
    let size = event.pageSize;

    page = page + 1;
    this.getOperatorInvoiceListFromServer(page);
  }

  getOperatorInvoiceListFromServer(pageIndex: number) {
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;
    // var token = 'd112c88fd20d0317aae7a06ad8d4f7486fde5a13'

    this.operatorService.ApnibusPaymentList(token, 
      this.filters.get('company_name')??undefined, 
      this.filters.get('owner')?? undefined, 

      this.filters.get('mobile')??undefined,
      )
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        console.log('generateOtp response data ', data.body);

        if(data.body.status == 200) {
          dialogRef.close();
          this.onSuccessfullyGettingOperatorInvoices(data.body);
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

  onSuccessfullyGettingOperatorInvoices(body: any) {
    this.apnibusPayment = [];
    this.itemCount = body.data.count;

    for(var item of body.data) {
      try {
        if(item.operator != undefined) {
          let apnibusPayment = this.convertJsonToObject(item);

          // this.addImagesData(bus, item);
          this.apnibusPayment.push(apnibusPayment);
        }
      } catch(error) {
        NetworkUtil.showSnackBar(this.snackBar, error as string);
      }
    }
  }

  convertJsonToObject(item: any) {
    let apnibusPayment: ApnibusPayment = {
      id: item.id,

  

      Amount: item.amount,
  
      date: item.date,
      payment_date: item.payment_date, 
      operatorId: item.operator.id,
      companyName: item.operator.name,
      operatorNumber: item.operator.mobile,
      operatorName: item.operator.owner,

      remarks: item.remarks,
      isSettle: item.is_settled,
      referenceNumber: item.reference_number
    };

    return apnibusPayment;
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

          this.getOperatorInvoiceListFromServer(1);
        }
      });
    }


  // retrieveOperatorDetailsFromServer(busId: string) {
  //   const dialogRef = this.dialog.open(ProgressDialogComponent);

  //   let data = JSON.parse(localStorage.getItem('token') || '{}');
  //   var token = data.token;

  //   this.busService.retrieveData(token, busId)
  //   .pipe(
  //           catchError((err) => {
  //       return NetworkUtil.handleErrorForAll2(err, this.snackBar);
  //     }),
  //     finalize(() => dialogRef.close())
  //   ).subscribe(
  //     data => {
  //       console.log('retrieveOperatorDetailsFromServer response data ', data.body);

  //       if(data.body.status == 200) {
  //         dialogRef.close();
  //         this.onSuccessfullyGettingBusDetails(data.body);
  //       } else {
  //         if(data.body.ui_message != null){
  //           NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
  //         } else if(data.body.developer_message != null) {
  //           NetworkUtil.showSnackBar(this.snackBar, data.body.developer_message);
  //         } else {
  //           NetworkUtil.showSnackBar(this.snackBar, 'Unable to retrieve data, please try again');
  //         }
  //       }
  //     }
  //   );
  // }

  onSuccessfullyGettingBusDetails(data: any) {
    let bus = this.convertJsonToObject(data.data);
    this.router.navigateByUrl('/dashboard/editBus', { state: bus });
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
          this.filters.set('company_name', companyName.name);
          this.filtersDisplayValue.set('company_name', companyName.name);

          FilterStorageUtil.saveFilter(this.pageKey, 'company_name', companyName.name, companyName.name );

          this.getOperatorInvoiceListFromServer(1);
        }
      });
    }

    removeFilter(key: string) {
      this.filters.delete(key);
      this.filtersDisplayValue.delete(key);
      this.firstCallAfterFilterChanged = true;

      FilterStorageUtil.removeFilter(this.pageKey, key);

      this.getOperatorInvoiceListFromServer(1);
    }

    openBusFilterDialog(value: any) {
      let button: MatButton = value;
      console.log(button._elementRef.nativeElement.getBoundingClientRect());
  
      let dialogPositionTop: string = button._elementRef.nativeElement.getBoundingClientRect().top + button._elementRef.nativeElement.getBoundingClientRect().height + 5 + 'px';
      let dialogPositionLeft: string = button._elementRef.nativeElement.getBoundingClientRect().left + 'px';
  
      const dialogRef = this.dialog.open(BusFilterDialogComponent, {
        position: { top: dialogPositionTop, left: dialogPositionLeft}
      }).afterClosed().subscribe(bus => {
        if(bus != null) {
          this.firstCallAfterFilterChanged = true;
          this.filters.set('bus', bus.id);
          this.filtersDisplayValue.set('bus', bus.number);

          FilterStorageUtil.saveFilter(this.pageKey, 'bus', bus.id, bus.number );
          this.getOperatorInvoiceListFromServer(1);
        }
      });
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

            this.getOperatorInvoiceListFromServer(1);
          }
        });
      }

    openPaymentSettleDialog(value: any, id:any){
      let button: MatButton = value;
        console.log(button._elementRef.nativeElement.getBoundingClientRect());
    
        let dialogPositionTop: string = button._elementRef.nativeElement.getBoundingClientRect().top + button._elementRef.nativeElement.getBoundingClientRect().height + 5 + 'px';
        let dialogPositionLeft: string = button._elementRef.nativeElement.getBoundingClientRect().left + -150+'px';
    
        const dialogRef = this.dialog.open(PaymentSettleComponent, {
          position: { top: dialogPositionTop, left: dialogPositionLeft}
        }).afterClosed().subscribe(reference_number => {
          if(reference_number != null) {
            this.updatePymentSettlement(reference_number, id)
          }
        });
    }



    updatePymentSettlement(value:any, id:any) {
      const dialogRef = this.dialog.open(ProgressDialogComponent);
  
      let data = JSON.parse(localStorage.getItem('token') || '{}');
      var token = data.token;
  
      let jsonData = {"reference_number": value , "is_settled": true, "payment_date": this.date}


  
      this.operatorService.updateApnibusPayment(token, id, jsonData)
      .pipe(
              catchError((err) => {
          return NetworkUtil.handleErrorForAll2(err, this.snackBar);
        }),
        finalize(() => dialogRef.close())
      ).subscribe(
        data => {
          if(data.body.status == 200) {
            this.onSubmitDataSuccessful();
            NetworkUtil.showSnackBar( this.snackBar, "Settled Successfully ");

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

  
    onSubmitDataSuccessful(){
      this.getOperatorInvoiceListFromServer(1);
    }


  

}

