import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, finalize, map, Observable, startWith, Subject, throwError } from 'rxjs';
import { ProgressDialogComponent } from 'src/app/dialog/progress-dialog/progress-dialog.component';
import { Town, TownBoardingPoint } from 'src/app/model/location';
import { BusRouteMappingMetaData, RouteMetaData, RouteTown, RouteTownBoardingPoint, SaveState } from 'src/app/model/route';
import { BusRouteService } from 'src/app/services/bus-route/bus-route.service';
import { LocationService } from 'src/app/services/location/location.service';
import { RouteService } from 'src/app/services/route/route.service';
import { CommonUtil } from 'src/app/util/common-util';
import { NetworkUtil } from 'src/app/util/network-util';

@Component({
  selector: 'app-bus-route-town',
  templateUrl: './bus-route-town.component.html',
  styleUrls: ['./bus-route-town.component.scss']
})
export class BusRouteTownComponent implements OnInit {

  @Input() busRouteMappingMetaData!: BusRouteMappingMetaData;
  @Input() routeTown!: RouteTown;
  @Input() index!: number;

  @Output() boardingPointSatusChanged = new EventEmitter();
  @Output() boardingPointETASatusChanged = new EventEmitter();



  allSearchedTowns: Town[] = [];
  // allBoardPoints: TownBoardingPoint[] = [];

  townFilteredOptions!: Town[];
  townFilterSubject = new Subject<Town[]>();
  userRole!: any;

  constructor(private snackBar: MatSnackBar, private locationService: LocationService, private busRouteService: BusRouteService,
    private dialog: MatDialog) { 
    // this.getTownList();
  }

  ngOnInit(): void {
    this.townFilterSubject.pipe(
      startWith(''),
      map(value => this._filterTowns(value as string)),
    ).subscribe(value => {
      this.townFilteredOptions = value; 
    });

    let data = JSON.parse(localStorage.getItem('userRole') || '{}');
    this.userRole = data.userRole;
    console.log(this.userRole)
  }

  onTownSelectionChanged(town: any, event: any) {
    if(event.isUserInput) {
      this.routeTown.town = CommonUtil.deepCopy(town);
    }
  }

  onAddBusAddaClick() {
    if(this.routeTown.id === undefined) {
      NetworkUtil.showSnackBar(this.snackBar, 'First add town');
      return;
    }

    this.routeTown.boardingPoints.push({
      townBoardingPoint:{
        name: ''
      },
      saveState: SaveState.Changed
    } as RouteTownBoardingPoint);
  }

  onDeleteClick_ForTown() {
    //TODO
  }

  onSaveOrUpdateClick_ForTown() {
    // if(this.routeTown.id === undefined) {
    //   this.createRouteTown();
    // } else {
      this.updateBusRouteTown_Duration();
    // }
  }

  onBusRouteBoardingPointStatusChanged() {
    this.boardingPointSatusChanged.emit();
  }

  onBusRouteBoardingPointEtaStatusChanged() {
    this.boardingPointETASatusChanged.emit();
  }
 

  onKeyUpEvent(event: any) {
    this.townFilterSubject.next(event.target.value);
  }
  
  toggleEvent(event: any) {
    this.updateBusRouteTown_Status();
  }

  toggleEventETA(event: any) {
    this.updateBusRouteTownETA_Status();
  }

  // getTownList() {
  //   if(this.allSearchedTowns.length == 0) {
  //     // const dialogRef = this.dialog.open(ProgressDialogComponent);

  //     let data = JSON.parse(localStorage.getItem('token') || '{}');
  //     var token = data.token;

  //     this.locationService.searchTown(token, '')
  //     .pipe(
  //       catchError(this.handleErrorForAll),
  //       // finalize(() => dialogRef.close())
  //     ).subscribe(
  //       data => {
  //         if(data.body.status == 200) {
  //           this.onGettingTownListSuccessfully(data.body);
  //         } else {
  //           if(data.body.developer_message != null){
  //             this.showSnackBar(data.body.developer_message);
  //           } else {
  //             this.showSnackBar('Unable to get towns data, please try again');
  //           }
  //         }
  //       }
  //     );
  //   }
  // }

  // onGettingTownListSuccessfully(data: any) {
  //   this.allSearchedTowns = [];

  //   for(var item of data.data) {
  //     let town = {
  //       id: item.id,
  //       name: item.name,
  //       status: item.status,
  //       townStoppageCount: item.town_stoppage_count,
  //       district: {
  //         id: item.district.id,
  //         name: item.district.name,
  //         state: {
  //           id: item.district.state.id,
  //           name: item.district.state.name
  //         }
  //       }
  //     };

  //     this.allSearchedTowns.push(town);
  //   }
  // }

  // createRouteTown() {
  //   console.log('createRouteTown');
  //   // const dialogRef = this.dialog.open(ProgressDialogComponent);

  //   let data = JSON.parse(localStorage.getItem('token') || '{}');
  //   var token = data.token;

  //   var requestData = {
  //     'route_id': this.busRouteMappingMetaData.id,
  //     'town_id': this.routeTown.town.id,
  //     'duration': this.routeTown.newDurationValue
  //   };
  //   this.routeService.createRouteTown(token, requestData)
  //   .pipe(
  //     catchError(this.handleErrorForAll),
  //     // finalize(() => dialogRef.close())
  //   ).subscribe(
  //     data => {
  //       if(data.body.status == 200) {
  //         this.onRouteTownCreatedSuccessfully(data.body);
  //       } else {
  //         if(data.body.developer_message != null){
  //           this.showSnackBar(data.body.developer_message);
  //         } else {
  //           this.showSnackBar('Unable to create town on this route, please try again');
  //         }
  //       }
  //     }
  //   );
  // }

  // onRouteTownCreatedSuccessfully(body: any) {
  //   this.routeTown.id = body.data.id;
  //   this.routeTown.duration = this.routeTown.newDurationValue;
  //   this.routeTown.saveState = SaveState.Saved;
  // }

  updateBusRouteTown_Duration() {
    console.log('updateBusRouteTown_Duration');
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    var requestData = {
      'duration': this.routeTown.newDurationValue
    };
    this.busRouteService.updateBusRouteTown(token, this.routeTown.id, requestData)
    .pipe(
      catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        if(data.body.status == 200) {
          this.onRouteTownDuration_UpdatedSuccessfully(data.body);
        } else {
          if(data.body.ui_message != null){
            NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
          } else if(data.body.developer_message != null){
            NetworkUtil.showSnackBar( this.snackBar, data.body.developer_message);
          } else {
            NetworkUtil.showSnackBar( this.snackBar, 'Unable to update town on this route, please try again');
          }
        }
      }
    );
  }

  onRouteTownDuration_UpdatedSuccessfully(body: any) {
    this.routeTown.duration = this.routeTown.newDurationValue;
    this.routeTown.saveState = SaveState.Saved;
  }

  updateBusRouteTown_Status() {
    console.log('updateBusRouteTown_Status');
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    var requestData = {
      'status': this.routeTown.newStatusValue == true ? 'active' : 'inactive'
    };
    this.busRouteService.updateBusRouteTown(token, this.routeTown.id, requestData)
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        if(data.body.status == 200) {
          this.onRouteTownStatus_UpdatedSuccessfully(data.body);
        } else {
          this.routeTown.newStatusValue = this.routeTown.status;

          if(data.body.ui_message != null){
            NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
          } else if(data.body.developer_message != null){
            NetworkUtil.showSnackBar( this.snackBar, data.body.developer_message);
          } else {
            NetworkUtil.showSnackBar( this.snackBar, 'Unable to update town on this route, please try again');
          }
        }
      }
    );
  }


  updateBusRouteTownETA_Status() {
    console.log('updateBusRouteTownETA_Status');
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    var requestData = {
      'eta_status': this.routeTown.newEtaStatusValue == true ? 'active' : 'inactive'
    };
    this.busRouteService.updateBusRouteTown(token, this.routeTown.id, requestData)
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        if(data.body.status == 200) {
          this.onRouteTownETAStatus_UpdatedSuccessfully(data.body);
        } else {
          this.routeTown.newEtaStatusValue = this.routeTown.etaStatus;

          if(data.body.ui_message != null){
            NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
          } else if(data.body.developer_message != null){
            NetworkUtil.showSnackBar( this.snackBar, data.body.developer_message);
          } else {
            NetworkUtil.showSnackBar( this.snackBar, 'Unable to update town on this route, please try again');
          }
        }
      }
    );
  }


  onRouteTownETAStatus_UpdatedSuccessfully(body: any) {
    this.routeTown.etaStatus = this.routeTown.newEtaStatusValue;

    for(var item of this.routeTown.boardingPoints) {
      item.etaStatus = this.routeTown.etaStatus;
      item.newEtaStatusValue = this.routeTown.etaStatus;
    }

    this.onBusRouteBoardingPointEtaStatusChanged();
  }

  onRouteTownStatus_UpdatedSuccessfully(body: any) {
    this.routeTown.status = this.routeTown.newStatusValue;

    for(var item of this.routeTown.boardingPoints) {
      item.status = this.routeTown.status;
      item.newStatusValue = this.routeTown.status;
    }

    this.onBusRouteBoardingPointStatusChanged();
  }

  _filterTowns(value: string): Town[] {
    const filterValue = value.toLowerCase();

    let data: Town[] = this.allSearchedTowns.filter(option => option.name.toLowerCase().includes(filterValue));
    console.log(data);
    return data;
  }

}
