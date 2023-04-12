import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, finalize, map, startWith, Subject, throwError } from 'rxjs';
import { ProgressDialogComponent } from 'src/app/dialog/progress-dialog/progress-dialog.component';
import { TownBoardingPoint } from 'src/app/model/location';
import { RouteTown, RouteTownBoardingPoint, SaveState } from 'src/app/model/route';
import { LocationService } from 'src/app/services/location/location.service';
import { RouteService } from 'src/app/services/route/route.service';
import { CommonUtil } from 'src/app/util/common-util';
import { NetworkUtil } from 'src/app/util/network-util';

@Component({
  selector: 'app-route-town-boardingpoint',
  templateUrl: './route-town-boardingpoint.component.html',
  styleUrls: ['./route-town-boardingpoint.component.scss']
})
export class RouteTownBoardingpointComponent implements OnInit {

  @Input() routeTown!: RouteTown;
  @Input() routeTownBoardingPoint!: RouteTownBoardingPoint;
  @Input() index!: number;

  @Output() deleted = new EventEmitter();
  @Output() added = new EventEmitter();

  allBoardPoints: TownBoardingPoint[] = [];

  townBoardingPointFilteredOptions!: TownBoardingPoint[];
  townBoardingPointFilterSubject = new Subject<TownBoardingPoint[]>();

  userRole!: any;

  constructor(private router: Router, private snackBar: MatSnackBar, private locationService: LocationService, private routeService: RouteService,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    if(this.routeTownBoardingPoint.id == undefined) {
      this.getTownBoardPointList(this.routeTown.town.id);
      console.log(this.routeTownBoardingPoint);
    }

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
    if (event.isUserInput) { 
      this.routeTownBoardingPoint.townBoardingPoint = CommonUtil.deepCopy(boardingPoint);
    }
  }

  onKeyUpEvent(event: any) {
    this.townBoardingPointFilterSubject.next(event.target.value);
  }

  _filterTownBoardingPoints(value: string): TownBoardingPoint[] {
    const filterValue = value.toLowerCase();

    let data: TownBoardingPoint[] = this.allBoardPoints.filter(option => option.name.toLowerCase().includes(filterValue));
    console.log(data);
    return data;
  }

  getTownBoardPointList(townId: string) {
    console.log('getTownBoardPointList');
    if(this.allBoardPoints.length == 0) {
      // const dialogRef = this.dialog.open(ProgressDialogComponent);

      let data = JSON.parse(localStorage.getItem('token') || '{}');
      var token = data.token;

      this.locationService.searchTownStoppage(token, townId, '')
      .pipe(
              catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
        // finalize(() => dialogRef.close())
      ).subscribe(
        data => {
          if(data.body.status == 200) {
            this.onGettingTownBoardingPointListSuccessfully(data.body);
          } else {
            if(data.body.ui_message != null){
              NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
            } else if(data.body.developer_message != null){
              NetworkUtil.showSnackBar( this.snackBar, data.body.developer_message);
            } else {
              NetworkUtil.showSnackBar( this.snackBar, 'Unable to get town boarding points data, please try again');
            }
          }
        }
      );
    }
  }

  onGettingTownBoardingPointListSuccessfully(data: any) {
    this.allBoardPoints = [];

    for(var item of data.data) {
      let boardingPoint = {
        id: item.id,
        name: item.name,
        latitude: item.latitude,
        longitude: item.longitude,
        town : {
          name: '',
          district: {
            name: '',
            state: {
              name: ''
            }
          }
        }
      };

      this.allBoardPoints.push(boardingPoint as TownBoardingPoint);
    }

    console.log(this.allBoardPoints);
  }

  onDeleteClick_ForBoardingPoint(){
    if(confirm("Are you sure to delete route bus-adda:- "+ this.routeTownBoardingPoint.townBoardingPoint.name)) {
      this.onDeleteRouteBoardingPointClick();
    }
  }

  onDeleteRouteBoardingPointClick() {
    if(this.routeTownBoardingPoint.saveState === 'Saved') {
      this.requestForDeletion_RouteTownBoardingPoint();
    } else {
      this.deleted.emit(this.routeTownBoardingPoint);
    }
  }

  onSaveOrUpdateClick_ForBoardingPoint() {
    if(this.routeTownBoardingPoint.id === undefined) {
      this.createRouteTownBoardingPoint();
    } else {
      this.updateRouteTownBoardingPoint();
    }
  }

  createRouteTownBoardingPoint() {
    console.log('createRouteTownBoardingPoint');
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    var requestData = {
      'route_town_id': this.routeTown.id,
      'town_stoppage_id': this.routeTownBoardingPoint.townBoardingPoint.id,
      'duration': this.routeTownBoardingPoint.newDurationValue
    };
    this.routeService.createRouteTownBoardingPoint(token, requestData)
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        if(data.body.status == 200) {
          this.onRouteTownBoardingPointCreatedSuccessfully(data.body);
        } else {
          if(data.body.ui_message != null){
            NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
          } else if(data.body.developer_message != null){
            NetworkUtil.showSnackBar( this.snackBar, data.body.developer_message);
          } else {
            NetworkUtil.showSnackBar( this.snackBar, 'Unable to create town-boarding-point on this route, please try again');
          }
        }
      }
    );
  }

  onRouteTownBoardingPointCreatedSuccessfully(body: any) {
    this.routeTownBoardingPoint.id = body.data.id;
    this.routeTownBoardingPoint.duration = this.routeTownBoardingPoint.newDurationValue;
    this.routeTownBoardingPoint.saveState = SaveState.Saved;

    this.added.emit(this.routeTownBoardingPoint);
  }

  updateRouteTownBoardingPoint() {
    console.log('updateRouteTownBoardingPoint');
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    var requestData = {
      'duration': this.routeTownBoardingPoint.newDurationValue
    };
    this.routeService.updateRouteTownBoardingPoint(token, this.routeTownBoardingPoint.id, requestData)
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

  requestForDeletion_RouteTownBoardingPoint() {
    console.log('requestForDeletion_RouteTownBoardingPoint');
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    var requestData = {
      'status': "inactive"
    };
    this.routeService.updateRouteTownBoardingPoint(token, this.routeTownBoardingPoint.id, requestData)
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        if(data.body.status == 200) {
          this.onRequestForDeletion_OnRouteTownBoardingPointSuccessfully(data.body);
        } else {
          if(data.body.ui_message != null) {
            NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
          } else if(data.body.developer_message != null) {
            NetworkUtil.showSnackBar( this.snackBar, data.body.developer_message);
          } else {
            NetworkUtil.showSnackBar( this.snackBar, 'Unable to delete town-boarding-point on this route, please try again');
          }
        }
      }
    );
  }

  onRequestForDeletion_OnRouteTownBoardingPointSuccessfully(body: any) {
    this.deleted.emit(this.routeTownBoardingPoint);
  }

}
