import { HttpErrorResponse } from '@angular/common/http';
import { Location } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Loader } from '@googlemaps/js-api-loader';
import { catchError, finalize, throwError } from 'rxjs';
import { ProgressDialogComponent } from 'src/app/dialog/progress-dialog/progress-dialog.component';
import { Town, TownBoardingPoint } from 'src/app/model/location';
import { BusRouteMappingMetaData, RouteMetaData, RouteTown, RouteTownBoardingPoint, SaveState, Route } from 'src/app/model/route';
import { BusRouteService } from 'src/app/services/bus-route/bus-route.service';
import { NetworkUtil } from 'src/app/util/network-util';

@Component({
  selector: 'app-edit-bus-route',
  templateUrl: './edit-bus-route.component.html',
  styleUrls: ['./edit-bus-route.component.scss']
})
export class EditBusRouteComponent implements OnInit, AfterViewInit {

  @ViewChild('mapContainer', {static: false}) gmap!: ElementRef;

  map!: google.maps.Map;
  mapOptions: google.maps.MapOptions = {
    zoom: 12,
  };
  mapPolyline!: google.maps.Polyline;
  markers: google.maps.Marker[] = [];

  busRouteMappingMetaData!: BusRouteMappingMetaData;
  busRouteDetails!: Route;

  userRole!: any;

  constructor(private router: Router, private busRouteService: BusRouteService, private location: Location, public dialog: MatDialog,
    private snackBar: MatSnackBar) { 
    var navigation = this.router.getCurrentNavigation();
    if(navigation != null) {
      let busRouteMappingMetaData = navigation.extras.state as BusRouteMappingMetaData;
      this.busRouteMappingMetaData = busRouteMappingMetaData as BusRouteMappingMetaData;
    }

    if(this.busRouteMappingMetaData == null) {
      this.busRouteMappingMetaData = {
        routeMetaData: {
          
        } as RouteMetaData,
        bus: {
          
        },
        startTime: '',
        interval: 0,
        isActive: true
      } as BusRouteMappingMetaData;
    }
  }

  ngOnInit(): void {
    if(this.busRouteMappingMetaData.id != null) {
      this.getRouteDetailsFromServer();
    }

    let data = JSON.parse(localStorage.getItem('userRole') || '{}');
    this.userRole = data.userRole;
    console.log(this.userRole)
  }

  ngAfterViewInit() {
    let loader = new Loader({
      apiKey: 'AIzaSyDprrtJkzdEyPhVbxVQkt4Ai51JnmM_7uE'
    })

    loader.load().then(() => {
      this.initAndloadMap();
    })
  }

  nextPage() {
    this.router.navigateByUrl('/dashboard/listViaRoute', { state: this.busRouteMappingMetaData });
  }

  requestBusRouteDetails(busRouteMappingMetaData: BusRouteMappingMetaData) {
    this.busRouteMappingMetaData = busRouteMappingMetaData;
    this.getRouteDetailsFromServer();
  }

  onBusRouteTownBoardingPointStatusChanged() {
   this.drawRoutePath();
  }

  onDeleteBusRouteMappingClick(){
    if(confirm("Are you sure to delete bus route mapping  "+ this.busRouteMappingMetaData.routeMetaData.name + ' bus no. - '+ this.busRouteMappingMetaData.bus.number +' at ' + this.busRouteMappingMetaData.startTime)) {
      this.deleteBusRouteMapping();
    }
  }

  deleteBusRouteMapping(){
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    this.busRouteService.deleteBusRouteMapping(token, this.busRouteMappingMetaData.id )
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        if(data.body.status == 200) {
          this.onSuccessfullyDeleted();
        } else {
          if(data.body.ui_message != null){
            NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
          } else if(data.body.developer_message != null) {
            NetworkUtil.showSnackBar(this.snackBar, data.body.developer_message);
          } else {
            NetworkUtil.showSnackBar(this.snackBar, 'Unable to delete, please try again');
          }

          // this.location.back();
        }
      }
    );
  }

  onSuccessfullyDeleted(){
    NetworkUtil.showSnackBar(this.snackBar, 'Bus Route Mapping deleted successfully');
    this.location.back();
  }

  getRouteDetailsFromServer() {
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    var requestData = {
        'bus_route_id': this.busRouteMappingMetaData.id, 
      };
      
    console.log(requestData);
    this.busRouteService.routeDetails(token, requestData)
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

    this.busRouteDetails = route;
    this.drawRoutePath();
    console.log(this.busRouteDetails);
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
      saveState: SaveState.Saved,
      boardingPoints: this.convertJsonToObject_BoardingPoints(item.bus_route_town_stoppages),
      status: item.status == 'active',

      etaStatus: item.eta_status == 'active',
      newEtaStatusValue : item.eta_status =='active',

      newDurationValue: item.duration,
      newStatusValue: item.status == 'active'
    } as RouteTown

    return routeTown;
  }

  convertJsonToObject_BoardingPoints(stoppages: any) {
    let data : RouteTownBoardingPoint[] = [];

    for(var item of stoppages) {
      data.push({
        id: item.id,
        townBoardingPoint: {
          id: item.route_town_stoppage.id,
          name: item.route_town_stoppage.town_stoppage.name,
          latitude: item.route_town_stoppage.town_stoppage.latitude,
          longitude: item.route_town_stoppage.town_stoppage.longitude,
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
        saveState: SaveState.Saved,
        status: item.status == 'active',
        etaStatus: item.eta_status == 'active',
        newEtaStatusValue : item.eta_status =='active',
        distance: item.distance,
    
        newDurationValue: item.duration,
        newDistanceValue: item.distance,
        newStatusValue: item.status == 'active'
      });
    }

    return data;
  }

  accummalateRoutePath() {
    let pathCoordinates: google.maps.LatLng[] = [];
    for(var town of this.busRouteDetails.towns) {
      for(var townBoardingPoint of town.boardingPoints) {
        if(townBoardingPoint.townBoardingPoint.latitude != null && townBoardingPoint.townBoardingPoint.longitude != null && townBoardingPoint.status == true) {
          pathCoordinates.push(new google.maps.LatLng( townBoardingPoint.townBoardingPoint.latitude, townBoardingPoint.townBoardingPoint.longitude));
        }
      }
    }

    return pathCoordinates;
  }

  initAndloadMap() {
    const location = new google.maps.LatLng( 28.61641300731585, 77.20925774636052);
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
  }

  drawRoutePath() {
    let pathCoordinates = this.accummalateRoutePath();

    this.clearMapPolyline();
    this.addPolyline(pathCoordinates);

    this.clearMarkers();
    this.addMarkers(pathCoordinates);

    this.adjustMapBound(pathCoordinates);
  }

  adjustMapBound(pathCoordinates: google.maps.LatLng[]) {
    const bounds = new google.maps.LatLngBounds();

    for(var coordinate of pathCoordinates) {
      bounds.extend(coordinate);
    }

    this.map.fitBounds(bounds);
  }

  addMarkers(pathCoordinates: google.maps.LatLng[]) {
    let town_index = 1
    for(var coordinate of pathCoordinates) {
      if(town_index == 1){
        this.addFirstMarker(coordinate);
      }else{
        this.addMarker(coordinate);
      }
      town_index = town_index + 1
    }
  }

  addMarker(location: google.maps.LatLng) {
    const image = "../assets/img/marker.svg";

    const marker = new google.maps.Marker({
      position: location,
      map: this.map,
      icon: image,
    });
    this.markers.push(marker);
  }

  addFirstMarker(location: google.maps.LatLng) {
    const image = "../assets/img/green_mark.svg";

    const marker = new google.maps.Marker({
      position: location,
      map: this.map,
      icon: image,
    });
    this.markers.push(marker);
  }


  removeMarker(marker: google.maps.Marker) {
    marker.setMap(null);
  }

  clearMarkers() {
    this.markers.forEach((marker) => {
      this.removeMarker(marker);
    });
    this.markers = [];
  }

  addPolyline(pathCoordinates: google.maps.LatLng[]) {
    this.mapPolyline.setPath(pathCoordinates);
  }

  clearMapPolyline() {
    this.mapPolyline.setPath([]);
  }

}


































// import { HttpErrorResponse } from '@angular/common/http';
// import { Location } from '@angular/common';
// import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
// import { MatDialog } from '@angular/material/dialog';
// import { MatSnackBar } from '@angular/material/snack-bar';
// import { Router } from '@angular/router';
// import { Loader } from '@googlemaps/js-api-loader';
// import { catchError, finalize, throwError } from 'rxjs';
// import { ProgressDialogComponent } from 'src/app/dialog/progress-dialog/progress-dialog.component';
// import { Town, TownBoardingPoint } from 'src/app/model/location';
// import { BusRouteMappingMetaData, RouteMetaData, RouteTown, RouteTownBoardingPoint, SaveState, Route } from 'src/app/model/route';
// import { BusRouteService } from 'src/app/services/bus-route/bus-route.service';
// import { NetworkUtil } from 'src/app/util/network-util';

// @Component({
//   selector: 'app-edit-bus-route',
//   templateUrl: './edit-bus-route.component.html',
//   styleUrls: ['./edit-bus-route.component.scss']
// })
// export class EditBusRouteComponent implements OnInit, AfterViewInit {

//   @ViewChild('mapContainer', {static: false}) gmap!: ElementRef;

//   map!: google.maps.Map;
//   mapOptions: google.maps.MapOptions = {
//     zoom: 12,
//   };
//   mapPolyline!: google.maps.Polyline;
//   markers: google.maps.Marker[] = [];

//   busRouteMappingMetaData!: BusRouteMappingMetaData;
//   busRouteDetails!: Route;

//   userRole!: any;

//   constructor(private router: Router, private busRouteService: BusRouteService, private location: Location, public dialog: MatDialog,
//     private snackBar: MatSnackBar) { 
//     var navigation = this.router.getCurrentNavigation();
//     if(navigation != null) {
//       let busRouteMappingMetaData = navigation.extras.state as BusRouteMappingMetaData;
//       this.busRouteMappingMetaData = busRouteMappingMetaData as BusRouteMappingMetaData;
//     }

//     if(this.busRouteMappingMetaData == null) {
//       this.busRouteMappingMetaData = {
//         routeMetaData: {
          
//         } as RouteMetaData,
//         bus: {
          
//         },
//         startTime: '',
//         interval: 0,
//         isActive: true
//       } as BusRouteMappingMetaData;
//     }
//   }

//   ngOnInit(): void {
//     if(this.busRouteMappingMetaData.id != null) {
//       this.getRouteDetailsFromServer();
//     }

//     let data = JSON.parse(localStorage.getItem('userRole') || '{}');
//     this.userRole = data.userRole;
//     console.log(this.userRole)
//   }

//   ngAfterViewInit() {
//     let loader = new Loader({
//       apiKey: 'AIzaSyDprrtJkzdEyPhVbxVQkt4Ai51JnmM_7uE'
//     })

//     loader.load().then(() => {
//       this.initAndloadMap();
//     })
//   }

//   nextPage() {
//     this.router.navigateByUrl('/dashboard/listViaRoute', { state: this.busRouteMappingMetaData });
//   }

//   requestBusRouteDetails(busRouteMappingMetaData: BusRouteMappingMetaData) {
//     this.busRouteMappingMetaData = busRouteMappingMetaData;
//     this.getRouteDetailsFromServer();
//   }

//   onBusRouteTownBoardingPointStatusChanged() {
//    this.drawRoutePath();
//   }

//   onDeleteBusRouteMappingClick(){
//     if(confirm("Are you sure to delete bus route mapping  "+ this.busRouteMappingMetaData.routeMetaData.name + ' bus no. - '+ this.busRouteMappingMetaData.bus.number +' at ' + this.busRouteMappingMetaData.startTime)) {
//       this.deleteBusRouteMapping();
//     }
//   }

//   deleteBusRouteMapping(){
//     const dialogRef = this.dialog.open(ProgressDialogComponent);

//     let data = JSON.parse(localStorage.getItem('token') || '{}');
//     var token = data.token;

//     this.busRouteService.deleteBusRouteMapping(token, this.busRouteMappingMetaData.id )
//     .pipe(
//             catchError((err) => {
//         return NetworkUtil.handleErrorForAll2(err, this.snackBar);
//       }),
//       finalize(() => dialogRef.close())
//     ).subscribe(
//       data => {
//         if(data.body.status == 200) {
//           this.onSuccessfullyDeleted();
//         } else {
//           if(data.body.ui_message != null){
//             NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
//           } else if(data.body.developer_message != null) {
//             NetworkUtil.showSnackBar(this.snackBar, data.body.developer_message);
//           } else {
//             NetworkUtil.showSnackBar(this.snackBar, 'Unable to delete, please try again');
//           }

//           // this.location.back();
//         }
//       }
//     );
//   }

//   onSuccessfullyDeleted(){
//     NetworkUtil.showSnackBar(this.snackBar, 'Bus Route Mapping deleted successfully');
//     this.location.back();
//   }

//   getRouteDetailsFromServer() {
//     const dialogRef = this.dialog.open(ProgressDialogComponent);

//     let data = JSON.parse(localStorage.getItem('token') || '{}');
//     var token = data.token;

//     var requestData = {
//         'bus_route_id': this.busRouteMappingMetaData.id, 
//       };
      
//     console.log(requestData);
//     this.busRouteService.routeDetails(token, requestData)
//     .pipe(
//             catchError((err) => {
//         return NetworkUtil.handleErrorForAll2(err, this.snackBar);
//       }),
//       finalize(() => dialogRef.close())
//     ).subscribe(
//       data => {
//         console.log('getRouteDetailsFromServer response data ', data.body);

//         if(data.body.status == 200) {
//           dialogRef.close();  
//           this.onSuccessfullyGettingRouteDetails(data.body);
//         } else {
//           if(data.body.ui_message != null){
//             NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
//           } else if(data.body.developer_message != null) {
//             NetworkUtil.showSnackBar(this.snackBar, data.body.developer_message);
//           } else {
//             NetworkUtil.showSnackBar(this.snackBar, 'Unable to retrieve data, please try again');
//           }
//         }
//       }
//     );
//   }

//   onSuccessfullyGettingRouteDetails(body: any) {
//     let route: Route = {
//       towns: []
//     };

//     for(var item of body.data) {
//       let routeTown: RouteTown = this.convertJsonToObject_RouteTown(item);
//       route.towns.push(routeTown);
//     }

//     this.busRouteDetails = route;
//     this.drawRoutePath();
//     console.log(this.busRouteDetails);
//   }

//   convertJsonToObject_RouteTown(item: any) {
//     let routeTown: RouteTown = {
//       id: item.id,
//       town: {
//         id: item.town.id,
//         name: item.town.name,
//         district: {
//           id: item.town.district.id,
//           name: item.town.district.name,
//           state: {
//             id: item.town.district.state.id,
//             name: item.town.district.state.name
//           }
//         }
//       } as Town,
//       duration: item.duration,
//       saveState: SaveState.Saved,
//       boardingPoints: this.convertJsonToObject_BoardingPoints(item.bus_route_town_stoppages),
//       status: item.status == 'active',

//       newDurationValue: item.duration,
//       newStatusValue: item.status == 'active'
//     } as RouteTown

//     return routeTown;
//   }

//   convertJsonToObject_BoardingPoints(stoppages: any) {
//     let data : RouteTownBoardingPoint[] = [];

//     for(var item of stoppages) {
//       data.push({
//         id: item.id,
//         townBoardingPoint: {
//           id: item.route_town_stoppage.id,
//           name: item.route_town_stoppage.town_stoppage.name,
//           latitude: item.route_town_stoppage.town_stoppage.latitude,
//           longitude: item.route_town_stoppage.town_stoppage.longitude,
//           town: {
//             name: '',
//             district: {
//               name: '',
//               state: {
//                 name: ''
//               }
//             }
//           }
//         } as TownBoardingPoint,
//         duration: item.duration,
//         saveState: SaveState.Saved,
//         status: item.status == 'active',
//         distance: item.distance,
    
//         newDurationValue: item.duration,
//         newDistanceValue: item.distance,
//         newStatusValue: item.status == 'active'
//       });
//     }

//     return data;
//   }

//   accummalateRoutePath() {
//     let pathCoordinates: google.maps.LatLng[] = [];
//     for(var town of this.busRouteDetails.towns) {
//       for(var townBoardingPoint of town.boardingPoints) {
//         if(townBoardingPoint.townBoardingPoint.latitude != null && townBoardingPoint.townBoardingPoint.longitude != null && townBoardingPoint.status == true) {
//           pathCoordinates.push(new google.maps.LatLng( townBoardingPoint.townBoardingPoint.latitude, townBoardingPoint.townBoardingPoint.longitude));
//         }
//       }
//     }

//     return pathCoordinates;
//   }

//   initAndloadMap() {
//     const location = new google.maps.LatLng( 28.61641300731585, 77.20925774636052);
//     this.mapOptions.center = location;

//     this.map = new google.maps.Map(this.gmap.nativeElement, this.mapOptions);

//     this.mapPolyline = new google.maps.Polyline({
//       path: [],
//       geodesic: true,
//       strokeColor: "#2FA4FF",
//       strokeOpacity: 1.0,
//       strokeWeight: 6,
//     });
//     this.mapPolyline.setMap(this.map);
//   }

//   drawRoutePath() {
//     let pathCoordinates = this.accummalateRoutePath();

//     this.clearMapPolyline();
//     this.addPolyline(pathCoordinates);

//     this.clearMarkers();
//     this.addMarkers(pathCoordinates);

//     this.adjustMapBound(pathCoordinates);
//   }

//   adjustMapBound(pathCoordinates: google.maps.LatLng[]) {
//     const bounds = new google.maps.LatLngBounds();

//     for(var coordinate of pathCoordinates) {
//       bounds.extend(coordinate);
//     }

//     this.map.fitBounds(bounds);
//   }



//   addMarkers(pathCoordinates: google.maps.LatLng[]) {
//     let i = 0
//     for(var coordinate of pathCoordinates) {
      
//       let towns: string[] =  [];
//       let boardingPoints: string[] = [];
//       let townWithBoardingPoint: string[] = [];
//       i = i+1
//       for (var town of this.busRouteDetails.towns){
//         for(var townBoardingPoint of town.boardingPoints) {
//           boardingPoints.push(townBoardingPoint.townBoardingPoint.name)
//           towns.push(town.town.name)
//           townWithBoardingPoint.push(town.town.name + ' - ' + townBoardingPoint.townBoardingPoint.name)

//       }


//       this.addMarker(coordinate, townWithBoardingPoint[i-1]);
//      }
//     }
//   }

//   addMarker(location: google.maps.LatLng, town:any) {
//     const image = "../assets/img/marker.svg";

//     const marker = new google.maps.Marker({
//       position: location,
//       map: this.map,
//       icon: image,
//       label: town,
//       title: town 
//     });
//     this.markers.push(marker);
//   }

//   removeMarker(marker: google.maps.Marker) {
//     marker.setMap(null);
//   }

//   clearMarkers() {
//     this.markers.forEach((marker) => {
//       this.removeMarker(marker);
//     });
//     this.markers = [];
//   }

//   addPolyline(pathCoordinates: google.maps.LatLng[]) {
//     this.mapPolyline.setPath(pathCoordinates);
//   }

//   clearMapPolyline() {
//     this.mapPolyline.setPath([]);
//   }

// }
