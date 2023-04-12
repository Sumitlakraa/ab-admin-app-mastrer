import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, finalize, map, Observable, startWith, Subject, throwError } from 'rxjs';
import { ProgressDialogComponent } from 'src/app/dialog/progress-dialog/progress-dialog.component';
import { Town, TownBoardingPoint } from 'src/app/model/location';
import { RouteMetaData, RouteTown, RouteTownBoardingPoint, SaveState } from 'src/app/model/route';
import { LocationService } from 'src/app/services/location/location.service';
import { RouteService } from 'src/app/services/route/route.service';
import { CommonUtil } from 'src/app/util/common-util';
import { NetworkUtil } from 'src/app/util/network-util';
import { Route} from 'src/app/model/route';

@Component({
  selector: 'app-route-town',
  templateUrl: './route-town.component.html',
  styleUrls: ['./route-town.component.scss']
})
export class RouteTownComponent implements OnInit {

  @Input() routeMetaData!: RouteMetaData
  @Input() routeTown!: RouteTown;
  @Input() index!: number;

  @Output() deleted = new EventEmitter();

  @Output() boardingPointAdded = new EventEmitter();
  @Output() boardingPointDeleted = new EventEmitter();

  allSearchedTowns: Town[] = [];
  // allBoardPoints: TownBoardingPoint[] = [];

  townFilteredOptions!: Town[];
  townFilterSubject = new Subject<Town[]>();
  serachValue!: any;
  serachValueLettersCount!: number;

  userRole!: any;

  constructor(private snackBar: MatSnackBar, private locationService: LocationService, private routeService: RouteService,
    private dialog: MatDialog) { 
  }

  ngOnInit(): void {
    this.townFilterSubject.pipe(
      startWith(''),
      map(value => this._filterTowns(value as string)),
    ).subscribe(value => {
      this.townFilteredOptions = value; 
    });

    // console.log('route-town' + this.routeTown);
    // if(this.routeTown.id == undefined) {
    //   // console.log('route-town request towns');
    //   // if(this.serachValue.length == 3){
    //   //   this.getTownList();
    //   // }
      
    // }

    let data = JSON.parse(localStorage.getItem('userRole') || '{}');
    this.userRole = data.userRole;
    console.log(this.userRole)
  }

  onTownSelectionChanged(town: any, event: any) {
    if (event.isUserInput) { 
      this.routeTown.town = CommonUtil.deepCopy(town);
    }
  }

  onAddBusAddaClick() {
    if(this.routeTown.id === undefined) {
      NetworkUtil.showSnackBar( this.snackBar, 'First add town');
      return;
    }

    this.routeTown.boardingPoints.push({
      townBoardingPoint:{
        name: ''
      },
      saveState: SaveState.Changed
    } as RouteTownBoardingPoint);
  }

  onDeleteClick_ForTown(){
    if(confirm("Are you sure to delete route town:- "+ this.routeTown.town.name)) {
      this.onDeleteRouteTownClick();
    }
  }

  onDeleteRouteTownClick() {
    if(this.routeTown.saveState === 'Saved') {
      this.requestFoDeletion_RouteTown();
    } else {
      this.deleted.emit(this.routeTown);
    }
  }

  onRouteTownBoardingPointAdded(routeTownBoardingPoint: RouteTownBoardingPoint) {
    this.boardingPointAdded.emit(routeTownBoardingPoint);
  }

  onRouteTownBoardingPointDeleted(routeTownBoardingPoint: RouteTownBoardingPoint) {
    let deletedItemIndex = this.routeTown.boardingPoints.indexOf(routeTownBoardingPoint);
    this.routeTown.boardingPoints.splice( deletedItemIndex, 1);

    this.boardingPointDeleted.emit(routeTownBoardingPoint);
  }

  onSaveOrUpdateClick_ForTown() {
    if(this.routeTown.id === undefined) {
      this.createRouteTown();
    } else {
      this.updateRouteTown();
    }
  }

  onKeyUpEvent(event: any) {
    this.serachValueLettersCount = event.target.value.length;
    this.serachValue = event.target.value;

    if(this.serachValueLettersCount != 0 && this.serachValueLettersCount != 1 ){
        this.getTownList();     
    }

    this.townFilterSubject.next(event.target.value);
  }

  getTownList() {
      // const dialogRef = this.dialog.open(ProgressDialogComponent);

      let data = JSON.parse(localStorage.getItem('token') || '{}');
      var token = data.token;

      this.locationService.searchTown(token, undefined, this.serachValue)
      .pipe(
              catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
        // finalize(() => dialogRef.close())
      ).subscribe(
        data => {
          if(data.body.status == 200) {
            this.onGettingTownListSuccessfully(data.body);
          } else {
            if(data.body.ui_message != null){
              NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
            } else if(data.body.developer_message != null){
              NetworkUtil.showSnackBar( this.snackBar, data.body.developer_message);
            } else {
              NetworkUtil.showSnackBar( this.snackBar, 'Unable to get towns data, please try again');
            }
          }
        }
      );
    
  }

  onGettingTownListSuccessfully(data: any) {
    this.allSearchedTowns = [];

    for(var item of data.data) {
      let town = {
        id: item.id,
        name: item.name,
        status: item.status,
        townStoppageCount: item.town_stoppage_count,
        district: {
          id: item.district.id,
          name: item.district.name,
          state: {
            id: item.district.state.id,
            name: item.district.state.name
          }
        }
      };

      this.allSearchedTowns.push(town as Town);
    }
  }

  createRouteTown() {
    console.log('createRouteTown');
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    var requestData = {
      'route_id': this.routeMetaData.route_id,
      'town_id': this.routeTown.town.id,
      'duration': this.routeTown.newDurationValue,
      'distance': this.routeTown.newDistanceValue
    };
    this.routeService.createRouteTown(token, requestData)
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        if(data.body.status == 200) {
          this.onRouteTownCreatedSuccessfully(data.body);
        } else {
          if(data.body.ui_message != null){
            NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
          } else if(data.body.developer_message != null){
            NetworkUtil.showSnackBar( this.snackBar, data.body.developer_message);
          } else {
            NetworkUtil.showSnackBar( this.snackBar, 'Unable to create town on this route, please try again');
          }
        }
      }
    );
  }

  onRouteTownCreatedSuccessfully(body: any) {
    this.routeTown.id = body.data.id;
    this.routeTown.duration = this.routeTown.newDurationValue;
    this.routeTown.distance = this.routeTown.newDistanceValue;
    this.routeTown.saveState = SaveState.Saved;
  }

  updateRouteTown() {
    console.log('updateRouteTown');
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    var requestData = {
      'duration': this.routeTown.newDurationValue,
      'distance': this.routeTown.newDistanceValue
    };
    this.routeService.updateRouteTown(token, this.routeTown.id, requestData)
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        if(data.body.status == 200) {
          this.onRouteTownUpdatedSuccessfully(data.body);
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

  onRouteTownUpdatedSuccessfully(body: any) {
    this.routeTown.duration = this.routeTown.newDurationValue;
    this.routeTown.distance = this.routeTown.newDistanceValue;
    this.routeTown.saveState = SaveState.Saved;
  }

  requestFoDeletion_RouteTown() {
    console.log('requestFoDeletion_RouteTown');
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    var requestData = {
      'status': "inactive"
    };
    this.routeService.updateRouteTown(token, this.routeTown.id, requestData)
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        if(data.body.status == 200) {
          this.onRequestForDeletion_OnRouteTownSuccessfully(data.body);
        } else {
          if(data.body.ui_message != null){
            NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
          } else if(data.body.developer_message != null){
            NetworkUtil.showSnackBar( this.snackBar, data.body.developer_message);
          } else {
            NetworkUtil.showSnackBar( this.snackBar, 'Unable to delete town on this route, please try again');
          }
        }
      }
    );
  }

  onRequestForDeletion_OnRouteTownSuccessfully(body: any) {
    this.deleted.emit(this.routeTown);
  }

  _filterTowns(value: string): Town[] {
    const filterValue = value.toLowerCase();

    let data: Town[] = this.allSearchedTowns.filter(option => option.name.toLowerCase().includes(filterValue));
    console.log(data);
    return data;
  }

}
