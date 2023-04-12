import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, finalize, throwError } from 'rxjs';
import { BusFilterDialogComponent } from 'src/app/dialog/bus-filter-dialog/bus-filter-dialog.component';
import { ProgressDialogComponent } from 'src/app/dialog/progress-dialog/progress-dialog.component';
import { RouteFilterDialogComponent } from 'src/app/dialog/route-filter-dialog/route-filter-dialog.component';
import { Town } from 'src/app/model/location';
import { BusRouteMappingMetaData, RouteMetaData } from 'src/app/model/route';
import { BusRouteService } from 'src/app/services/bus-route/bus-route.service';
import { NetworkUtil } from 'src/app/util/network-util';
import { PricingService } from 'src/app/services/pricing/pricing.service';
import { UploadPricingDialogComponent } from 'src/app/dialog/upload-pricing-dialog/upload-pricing-dialog.component';
import { FilterStorageUtil } from 'src/app/util/filter-storage-util';
import { BusStatusFilterDialogComponent } from 'src/app/dialog/bus-status-filter-dialog/bus-status-filter-dialog.component';
import { UploadCommuterPricingDialogComponent } from 'src/app/dialog/upload-commuter-pricing-dialog/upload-commuter-pricing-dialog.component';
import { RemarksData } from 'src/app/model/remarks';
import { DatePipe } from '@angular/common';



@Component({
  selector: 'app-bus-route-list',
  templateUrl: './bus-route-list.component.html',
  styleUrls: ['./bus-route-list.component.scss']
})
export class BusRouteListComponent implements OnInit {

  busRouteMappingMetaDataList: BusRouteMappingMetaData[] = [];
  remarksData: RemarksData[] = [];
  displayedColumns: string[] = ['bus_number', 'route_name', 'bus_type', 'start_time', 'interval', 'status', 'is_active', 'action','conductor_pricing', 'commuter_pricing', 'auto_fill_pricing'];

  itemCount!: number;
  pageEvent!: PageEvent;
  @ViewChild('paginator') paginator!: MatPaginator;

  filters = new Map();
  filtersDisplayValue = new Map();
  firstCallAfterFilterChanged: boolean = false;

  pageKey: string = 'listBusRoute';

  constructor(private datePipe: DatePipe, private router: Router, private busRouteService: BusRouteService, private pricingService: PricingService, public dialog: MatDialog,
    private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    let savedFilterMaps = FilterStorageUtil.getAllFilters(this.pageKey , ['bus', 'route', 'busStatus']);
    this.filters = savedFilterMaps[0];
    this.filtersDisplayValue = savedFilterMaps[1];
    this.getBusRouteMappingMetaDataListFromServer(1);
  }

  onAddBusRouteMappingMetaDataClick() {
    this.router.navigateByUrl('/dashboard/editBusRouteMapping');
  }

  onEditBusRouteMappingMetaDataClick(busRouteMappingMetaData: BusRouteMappingMetaData) {
    this.router.navigateByUrl('/dashboard/editBusRouteMapping', { state: busRouteMappingMetaData });
  }

  stopPropagation(event: Event){
    event.stopPropagation();
  }

  toggleEvent( busRouteMappingMetaData: BusRouteMappingMetaData) {
    this.updateBusRoute_Status(busRouteMappingMetaData);
  }

  onViewJourneys(event: Event, busRouteMappingMetaData: BusRouteMappingMetaData) {
    this.router.navigateByUrl('/dashboard/listBusRouteJourney', { state: busRouteMappingMetaData });
    event.stopPropagation();
  }

  onDownloadConductorPricing(event: Event, busRouteMappingMetaData: BusRouteMappingMetaData) {
    this.downloadConductorPricing(busRouteMappingMetaData);
    event.stopPropagation();
  }

  onDownloadCommuterPricing(event: Event, busRouteMappingMetaData: BusRouteMappingMetaData) {
    this.downloadCommuterPricing(busRouteMappingMetaData);
    event.stopPropagation();
  }

  

  onAutoFillPricing(event: Event, busRouteMappingMetaData: BusRouteMappingMetaData) {
    this.autoFillPricingPricing(busRouteMappingMetaData);
    event.stopPropagation();
  }

  downloadConductorPricing(busRouteMappingMetaData: BusRouteMappingMetaData) {
    var downloadUrl = this.pricingService.getUrlToDownloadBusRoutepricing(busRouteMappingMetaData.id);
    this.openNewTab(downloadUrl);
  }

  downloadCommuterPricing(busRouteMappingMetaData: BusRouteMappingMetaData) {

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    var downloadUrl = this.pricingService.getUrlToDownloadCommuterBusRoutepricing(busRouteMappingMetaData.id);
    this.openNewTab(downloadUrl);
  }

  autoFillPricingPricing(busRouteMappingMetaData: BusRouteMappingMetaData) {

    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;
    console.log("running ")

    var requestData = {
      'bus_route_id': busRouteMappingMetaData.id
    };

    this.pricingService.autoFillPricing(token,requestData)
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        if(data.body.status == 200) {
          NetworkUtil.showSnackBar(this.snackBar, 'Auto Fill Pricing Updated Successfully');
        } else {
          if(data.body.ui_message != null){
            NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
          } else if(data.body.developer_message != null) {
            NetworkUtil.showSnackBar(this.snackBar, data.body.developer_message);
          } else {
            NetworkUtil.showSnackBar(this.snackBar, 'Unable to update pricing, please try again');
          }
        }
      }
    );
  }

  onUploadConductorPricingClick(value:any) {
    let button: MatButton = value;
    console.log(button._elementRef.nativeElement.getBoundingClientRect());

    let dialogPositionTop: string = button._elementRef.nativeElement.getBoundingClientRect().top 
          + button._elementRef.nativeElement.getBoundingClientRect().height + 5 + 'px';
    let dialogPositionLeft: string = button._elementRef.nativeElement.getBoundingClientRect().left + 'px';

    const dialogRef = this.dialog.open(UploadPricingDialogComponent, {
      position: { top: dialogPositionTop, left: dialogPositionLeft}
    })
  }

  onUploadCommuterPricingClick(value:any) {
    let button: MatButton = value;
    console.log(button._elementRef.nativeElement.getBoundingClientRect());

    let dialogPositionTop: string = button._elementRef.nativeElement.getBoundingClientRect().top 
          + button._elementRef.nativeElement.getBoundingClientRect().height + 5 + 'px';
    let dialogPositionLeft: string = button._elementRef.nativeElement.getBoundingClientRect().left + 'px';

    const dialogRef = this.dialog.open(UploadCommuterPricingDialogComponent, {
      position: { top: dialogPositionTop, left: dialogPositionLeft}
    })
  }

  openNewTab(url: string) {
    window.open(url, '_blank');
  }

  onPaginateChange(event: PageEvent) {
    let page = event.pageIndex;
    let size = event.pageSize;
  
    page = page + 1;
    this.getBusRouteMappingMetaDataListFromServer(page);
  }

  removeFilter(key: string) {
    this.filters.delete(key);
    this.filtersDisplayValue.delete(key);
    this.firstCallAfterFilterChanged = true;

    FilterStorageUtil.removeFilter(this.pageKey, key);

    this.getBusRouteMappingMetaDataListFromServer(1);
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

        FilterStorageUtil.saveFilter(this.pageKey, 'bus', bus.id, bus.number);

        this.getBusRouteMappingMetaDataListFromServer(1);
      }
    });
  }

  openRouteFilterDialog(value: any) {
    let button: MatButton = value;
    console.log(button._elementRef.nativeElement.getBoundingClientRect());

    let dialogPositionTop: string = button._elementRef.nativeElement.getBoundingClientRect().top + button._elementRef.nativeElement.getBoundingClientRect().height + 5 + 'px';
    let dialogPositionLeft: string = button._elementRef.nativeElement.getBoundingClientRect().left + 'px';

    const dialogRef = this.dialog.open(RouteFilterDialogComponent, {
      position: { top: dialogPositionTop, left: dialogPositionLeft}
    }).afterClosed().subscribe(route => {
      if(route != null) {
        this.firstCallAfterFilterChanged = true;
        this.filters.set('route', route.route_id);
        this.filtersDisplayValue.set('route', route.name);

        FilterStorageUtil.saveFilter(this.pageKey, 'route', route.route_id, route.name );
        
        this.getBusRouteMappingMetaDataListFromServer(1);
      }
    });
  }

  openBusStatusFilterDialog(value: any) {
    let button: MatButton = value;
    console.log(button._elementRef.nativeElement.getBoundingClientRect());

    let dialogPositionTop: string = button._elementRef.nativeElement.getBoundingClientRect().top + button._elementRef.nativeElement.getBoundingClientRect().height + 5 + 'px';
    let dialogPositionLeft: string = button._elementRef.nativeElement.getBoundingClientRect().left + 'px';

    const dialogRef = this.dialog.open(BusStatusFilterDialogComponent, {
      position: { top: dialogPositionTop, left: dialogPositionLeft}
    }).afterClosed().subscribe(busStatus => {
      if(busStatus != null) {
        this.firstCallAfterFilterChanged = true;
        this.filters.set('busStatus', busStatus.toLowerCase());
        this.filtersDisplayValue.set('busStatus', busStatus);

        FilterStorageUtil.saveFilter(this.pageKey, 'busStatus', busStatus.toLowerCase(), busStatus );


        this.getBusRouteMappingMetaDataListFromServer(1);
      }
    });
  }

  getBusRouteMappingMetaDataListFromServer(pageIndex: number) {
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    this.busRouteService.busRouteList(token, pageIndex,
      this.filters.get('bus')?? undefined, this.filters.get('route')?? undefined, this.filters.get('busStatus'))
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        console.log('getBusRouteMappingMetaDataListFromServer response data ', data.body);

        if(data.body.status == 200) {
          dialogRef.close();  
          this.onSuccessfullyGettingBusRouteMappingMetaDataList(data.body);
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

  onSuccessfullyGettingBusRouteMappingMetaDataList(body: any) {
    this.busRouteMappingMetaDataList = [];
    this.itemCount = body.data.count;

    for(var item of body.data.results) {
      try {
        let busRouteMappingMetaData = this.convertJsonToObject(item);
        this.busRouteMappingMetaDataList.push(busRouteMappingMetaData);
      } catch(error) {
        NetworkUtil.showSnackBar(this.snackBar, error as string);
      }
    }

    console.log(this.busRouteMappingMetaDataList);
  }

  convertJsonToObject(item: any) {
    let routeMetaData: RouteMetaData = {
      route_id: item.route.id,

      via: item.route.via,
      name: item.route.name,
      bus_count: item.route.bus_count,
      town_count: item.route.town_count,

      fromTown: {
        id: item.route.from_town.id,
        name: item.route.from_town.name,
        townStoppageCount: item.town_stoppage_count,
        district: {
          id: item.route.from_town.district.id,
          name: item.route.from_town.district.name,
          state: {
            id: item.route.from_town.district.state.id,
            name: item.route.from_town.district.state.name
          }
        }
      } as Town,
      toTown: {
        id: item.route.to_town.id,
        name: item.route.to_town.name,
        townStoppageCount: item.town_stoppage_count,
        district: {
          id: item.route.to_town.district.id,
          name: item.route.to_town.district.name,
          state: {
            id: item.route.to_town.district.state.id,
            name: item.route.to_town.district.state.name
          }
        }
      } as Town,

      status: item.route.status,
    };



    let busRouteMappingMetaData: BusRouteMappingMetaData = {
      id: item.id,
      routeMetaData: routeMetaData,
      bus: {
        id: item.bus.id,
        number: item.bus.number,
        category: item.bus.category,
        status: item.bus.status,
        is_pos_connected: item.bus.is_pos_connected
      },
      startTime: item.start_time,
      interval: item.interval,
      isActive: item.is_active,
      new_is_active: item.is_active,
      name:item.name,
    };

    return busRouteMappingMetaData;
  }





  updateBusRoute_Status( busRouteMappingMetaData: BusRouteMappingMetaData) {
    // console.log('updateConcession_Status');
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    var requestData = {
      'is_active': busRouteMappingMetaData.isActive == true ? 'false' : 'true'
    };
    this.busRouteService.updateBusRoute(token, busRouteMappingMetaData.id, requestData)
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        if(data.body.status == 200) {
          this.onBusRouteStatus_UpdatedSuccessfully(data.body);
        } else {
          busRouteMappingMetaData.isActive = busRouteMappingMetaData.new_is_active;

          if(data.body.ui_message != null){
            NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
          } else if(data.body.developer_message != null){
            NetworkUtil.showSnackBar(this.snackBar, data.body.developer_message);
          } else {
            NetworkUtil.showSnackBar(this.snackBar, 'Unable to update town on this route, please try again');
          }
        }
      }
    );
  }

  onBusRouteStatus_UpdatedSuccessfully(body: any) {
    NetworkUtil.showSnackBar(this.snackBar, 'Updated Successfully');
  }

}
