import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError  } from 'rxjs';
import { catchError, retry, finalize } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ProgressDialogComponent } from 'src/app/dialog/progress-dialog/progress-dialog.component';
import { BusRouteStoppage, EditState, ViaRoute } from 'src/app/model/bus-route';
import { BusRouteService } from 'src/app/services/bus-route/bus-route.service';
import { BusRouteMappingMetaData } from 'src/app/model/route';
import { NetworkUtil } from 'src/app/util/network-util';
import { Loader } from '@googlemaps/js-api-loader';
import { MatButton } from '@angular/material/button';
import { CreateJourneyDialogComponent } from 'src/app/dialog/create-journey-dialog/create-journey-dialog.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-bus-route-stoppage-list',
  templateUrl: './bus-route-stoppage-list.component.html',
  styleUrls: ['./bus-route-stoppage-list.component.scss']
})
export class BusRouteStoppageListComponent implements OnInit, AfterViewInit {

  @ViewChild('mapContainer', {static: false}) gmap!: ElementRef;

  map!: google.maps.Map;
  mapOptions: google.maps.MapOptions = {
    zoom: 12,
  };

  mapPolyline!: google.maps.Polyline;
  marker!: google.maps.Marker;

  busRouteMappingMetaData!: BusRouteMappingMetaData;
  busRouteStoppages: BusRouteStoppage[] = [];

  selectedForEdit_BusRouteStoppage!: BusRouteStoppage|undefined;

  displayedColumns: string[] = ['town', 'bus_adda', 'latitude', 'longitude', 'action'];

  constructor(private router: Router, private busRouteService: BusRouteService, public dialog: MatDialog,
    private snackBar: MatSnackBar, public datepipe: DatePipe) { 
      var navigation = this.router.getCurrentNavigation();
      if(navigation != null) {
        this.busRouteMappingMetaData = navigation.extras.state as BusRouteMappingMetaData;
      }
    }

  ngOnInit(): void {
    this.getBusRouteStoppageListFromServer();
  }

  ngAfterViewInit() {
    let loader = new Loader({
      apiKey: 'AIzaSyDprrtJkzdEyPhVbxVQkt4Ai51JnmM_7uE'
    })

    loader.load().then(() => {
      this.initAndloadMap();
    })
  }

  toggleEvent(busRouteStoppage: BusRouteStoppage) {
    this.updateBusRouteStoppage_LatLong(busRouteStoppage);
  }

  onUpdateLatLongClick(busRouteStoppage: BusRouteStoppage) {
    this.updateBusRouteStoppage_LatLong(busRouteStoppage);
  }

  clickEvent_ToCreateJourneys() {
    this.openCreateJourneyDialog();
  }

  openCreateJourneyDialog() {
    // let button: MatButton = value;
    // console.log(button._elementRef.nativeElement.getBoundingClientRect());

    // let dialogPositionTop: string = button._elementRef.nativeElement.getBoundingClientRect().top + button._elementRef.nativeElement.getBoundingClientRect().height + 5 + 'px';
    // let dialogPositionLeft: string = button._elementRef.nativeElement.getBoundingClientRect().left + 'px';

    const dialogRef = this.dialog.open(CreateJourneyDialogComponent, {
      // position: { top: dialogPositionTop, left: dialogPositionLeft}
    }).afterClosed().subscribe(date => {
      if(date != null) {
        this.createBusRouteJourneys(date);
      }
    });
  }

  createBusRouteJourneys(startDate: string) {
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    let endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    var requestData = {
      'bus_route_id': this.busRouteMappingMetaData.id, 
      'start_date': this.datepipe.transform(startDate, 'yyyy-MM-dd'),
      'end_date': this.datepipe.transform(endDate, 'yyyy-MM-dd')
    };
    this.busRouteService.createJourneys(token, requestData)
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        console.log('createBusRouteJourneys response data ', data.body);

        if(data.body.status == 200) {
          dialogRef.close();  
          this.onSuccessfullyCreatingJourneys(data.body);
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

  onSuccessfullyCreatingJourneys(body: any) {
    if(body.ui_message != null){
      NetworkUtil.showSnackBar( this.snackBar, body.ui_message);
    } else if(body.developer_message != null) {
      NetworkUtil.showSnackBar(this.snackBar, body.developer_message);
    } else {
      NetworkUtil.showSnackBar(this.snackBar, 'Request was successful.');
    }
  }

  onEditLatLongClick(busRouteStoppage: BusRouteStoppage) {
    for(var stoppage of this.busRouteStoppages) {
      if(stoppage.editStatus == 'Changed') {
        NetworkUtil.showSnackBar(this.snackBar, 'You can only edit one item at a time');
        return;
      }
    }

    busRouteStoppage.editStatus = EditState.Changed;
    this.selectedForEdit_BusRouteStoppage = busRouteStoppage;
    this.onTownSelectionChanged();
  }

  onRollbackLatLongClick(busRouteStoppage: BusRouteStoppage) {
    busRouteStoppage.newLatitudeValue = busRouteStoppage.latitude;
    busRouteStoppage.newLongitudeValue = busRouteStoppage.longitude;

    busRouteStoppage.editStatus = EditState.Saved;
    this.selectedForEdit_BusRouteStoppage = undefined;
    this.onTownSelectionChanged();
  }

  onChangeInLatLngValue(event: any) {
    if(this.selectedForEdit_BusRouteStoppage != null) {
      if(this.selectedForEdit_BusRouteStoppage.newLatitudeValue != null && this.selectedForEdit_BusRouteStoppage.newLongitudeValue != null) {
        let location = new google.maps.LatLng( this.selectedForEdit_BusRouteStoppage.newLatitudeValue, this.selectedForEdit_BusRouteStoppage.newLongitudeValue);
        this.addMarker(location);
      } else {
        this.clearMarker();
      }
    } else {
      this.clearMarker();
    }
  }

  nextPage() {
    this.router.navigateByUrl('/dashboard/listBusRouteStoppage', { state: this.busRouteMappingMetaData });
  }

  getBusRouteStoppageListFromServer() {
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    this.busRouteService.busRouteStoppageList(token, this.busRouteMappingMetaData.id)
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        console.log('getBusRouteStoppageListFromServer response data ', data.body);

        if(data.body.status == 200) {
          dialogRef.close();  
          this.onSuccessfullyGettingBusRouteStoppages(data.body);
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

  onSuccessfullyGettingBusRouteStoppages(body: any) {
    this.busRouteStoppages = [];

    for(var item of body.data) {
      try {
        let busRouteStoppage = this.convertJsonToObject(item); 
        if(busRouteStoppage.status == 'active') {
          this.busRouteStoppages.push(busRouteStoppage);
        }
      } catch(error) {
        NetworkUtil.showSnackBar(this.snackBar, error as string);
      }
    }
  }

  convertJsonToObject(item: any) {
    let busRouteStoppage: BusRouteStoppage = {
      id: item.id,
      townName: item.bus_route_town.route_town.town.name,
      townStoppage: {
        name: item.route_town_stoppage.town_stoppage.name,
        latitude: item.route_town_stoppage.town_stoppage.latitude,
        longitude: item.route_town_stoppage.town_stoppage.longitude,
        geoFenceRadius: item.route_town_stoppage.town_stoppage.radius,
      },
      latitude: item.latitude,
      longitude: item.longitude,
      status: item.status,

      newLatitudeValue: item.latitude,
      newLongitudeValue: item.longitude,

      editStatus: EditState.Saved
    };

    return busRouteStoppage;
  }

  updateBusRouteStoppage_LatLong(busRouteStoppage: BusRouteStoppage) {
    console.log('updateViaRoute_Status');
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    var requestData = {
      'latitude' : busRouteStoppage.newLatitudeValue,
      'longitude' : busRouteStoppage.newLongitudeValue
    };
    this.busRouteService.updateBusRouteTownBoardingPoint(token, busRouteStoppage.id, requestData)
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        if(data.body.status == 200) {
          this.onBusRouteLatLong_UpdatedSuccessfully(busRouteStoppage, data.body);
        } else {
          if(data.body.ui_message != null){
            NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
          } else if(data.body.developer_message != null){
            NetworkUtil.showSnackBar(this.snackBar, data.body.developer_message);
          } else {
            NetworkUtil.showSnackBar(this.snackBar, 'Unable to update lat-long, please try again');
          }
        }
      }
    );
  }

  onBusRouteLatLong_UpdatedSuccessfully(busRouteStoppage: BusRouteStoppage, body: any) {
    busRouteStoppage.latitude = busRouteStoppage.newLatitudeValue;
    busRouteStoppage.longitude = busRouteStoppage.newLongitudeValue;

    busRouteStoppage.editStatus = EditState.Saved;
    this.selectedForEdit_BusRouteStoppage = undefined;

    this.onTownSelectionChanged();
    NetworkUtil.showSnackBar(this.snackBar, 'Updated Successfully');
  }

  initAndloadMap() {
    let location = new google.maps.LatLng( 28.61641300731585, 77.20925774636052);
    this.mapOptions.center = location;

    this.map = new google.maps.Map(this.gmap.nativeElement, this.mapOptions);
    this.mapPolyline = new google.maps.Polyline({
      path: [],
      geodesic: true,
      strokeColor: "#2FA4FF",
      strokeOpacity: 1.0,
      strokeWeight: 6,
    });
    this.mapPolyline.setMap(this.map);

    google.maps.event.addListener( this.map, 'click', (event: any) => {
      this.clickedOnMap(event);
    });
  }

  clickedOnMap(event: any) {
    if(this.selectedForEdit_BusRouteStoppage != null) {
      this.addMarker(event.latLng);

      this.selectedForEdit_BusRouteStoppage.newLatitudeValue = event.latLng.lat();
      this.selectedForEdit_BusRouteStoppage.newLongitudeValue = event.latLng.lng();
    }
  }

  onTownSelectionChanged() {
    this.drawPolylineCircleForSelectedTownStoppage();

    if(this.selectedForEdit_BusRouteStoppage != null) {
      if(this.selectedForEdit_BusRouteStoppage.latitude != null && this.selectedForEdit_BusRouteStoppage.longitude != null) {
        let location = new google.maps.LatLng( this.selectedForEdit_BusRouteStoppage.latitude, this.selectedForEdit_BusRouteStoppage.longitude);
        this.addMarker(location);
      } else {
        this.clearMarker();
      }
    } else {
      this.clearMarker();
    }
  }

  drawPolylineCircleForSelectedTownStoppage() {
    this.clearMapPolyline();

    if(this.selectedForEdit_BusRouteStoppage != null) {
      let location = new google.maps.LatLng( this.selectedForEdit_BusRouteStoppage.townStoppage.latitude, this.selectedForEdit_BusRouteStoppage.townStoppage.longitude);
      this.drawPolylineCircleAround(location, this.selectedForEdit_BusRouteStoppage.townStoppage.geoFenceRadius);
    }
  }

  addMarker(latLng: google.maps.LatLng) {
    if(this.marker == null) {
      this.marker = new google.maps.Marker({
        position: latLng,
        map: this.map,
      });
    }
    this.marker.setPosition(latLng);
    this.marker.setMap(this.map);
    this.map.panTo(latLng);
  }

  clearMarker() {
    this.marker.setMap(null);
  }

  drawPolylineCircleAround(latLng: google.maps.LatLng, geoFenceRadius: number) {
    this.clearMapPolyline();
    if(geoFenceRadius != null && latLng.lat() != null && latLng.lng() != null ) {
      this.addPolyline(this.circlePathCoordinates(latLng, geoFenceRadius));
    }
  }

  circlePathCoordinates(latLng: google.maps.LatLng, radius: number) {
    let path: google.maps.LatLng[] = [];

    let angleSteps = 1;
    let angle = 0;
    do {
      path.push(google.maps.geometry.spherical.computeOffset(latLng, radius, angle));
      angle = angle + angleSteps;
    } while(angle <= 360);

    return path;
  }

  addPolyline(pathCoordinates: google.maps.LatLng[]) {
    this.mapPolyline.setPath(pathCoordinates);
  }

  clearMapPolyline() {
    this.mapPolyline.setPath([]);
  }

}