import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError  } from 'rxjs';
import { catchError, retry, finalize } from 'rxjs/operators';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BusService } from 'src/app/services/bus/bus.service';
import { Operator } from 'src/app/model/operator';
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



@Component({
  selector: 'app-list-buses',
  templateUrl: './list-buses.component.html',
  styleUrls: ['./list-buses.component.scss']
})
export class ListBusesComponent implements OnInit {
  busRouteMappingMetaDataList: BusRouteMappingMetaData[] = [];
  displayedColumns: string[] = ['bus_number', 'company_name', 'mobile', 'status', 'seating_type', 'ac_state', 'bus_type', 'gps_installed', 'booking_allowed'];
  buses: Bus[] = [];

  itemCount!: number;
  pageEvent!: PageEvent;
  @ViewChild('paginator') paginator!: MatPaginator;

  constructor(private router: Router, private busService: BusService, private busRouteService: BusRouteService,
     public dialog: MatDialog,
    private snackBar: MatSnackBar) {
  }

  filters = new Map();
  filtersDisplayValue = new Map();
  firstCallAfterFilterChanged: boolean = false;

  pageKey: string = 'listbus';

  ngOnInit(): void {
    let savedFilterMaps = FilterStorageUtil.getAllFilters(this.pageKey , ['bus', 'name', 'mobile']);
    this.filters = savedFilterMaps[0];
    this.filtersDisplayValue = savedFilterMaps[1];

    this.getBusListFromServer(1);


  }

  onAddBusClick() {
    this.router.navigateByUrl('/dashboard/editBus');
  }

  // onAddBusClick() {
  //   let busOperator: BusOperator = {
  //     operator: this.operator
  //   };

  //   this.router.navigateByUrl('/edit-bus', { state: busOperator });
  // }

  onEditBusClick(bus:Bus) {
    // let busOperator: BusOperator = {
    //   bus: bus,
    //   operator: this.operator
    // };

    // this.router.navigateByUrl('/dashboard/editBus', { state: bus });
    this.retrieveOperatorDetailsFromServer(bus.bus_id as string);
  }

  onPaginateChange(event: PageEvent) {
    let page = event.pageIndex;
    let size = event.pageSize;

    page = page + 1;
    this.getBusListFromServer(page);
  }

  getBusListFromServer(pageIndex: number) {
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    this.busService.busList(token, pageIndex, 
      this.filters.get('bus')?? undefined, 
      this.filters.get('name')??undefined, 
      this.filters.get('mobile')??undefined)
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
          this.onSuccessfullyGettingBuses(data.body);
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

  onSuccessfullyGettingBuses(body: any) {
    this.buses = [];
    this.itemCount = body.data.count;

    for(var item of body.data.results) {
      try {
        if(item.operator != undefined) {
          let bus = this.convertJsonToObject(item);

          // this.addImagesData(bus, item);
          this.buses.push(bus);
        }
      } catch(error) {
        NetworkUtil.showSnackBar(this.snackBar, error as string);
      }
    }
  }

  convertJsonToObject(item: any) {
    let bus: Bus = {
      bus_id: item.id,

      bus_number: item.number,
      bus_make: item.brand,

      operator_id: item.operator.id,
      operator_name: item.operator.name,
      operator_number: item.operator.mobile,

      seating_type: item.seat_type,
      total_seats: item.normal_seats_capacity,
      total_sleepers: item.single_sleeper_capacity,
      total_sharing_sleepers: item.sharing_sleeper_capacity,
      pos_lock: item.pos_lock,


      total_upper_sleepers: item.upper_single_sleeper_capacity,
      total_upper_sharing_sleepers: item.upper_sharing_sleeper_capacity,

      layout_type: item.layout_type,
      gps_status: item.gps_status,
      status: item.status,

      bus_type: item.category,
      type: item.operating_as,

      has_ac: item.is_air_conditioned,

      driver_name: item.driver_name,
      driver_number: item.driver_contact,

      conductor_name: item.conductor_name,
      conductor_number: item.conductor_contact,
      cash_commission: item.cash_commission,
      digital_commission: item.digital_commission,
      bookingAllowed: item.is_booking_allowed,
      is_pos_connected: item.is_pos_connected,
      print_bus_number: item.print_bus_number,
      ticket_header: item.ticket_header,

      bus_rc_images: [],
      bus_images: [],
      adhaar_images: []
    };

    return bus;
  }

  addImagesData(bus: Bus, item: any) {
    for(var imageItem of item.images_data) {
      var type = imageItem.type;

      let operatorImageData: BusImageData = {
        id: imageItem.id,
        bus_image_id: imageItem.bus_image_id,
        bus: imageItem.bus,
        type: imageItem.type,
        image: imageItem.image
      }

      if(type === 'bus_rc') {
        bus.bus_rc_images.push(operatorImageData);
      } else if(type === 'bus') {
        bus.bus_images.push(operatorImageData);
      } else if(type === 'adhaar') {
        bus.adhaar_images.push(operatorImageData);
      }

    }
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
          this.filters.set('name', companyName.name);
          this.filtersDisplayValue.set('name', companyName.name);

          FilterStorageUtil.saveFilter(this.pageKey, 'name', companyName.name, companyName.name );

          this.getBusListFromServer(1);
        }
      });
    }

    removeFilter(key: string) {
      this.filters.delete(key);
      this.filtersDisplayValue.delete(key);
      this.firstCallAfterFilterChanged = true;

      FilterStorageUtil.removeFilter(this.pageKey, key);

      this.getBusListFromServer(1);
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
          this.getBusListFromServer(1);
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

            this.getBusListFromServer(1);
          }
        });
      }
  

}
