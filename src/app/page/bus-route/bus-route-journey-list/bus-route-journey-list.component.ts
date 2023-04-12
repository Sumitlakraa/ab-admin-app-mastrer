import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, finalize, throwError } from 'rxjs';
import { ProgressDialogComponent } from 'src/app/dialog/progress-dialog/progress-dialog.component';
import { BusRouteJourney } from 'src/app/model/bus-route';
import { BusRouteMappingMetaData } from 'src/app/model/route';
import { BusRouteService } from 'src/app/services/bus-route/bus-route.service';
import { NetworkUtil } from 'src/app/util/network-util';

@Component({
  selector: 'app-bus-route-journey-list',
  templateUrl: './bus-route-journey-list.component.html',
  styleUrls: ['./bus-route-journey-list.component.scss']
})
export class BusRouteJourneyListComponent implements OnInit {

  busRouteMappingMetaData!: BusRouteMappingMetaData;
  displayedColumns: string[] = ['bus_number', 'route_name', 'start_time', 'active'];

  busRouteJourneys: BusRouteJourney[] = [];

  constructor(private router: Router, private busRouteService: BusRouteService, public dialog: MatDialog,
    private snackBar: MatSnackBar) { 
      var navigation = this.router.getCurrentNavigation();
      if(navigation != null) {
        let busRouteMappingMetaData = navigation.extras.state as BusRouteMappingMetaData;
        this.busRouteMappingMetaData = busRouteMappingMetaData as BusRouteMappingMetaData;
      }
  }

  ngOnInit(): void {
    this.getBusRouteJourneyListFromServer();
  }

  toggleEvent(busRouteJourney: BusRouteJourney) {
    this.updateBusRouteJourney_Status(busRouteJourney);
  }

  getBusRouteJourneyListFromServer() {
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    this.busRouteService.busRouteJourneyList(token, this.busRouteMappingMetaData.id)
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        console.log('getBusRouteJourneyListFromServer response data ', data.body);

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
    let busRouteJourneys: BusRouteJourney[]  = [];

    for(var item of body.data) {
      try {
        let busRouteJourney = this.convertJsonToObject(item);
        busRouteJourneys.push(busRouteJourney);
      } catch(error) {
        NetworkUtil.showSnackBar(this.snackBar, error as string);
      }
    }

    this.busRouteJourneys = busRouteJourneys.sort((a, b) => (a.startTime < b.startTime) ? -1 : 1);
    console.log(this.busRouteJourneys);
  }

  convertJsonToObject(item: any) {
    let busRouteJourney: BusRouteJourney = {
      id: item.id,
      busRouteId: item.bus_route,
      
      busNumber: item.bus_number,
      routeName: item.route_name,
      startTime: item.start_time,
      isActive: item.is_active,

      newActiveValue: item.is_active
    };
    return busRouteJourney;
  }

  updateBusRouteJourney_Status(busRouteJourney: BusRouteJourney) {
    console.log('updateBusRouteJourney_Status');
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    var requestData = {
      'is_active': busRouteJourney.newActiveValue
    };
    this.busRouteService.busRouteJourneyUpdate(token, busRouteJourney.id, requestData)
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        if(data.body.status == 200) {
          this.onBusRouteJourneyStatus_UpdatedSuccessfully(data.body);
        } else {
          busRouteJourney.newActiveValue = busRouteJourney.isActive;

          if(data.body.ui_message != null){
            NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
          } else if(data.body.developer_message != null){
            NetworkUtil.showSnackBar(this.snackBar, data.body.developer_message);
          } else {
            NetworkUtil.showSnackBar(this.snackBar, 'Unable to update status, please try again');
          }
        }
      }
    );
  }

  onBusRouteJourneyStatus_UpdatedSuccessfully(body: any) {
    //nothing
  }

}
