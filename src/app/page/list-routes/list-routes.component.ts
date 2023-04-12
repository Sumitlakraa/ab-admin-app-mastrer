import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError  } from 'rxjs';
import { catchError, retry, finalize } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ProgressDialogComponent } from '../../dialog/progress-dialog/progress-dialog.component';
import { RouteService } from 'src/app/services/route/route.service';
import { CreateRouteDialogComponent } from 'src/app/dialog/create-route-dialog/create-route-dialog.component';
import { Route, RouteMetaData, RouteTown, RouteTownBoardingPoint, SaveState } from 'src/app/model/route';
import { Town, TownBoardingPoint } from 'src/app/model/location';
import { NetworkUtil } from 'src/app/util/network-util';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { RouteFilterDialogComponent } from 'src/app/dialog/route-filter-dialog/route-filter-dialog.component';
import { MatButton } from '@angular/material/button';
import { FilterStorageUtil } from 'src/app/util/filter-storage-util';
import { RouteCloneDialogComponent } from 'src/app/dialog/route-clone-dialog/route-clone-dialog.component';

@Component({
  selector: 'app-list-routes',
  templateUrl: './list-routes.component.html',
  styleUrls: ['./list-routes.component.scss']
})
export class ListRoutesComponent implements OnInit {

  routes: RouteMetaData[] = [];
  displayedColumns: string[] = ['route_id', 'route_name', 'status', 'bus', 'town_stops', 'action'];

  selectedRouteMetaData!: RouteMetaData;

  filters = new Map();
  filtersDisplayValue = new Map();
  firstCallAfterFilterChanged: boolean = false;

  pageKey: string = 'listRoute';

  itemCount!: number;
  pageEvent!: PageEvent;
  @ViewChild('paginator') paginator!: MatPaginator;

  constructor(private router: Router, private routeService: RouteService, public dialog: MatDialog,
    private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    let savedFilterMaps = FilterStorageUtil.getAllFilters(this.pageKey , ['route']);
    this.filters = savedFilterMaps[0];
    this.filtersDisplayValue = savedFilterMaps[1];
    this.getRouteListFromServer(1);
  }

  onAddRouteClick() {
    // this.router.navigateByUrl('/dashboard/editRoute');
    const dialogRef = this.dialog.open(CreateRouteDialogComponent)
      .afterClosed().subscribe(data => {
        if(data != null) {
          this.selectedRouteMetaData = this.convertJsonToObject_RouteMetaData(data);
          console.log(this.selectedRouteMetaData);
          this.getRouteDetailsFromServer();
        }
      });
  }

  onCloneRouteClick() {
    // this.router.navigateByUrl('/dashboard/editRoute');
    const dialogRef = this.dialog.open(RouteCloneDialogComponent)
      .afterClosed().subscribe(data => {
        if(data != null) {
          this.selectedRouteMetaData = this.convertJsonToObject_RouteMetaData(data);
          console.log(this.selectedRouteMetaData);
          this.getRouteDetailsFromServer();
        }
      });
  }

  onEditRouteClick(routeMetaData: RouteMetaData) {
    this.selectedRouteMetaData = routeMetaData;
    this.getRouteDetailsFromServer();
  }

  onReverseRouteCreate(event: Event, routeMetaData: RouteMetaData) {
    this.createReverseRoute(routeMetaData);
    event.stopPropagation();
  }

  onPaginateChange(event: PageEvent) {
    let page = event.pageIndex;
    let size = event.pageSize;

    page = page + 1;
    this.getRouteListFromServer(page);
  }

  getRouteListFromServer(pageIndex: number) {
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    this.routeService.routeList(token, pageIndex, this.filters.get('route')?? undefined)
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        console.log('getRouteListFromServer response data ', data.body);

        if(data.body.status == 200) {
          dialogRef.close();  
          this.onSuccessfullyGettingRoutes(data.body);
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

  onSuccessfullyGettingRoutes(body: any) {
    this.routes = [];
    this.itemCount = body.data.count;

    for(var item of body.data.results) {
      try {
        let route = this.convertJsonToObject_RouteMetaData(item);
        this.routes.push(route);
      } catch(error) {
        NetworkUtil.showSnackBar(this.snackBar, error as string);
      }
    }
  }

  convertJsonToObject_RouteMetaData(data : any) {
    let routeMetaData: RouteMetaData = {
      route_id: data.id,

      via: data.via,
      name: data.name,
      bus_count: data.bus_count,
      town_count: data.town_count,

      fromTown: {
        id: data.from_town.id,
        name: data.from_town.name,
        district: {
          id: data.from_town.district.id,
          name: data.from_town.district.name,
          state: {
            id: data.from_town.district.state.id,
            name: data.from_town.district.state.name
          }
        }
      } as Town,
      toTown: {
        id: data.to_town.id,
        name: data.to_town.name,
        district: {
          id: data.to_town.district.id,
          name: data.to_town.district.name,
          state: {
            id: data.to_town.district.state.id,
            name: data.to_town.district.state.name
          }
        }
      } as Town,

      status: data.status,
    };

    return routeMetaData;
  }

  getRouteDetailsFromServer() {
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    this.routeService.routeDetails(token, this.selectedRouteMetaData.route_id as string)
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        console.log('getRouteDetailsFromServer response data ', data.body);

        if(data.body.status == 200) {
          dialogRef.close();  
          this.onSuccessfullyGettingRouteDetails(data.body);
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

  onSuccessfullyGettingRouteDetails(body: any) {
    let route: Route = {
      towns: []
    };

    for(var item of body.data) {
      let routeTown: RouteTown = this.convertJsonToObject_RouteTown(item);
      route.towns.push(routeTown);
    }

    let routeCompleteDetails = {
      routeMetaData: this.selectedRouteMetaData,
      route: route
    };

    this.router.navigateByUrl('/dashboard/editRoute', { state: routeCompleteDetails });
  }

  convertJsonToObject_RouteTown(item: any) {
    let routeTown: RouteTown = {
      id: item.id,
      town: {
        id: item.town.id,
        name: item.town.name,
        district: {
          id: item.town.district.id,
          name: item.town.district.name,
          state: {
            id: item.town.district.state.id,
            name: item.town.district.state.name
          }
        }
      } as Town,
      duration: item.duration,
      distance: item.distance,
      saveState: SaveState.Saved,
      boardingPoints: this.convertJsonToObject_BoardingPoints(item.route_town_stoppages),
      newDurationValue: item.duration,
      newDistanceValue: item.distance
    } as RouteTown

    return routeTown;
  }

  convertJsonToObject_BoardingPoints(stoppages: any) {
    let data : RouteTownBoardingPoint[] = [];

    for(var item of stoppages) {
      data.push({
        id: item.id,
        townBoardingPoint: {
          id: item.town_stoppage.id,
          name: item.town_stoppage.name,
          latitude: item.town_stoppage.latitude,
          longitude: item.town_stoppage.longitude,
          town: {
            name: '',
            district: {
              name: '',
              state: {
                name: ''
              }
            }
          }
        } as TownBoardingPoint,
        duration: item.duration,
        distance: item.distance,
        saveState: SaveState.Saved,
        status: item.status == 'active',
        etaStatus: item.eta_status == 'active',
        newEtaStatusValue: item.eta_status == 'active',
    
        newDurationValue: item.duration,
        newDistanceValue: item.distance,
        newStatusValue: item.status == 'active'
      });
    }

    return data;
  }

  removeFilter(key: string) {
    this.filters.delete(key);
    this.filtersDisplayValue.delete(key);
    this.firstCallAfterFilterChanged = true;

    FilterStorageUtil.removeFilter(this.pageKey, key);

    this.getRouteListFromServer(1);
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

        this.getRouteListFromServer(1);
      }
    });
  }

  createReverseRoute(routeMetaData: RouteMetaData){
  

    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;
    console.log("running ")

    var requestData = {
      'route_id': routeMetaData.route_id
    };

    this.routeService.createReverseRoute(token,requestData)
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        if(data.body.status == 200) {
          NetworkUtil.showSnackBar(this.snackBar, 'Reverse Route Created Successfully');
        } else {
          if(data.body.ui_message != null){
            NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
          } else if(data.body.developer_message != null) {
            NetworkUtil.showSnackBar(this.snackBar, data.body.developer_message);
          } else {
            NetworkUtil.showSnackBar(this.snackBar, 'Unable to create reverse route, please try again');
          }
        }
      }
    );
  }
  
}
