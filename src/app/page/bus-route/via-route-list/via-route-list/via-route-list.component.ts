import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError  } from 'rxjs';
import { catchError, retry, finalize } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { OperatorService } from 'src/app/services/operator/operator.service';
import { ProgressDialogComponent } from 'src/app/dialog/progress-dialog/progress-dialog.component';
import { ViaRoute } from 'src/app/model/bus-route';
import { BusRouteService } from 'src/app/services/bus-route/bus-route.service';
import { BusRouteMappingMetaData } from 'src/app/model/route';
import { NetworkUtil } from 'src/app/util/network-util';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { TownFilterDialogComponent } from 'src/app/dialog/town-filter-dialog/town-filter-dialog.component';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-via-route-list',
  templateUrl: './via-route-list.component.html',
  styleUrls: ['./via-route-list.component.scss']
})
export class ViaRouteListComponent implements OnInit {

  busRouteMappingMetaData!: BusRouteMappingMetaData;
  viaRoutes: ViaRoute[] = [];
  displayedColumns: string[] = ['from_town', 'to_town', 'status'];

  filters = new Map();
  filtersDisplayValue = new Map();
  firstCallAfterFilterChanged: boolean = false;

  constructor(private router: Router, private busRouteService: BusRouteService, public dialog: MatDialog,
    private snackBar: MatSnackBar) { 
      var navigation = this.router.getCurrentNavigation();
      if(navigation != null) {
        this.busRouteMappingMetaData = navigation.extras.state as BusRouteMappingMetaData;
      }
  }

  ngOnInit(): void {
    this.createViaRouteListFromServer();
  }

  toggleEvent(viaRoute: ViaRoute) {
    this.updateViaRoute_Status(viaRoute);
  }

  nextPage() {
    this.router.navigateByUrl('/dashboard/listBusRouteStoppage', { state: this.busRouteMappingMetaData });
  }

  createViaRouteListFromServer() {
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    var requestData = {
      'bus_route_id': this.busRouteMappingMetaData.id, 
    };
    this.busRouteService.createViaRouteList(token, requestData)
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        console.log('getViaRouteListFromServer response data ', data.body);

        if(data.body.status == 200) {
          dialogRef.close();  
          this.onSuccessfullyGettingViaRoutes(data.body);
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

  getViaRouteListFromServer() {
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    // var requestData = {
    //   'bus_route_id':this.busRouteMappingMetaData.id , 
    // };
    this.busRouteService.getViaRouteList(token, this.busRouteMappingMetaData.id,this.filters.get('from_town')?.id ??undefined,this.filters.get('to_town')?.id ??undefined)
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        console.log('getViaRouteListFromServer2 response data ', data.body);

        if(data.body.status == 200) {
          dialogRef.close();  
          this.onSuccessfullyGettingViaRoutes(data.body);
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

  onSuccessfullyGettingViaRoutes(body: any) {
    this.viaRoutes = [];

    for(var item of body.data) {
      try {
        let viaRoute = this.convertJsonToObject(item); 
        this.viaRoutes.push(viaRoute);
      } catch(error) {
        NetworkUtil.showSnackBar(this.snackBar, error as string);
      }
    }
  }

  convertJsonToObject(item: any) {
    let viaRoute: ViaRoute = {
      id: item.id,
      fromTownName: item.from_route_town.name,
      toTownName: item.to_route_town.name,
      status: item.status == 'active',
      newStatusValue: item.status == 'active',
    };

    return viaRoute;
  }

  removeFilter(key: string) {
    this.filters.delete(key);
    this.filtersDisplayValue.delete(key);
    this.firstCallAfterFilterChanged = true;
    this.getViaRouteListFromServer();
  }

  openStartTownFilterDialog(value: any){
    let button: MatButton = value;
    console.log(button._elementRef.nativeElement.getBoundingClientRect());

    let dialogPositionTop: string = button._elementRef.nativeElement.getBoundingClientRect().top + button._elementRef.nativeElement.getBoundingClientRect().height + 5 + 'px';
    let dialogPositionLeft: string = button._elementRef.nativeElement.getBoundingClientRect().left + 'px';

    const dialogRef = this.dialog.open(TownFilterDialogComponent, {
      position: { top: dialogPositionTop, left: dialogPositionLeft}
    }).afterClosed().subscribe(startTown => {
      if(startTown != null) {
        this.firstCallAfterFilterChanged = true;
        this.filters.set('from_town', startTown);
        this.filtersDisplayValue.set('from_town', startTown.name);
        this.getViaRouteListFromServer();
      }
    });

  }

  openEndTownFilterDialog(value: any){
    let button: MatButton = value;
    console.log(button._elementRef.nativeElement.getBoundingClientRect());

    let dialogPositionTop: string = button._elementRef.nativeElement.getBoundingClientRect().top + button._elementRef.nativeElement.getBoundingClientRect().height + 5 + 'px';
    let dialogPositionLeft: string = button._elementRef.nativeElement.getBoundingClientRect().left + 'px';

    const dialogRef = this.dialog.open(TownFilterDialogComponent, {
      position: { top: dialogPositionTop, left: dialogPositionLeft}
    }).afterClosed().subscribe(endTown => {
      if(endTown != null) {
        this.firstCallAfterFilterChanged = true;
        this.filters.set('to_town', endTown);
        this.filtersDisplayValue.set('to_town', endTown.name);
        this.getViaRouteListFromServer();
      }
    });

  }

  updateViaRoute_Status(viaRoute: ViaRoute) {
    console.log('updateViaRoute_Status');
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    var requestData = {
      'status': viaRoute.newStatusValue == true ? 'active' : 'inactive'
    };
    this.busRouteService.updateViaRouteStatus(token, viaRoute.id, requestData)
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        if(data.body.status == 200) {
          this.onViaRouteStatus_UpdatedSuccessfully(data.body);
        } else {
          viaRoute.newStatusValue = viaRoute.status;

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

  onViaRouteStatus_UpdatedSuccessfully(body: any) {
    //TODO
  }

}
