import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, finalize, map, startWith, Subject, throwError } from 'rxjs';
import { ProgressDialogComponent } from 'src/app/dialog/progress-dialog/progress-dialog.component';
import { TownBoardingPoint } from 'src/app/model/location';
import { RouteTown, RouteTownBoardingPoint, SaveState } from 'src/app/model/route';
import { BusRouteService } from 'src/app/services/bus-route/bus-route.service';
import { LocationService } from 'src/app/services/location/location.service';
import { CommonUtil } from 'src/app/util/common-util';
import { NetworkUtil } from 'src/app/util/network-util';

@Component({
  selector: 'app-bus-route-town-boardingpoint',
  templateUrl: './bus-route-town-boardingpoint.component.html',
  styleUrls: ['./bus-route-town-boardingpoint.component.scss']
})
export class BusRouteTownBoardingpointComponent implements OnInit {

  @Input() routeTown!: RouteTown;
  @Input() routeTownBoardingPoint!: RouteTownBoardingPoint;
  @Input() index!: number;  

  @Output() statusChanged = new EventEmitter();

  allBoardPoints: TownBoardingPoint[] = [];

  townBoardingPointFilteredOptions!: TownBoardingPoint[];
  townBoardingPointFilterSubject = new Subject<TownBoardingPoint[]>();

  userRole!: any;

  constructor(private router: Router, private snackBar: MatSnackBar, private locationService: LocationService, 
    private busRouteService: BusRouteService, private dialog: MatDialog) { }

  ngOnInit(): void {
    // this.getTownBoardPointList(this.routeTown.id);
    // console.log(this.routeTownBoardingPoint);

    this.townBoardingPointFilterSubject.pipe(
      startWith(''),
      map(value => this._filterTownBoardingPoints(value as string)),
    ).subscribe(value => {
      this.townBoardingPointFilteredOptions = value; 
    });

    let data = JSON.parse(localStorage.getItem('userRole') || '{}');
    this.userRole = data.userRole;
    console.log(this.userRole)
  }

  onTownBoardingPointSelectionChanged(boardingPoint: any, event: any) {
    if(event.isUserInput) {
      this.routeTownBoardingPoint.townBoardingPoint = CommonUtil.deepCopy(boardingPoint);
    }
  }

  onKeyUpEvent(event: any) {
    this.townBoardingPointFilterSubject.next(event.target.value);
  }

  toggleEvent(event: any) {
    this.updateBusRouteTownStoppage_Status();
  }

  toggleEventETA(event: any) {
    this.updateBusRouteTownStoppageETA_Status();
  }

  _filterTownBoardingPoints(value: string): TownBoardingPoint[] {
    const filterValue = value.toLowerCase();

    let data: TownBoardingPoint[] = this.allBoardPoints.filter(option => option.name.toLowerCase().includes(filterValue));
    console.log(data);
    return data;
  }

  // getTownBoardPointList(townId: string) {
  //   console.log('getTownBoardPointList');
  //   if(this.allBoardPoints.length == 0) {
  //     // const dialogRef = this.dialog.open(ProgressDialogComponent);

  //     let data = JSON.parse(localStorage.getItem('token') || '{}');
  //     var token = data.token;

  //     this.locationService.searchTownStoppage(token, '', '')
  //     .pipe(
  //       catchError(this.handleErrorForAll),
  //       // finalize(() => dialogRef.close())
  //     ).subscribe(
  //       data => {
  //         if(data.body.status == 200) {
  //           this.onGettingTownBoardingPointListSuccessfully(data.body);
  //         } else {
  //           if(data.body.developer_message != null){
  //             this.showSnackBar(data.body.developer_message);
  //           } else {
  //             this.showSnackBar('Unable to get town boarding points data, please try again');
  //           }
  //         }
  //       }
  //     );
  //   }
  // }

  // onGettingTownBoardingPointListSuccessfully(data: any) {
  //   this.allBoardPoints = [];

  //   for(var item of data.data) {
  //     let boardingPoint = {
  //       id: item.id,
  //       name: item.name,
  //       latitude: item.latitude,
  //       longitude: item.longitude,
  //       town : {
  //         name: '',
  //         district: {
  //           name: '',
  //           state: {
  //             name: ''
  //           }
  //         }
  //       }
  //     };

  //     this.allBoardPoints.push(boardingPoint as TownBoardingPoint);
  //   }

  //   console.log(this.allBoardPoints);
  // }

  onDeleteClick_ForBoardingPoint() {
    //TODO
  }

  onSaveOrUpdateClick_ForBoardingPoint() {
    // if(this.routeTownBoardingPoint.id === undefined) {
    //   this.createRouteTownBoardingPoint();
    // } else {
      this.updateBusRouteTownBoardingPoint();
    // }
  }

  // createRouteTownBoardingPoint() {
  //   console.log('createRouteTownBoardingPoint');
  //   // const dialogRef = this.dialog.open(ProgressDialogComponent);

  //   let data = JSON.parse(localStorage.getItem('token') || '{}');
  //   var token = data.token;

  //   var requestData = {
  //     'route_town_id': this.routeTown.id,
  //     'town_stoppage_id': this.routeTownBoardingPoint.townBoardingPoint.id,
  //     'duration': this.routeTownBoardingPoint.newDurationValue
  //   };
  //   this.routeService.createRouteTownBoardingPoint(token, requestData)
  //   .pipe(
  //     catchError(this.handleErrorForAll),
  //     // finalize(() => dialogRef.close())
  //   ).subscribe(
  //     data => {
  //       if(data.body.status == 200) {
  //         this.onRouteTownBoardingPointCreatedSuccessfully(data.body);
  //       } else {
  //         if(data.body.developer_message != null){
  //           this.showSnackBar(data.body.developer_message);
  //         } else {
  //           this.showSnackBar('Unable to create town-boarding-point on this route, please try again');
  //         }
  //       }
  //     }
  //   );
  // }

  // onRouteTownBoardingPointCreatedSuccessfully(body: any) {
  //   this.routeTownBoardingPoint.id = body.data.id;
  //   this.routeTownBoardingPoint.duration = this.routeTownBoardingPoint.newDurationValue;
  //   this.routeTownBoardingPoint.saveState = SaveState.Saved;
  // }

  updateBusRouteTownBoardingPoint() {
    console.log('updateRouteTownBoardingPoint');
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    var requestData = {
      'duration': this.routeTownBoardingPoint.newDurationValue
    };
    this.busRouteService.updateBusRouteTownBoardingPoint(token, this.routeTownBoardingPoint.id, requestData)
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        if(data.body.status == 200) {
          this.onRouteTownBoardingPointUpdatedSuccessfully(data.body);
        } else {
          if(data.body.ui_message != null){
            NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
          } else if(data.body.developer_message != null){
            NetworkUtil.showSnackBar( this.snackBar, data.body.developer_message);
          } else {
            NetworkUtil.showSnackBar( this.snackBar, 'Unable to update town-boarding-point on this route, please try again');
          }
        }
      }
    );
  }

  onRouteTownBoardingPointUpdatedSuccessfully(body: any) {
    this.routeTownBoardingPoint.duration = this.routeTownBoardingPoint.newDurationValue;
    this.routeTownBoardingPoint.saveState = SaveState.Saved;
  }

  updateBusRouteTownStoppage_Status() {
    console.log('updateBusRouteTownStoppage_Status');
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    var requestData = {
      'status': this.routeTownBoardingPoint.newStatusValue == true ? 'active' : 'inactive'
    };
    this.busRouteService.updateBusRouteTownBoardingPoint(token, this.routeTownBoardingPoint.id, requestData)
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        if(data.body.status == 200) {
          this.onRouteTownStoppageStatus_UpdatedSuccessfully(data.body);
        } else {
          this.routeTownBoardingPoint.newStatusValue = this.routeTownBoardingPoint.status;

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

  updateBusRouteTownStoppageETA_Status() {
    console.log('updateBusRouteTownStoppage_Status');
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    var requestData = {
      'eta_status': this.routeTownBoardingPoint.newEtaStatusValue == true ? 'active' : 'inactive'
    };
    this.busRouteService.updateBusRouteTownBoardingPoint(token, this.routeTownBoardingPoint.id, requestData)
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        if(data.body.status == 200) {
          this.onRouteTownStoppageETAStatus_UpdatedSuccessfully(data.body);
        } else {
          this.routeTownBoardingPoint.newEtaStatusValue = this.routeTownBoardingPoint.etaStatus;

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

  onRouteTownStoppageStatus_UpdatedSuccessfully(body: any) {
    this.routeTownBoardingPoint.status = this.routeTownBoardingPoint.newStatusValue;
    this.statusChanged.emit();
  }

  onRouteTownStoppageETAStatus_UpdatedSuccessfully(body: any) {
    this.routeTownBoardingPoint.etaStatus = this.routeTownBoardingPoint.newEtaStatusValue;
    this.statusChanged.emit();
  }

}
