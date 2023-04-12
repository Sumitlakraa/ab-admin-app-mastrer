import { Location } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Loader } from '@googlemaps/js-api-loader';
import { Town } from 'src/app/model/location';
import { BusRouteMappingMetaData, Route, RouteCompleteDetail, RouteMetaData, RouteTown, RouteTownBoardingPoint, SaveState } from 'src/app/model/route';
import { RouteService } from 'src/app/services/route/route.service';

import { ProgressDialogComponent } from 'src/app/dialog/progress-dialog/progress-dialog.component';
import { catchError, retry, finalize } from 'rxjs/operators';
import { NetworkUtil } from 'src/app/util/network-util';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { AddFirstTownInRouteComponent } from 'src/app/dialog/add-first-town-in-route/add-first-town-in-route.component';
import { TownBoardingPoint } from 'src/app/model/location';


@Component({
  selector: 'app-edit-route',
  templateUrl: './edit-route.component.html',
  styleUrls: ['./edit-route.component.scss']
})

export class EditRouteComponent implements OnInit, AfterViewInit {

  @ViewChild('mapContainer', {static: false}) gmap!: ElementRef;

  map!: google.maps.Map;
  mapOptions: google.maps.MapOptions = {
    zoom: 12,
  };
  mapPolyline!: google.maps.Polyline;
  markers: google.maps.Marker[] = [];

  routeMetaData!: RouteMetaData;
  route!: Route;

  selectedRouteMetaData!: RouteMetaData;


  userRole!: any;

  constructor(private router: Router, private RouteService: RouteService,public dialog: MatDialog, private snackBar: MatSnackBar, private formBuilder: FormBuilder, private location: Location) {
    var navigation = this.router.getCurrentNavigation();
    console.log("route towns ############")
    console.log(navigation)
    if(navigation != null) {
      let routeCompleteDetails = navigation.extras.state as RouteCompleteDetail;
      this.routeMetaData = routeCompleteDetails.routeMetaData;
      this.route = routeCompleteDetails.route;




      this.addEmptyTown_IfRouteHasNoTown();
    } else {
      // this.route = this.getEmptyRouteObject();
      // this.addEmptyTown_IfRouteHasNoTown();
    }
  }

  ngOnInit(): void {
    let data = JSON.parse(localStorage.getItem('userRole') || '{}');
    this.userRole = data.userRole;
    this.selectedRouteMetaData = this.routeMetaData
    console.log("hello admin")
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

  onAddFristTownClick(value: any) {
    sessionStorage.setItem('route_id_for_frist_town_add', JSON.stringify(this.routeMetaData.route_id));

    this.addFirstTownInRoute(value)

  }

  addEmptyTown_IfRouteHasNoTown() {
    if(this.route.towns.length == 0) {
      this.route.towns.push({
        town:{
          name: ''
        },
        boardingPoints: [] as RouteTownBoardingPoint[],
        saveState: SaveState.Changed
      } as RouteTown);
    }
  }

  onAddTownClick() {
    this.route.towns.push({
      town:{
        name: ''
      },
      boardingPoints: [] as RouteTownBoardingPoint[],
      saveState: SaveState.Changed
    } as RouteTown);
  }

  onDeleteRouteClick(){
    if(confirm("Are you sure to delete route "+ this.routeMetaData.name)) {
      this.deleteRoute();
    }
  }

  onRouteTownDeleted(routeTown: RouteTown) {
    let deletedItemIndex = this.route.towns.indexOf(routeTown);
    this.route.towns.splice( deletedItemIndex, 1);
    this.drawRoutePath();
  }

  onRouteTownBoardingPointAdded(routeTownBoardingPoint: RouteTownBoardingPoint) {
    this.drawRoutePath();
  }

  onRouteTownBoardingPointDeleted(routeTownBoardingPoint: RouteTownBoardingPoint) {
    this.drawRoutePath();
  }

  onSubmitClick() {
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    var requestData = {
        'route_id': this.routeMetaData.route_id
      };
      
    console.log(requestData);
    this.RouteService.createViaRoute(token, requestData)
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        console.log('onSubmitClick response data ', data.body);

        if(data.body.status == 200) {
          dialogRef.close();  
          this.onSuccessfullySubmitting(data.body);
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

  onSuccessfullySubmitting(body: any) {
    if(body.ui_message != null){
      NetworkUtil.showSnackBar( this.snackBar, body.ui_message);
    } else if(body.developer_message != null) {
      NetworkUtil.showSnackBar(this.snackBar, body.developer_message);
    } else {
      NetworkUtil.showSnackBar(this.snackBar, 'Request was successful.');
    }
  }

  onMapBusClick() {
    let busRouteMappingMetaData = {
      routeMetaData: this.routeMetaData as RouteMetaData,
      bus: {

      },
      startTime: '',
      interval: 0,
      isActive: true
    } as BusRouteMappingMetaData;

    this.router.navigateByUrl('/dashboard/editBusRouteMapping', { state: busRouteMappingMetaData });
  }

  accummalateRoutePath() {
    let pathCoordinates: google.maps.LatLng[] = [];
    for(var town of this.route.towns) {
      for(var townBoardingPoint of town.boardingPoints) {
        if(townBoardingPoint.townBoardingPoint.latitude != null && townBoardingPoint.townBoardingPoint.longitude != null) {
          pathCoordinates.push(new google.maps.LatLng( townBoardingPoint.townBoardingPoint.latitude, townBoardingPoint.townBoardingPoint.longitude));
        }
      }
    }

    // pathCoordinates = [
    //   new google.maps.LatLng( 28.131804267802416, 75.4014405326668),
    //   new google.maps.LatLng( 28.179748559637577, 75.49835375009575),
    //   new google.maps.LatLng( 28.23232015847545, 75.57050025761703),
    // ];

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

    this.drawRoutePath();
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

  deleteRoute(){
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    this.RouteService.deleteRoute(token, this.routeMetaData.route_id )
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        if(data.body.status == 200) {
          this.onDeleteRouteSuccessful();
        } else {
          if(data.body.ui_message != null){
            NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
          } else if(data.body.developer_message != null) {
            NetworkUtil.showSnackBar(this.snackBar, data.body.developer_message);
          } else {
            NetworkUtil.showSnackBar(this.snackBar, 'Unable to delete, please try again');
          }
        }
      }
    );
  }

  onDeleteRouteSuccessful(){
    NetworkUtil.showSnackBar(this.snackBar, 'Route deleted successfully');
    this.location.back();
  }

  addFirstTownInRoute(value: any){
    let button: MatButton = value;
      console.log(button._elementRef.nativeElement.getBoundingClientRect());
  
      let dialogPositionTop: string = button._elementRef.nativeElement.getBoundingClientRect().top + button._elementRef.nativeElement.getBoundingClientRect().height + 5 + 'px';
      let dialogPositionLeft: string = button._elementRef.nativeElement.getBoundingClientRect().left + 'px';
  
      const dialogRef = this.dialog.open(AddFirstTownInRouteComponent, {
        position: { top: dialogPositionTop, left: dialogPositionLeft}
      }).afterClosed().subscribe(town => {
        if(town != null) {
          console.log("1st town added")
          this.router.navigate(['/dashboard/listRoutes']);

            // this.getRouteDetailsFromServer()
        }
      });
    }


  getRouteDetailsFromServer() {
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    this.RouteService.routeDetails(token, this.selectedRouteMetaData.route_id as string)
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
    console.log("hello" + routeCompleteDetails.route)
    // this.location.back()
    console.log(this.router.navigate(['/dashboard/editRoute'], { state: routeCompleteDetails }))
    this.router.navigate(['/dashboard/editRoute'], { state: routeCompleteDetails });
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

}



























// import { Location } from '@angular/common';
// import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
// import { FormBuilder } from '@angular/forms';
// import { Router } from '@angular/router';
// import { Loader } from '@googlemaps/js-api-loader';
// import { Town } from 'src/app/model/location';
// import { BusRouteMappingMetaData, Route, RouteCompleteDetail, RouteMetaData, RouteTown, RouteTownBoardingPoint, SaveState } from 'src/app/model/route';
// import { RouteService } from 'src/app/services/route/route.service';

// import { ProgressDialogComponent } from 'src/app/dialog/progress-dialog/progress-dialog.component';
// import { catchError, retry, finalize } from 'rxjs/operators';
// import { NetworkUtil } from 'src/app/util/network-util';
// import { MatSnackBar } from '@angular/material/snack-bar';
// import { MatDialog } from '@angular/material/dialog';

// @Component({
//   selector: 'app-edit-route',
//   templateUrl: './edit-route.component.html',
//   styleUrls: ['./edit-route.component.scss']
// })

// export class EditRouteComponent implements OnInit, AfterViewInit {

//   @ViewChild('mapContainer', {static: false}) gmap!: ElementRef;

//   map!: google.maps.Map;
//   mapOptions: google.maps.MapOptions = {
//     zoom: 12,
//   };
//   mapPolyline!: google.maps.Polyline;
//   markers: google.maps.Marker[] = [];

//   routeMetaData!: RouteMetaData;
//   route!: Route;
//   // routeTown!: RouteTown;

//   userRole!: any;

//   constructor(private router: Router, private RouteService: RouteService,public dialog: MatDialog, private snackBar: MatSnackBar, private formBuilder: FormBuilder, private location: Location) {
//     var navigation = this.router.getCurrentNavigation();
//     if(navigation != null) {
//       let routeCompleteDetails = navigation.extras.state as RouteCompleteDetail;
//       this.routeMetaData = routeCompleteDetails.routeMetaData;
//       this.route = routeCompleteDetails.route;

//       this.addEmptyTown_IfRouteHasNoTown();
//     } else {
//       // this.route = this.getEmptyRouteObject();
//       // this.addEmptyTown_IfRouteHasNoTown();
//     }
//   }

//   ngOnInit(): void {
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

//   addEmptyTown_IfRouteHasNoTown() {
//     if(this.route.towns.length == 0) {
//       this.route.towns.push({
//         town:{
//           name: ''
//         },
//         boardingPoints: [] as RouteTownBoardingPoint[],
//         saveState: SaveState.Changed
//       } as RouteTown);
//     }
//   }

//   onAddTownClick() {
//     this.route.towns.push({
//       town:{
//         name: ''
//       },
//       boardingPoints: [] as RouteTownBoardingPoint[],
//       saveState: SaveState.Changed
//     } as RouteTown);
//   }

//   onDeleteRouteClick(){
//     if(confirm("Are you sure to delete route "+ this.routeMetaData.name)) {
//       this.deleteRoute();
//     }
//   }

//   onRouteTownDeleted(routeTown: RouteTown) {
//     let deletedItemIndex = this.route.towns.indexOf(routeTown);
//     this.route.towns.splice( deletedItemIndex, 1);
//     this.drawRoutePath();
//   }

//   onRouteTownBoardingPointAdded(routeTownBoardingPoint: RouteTownBoardingPoint) {
//     this.drawRoutePath();
//   }

//   onRouteTownBoardingPointDeleted(routeTownBoardingPoint: RouteTownBoardingPoint) {
//     this.drawRoutePath();
//   }

//   onSubmitClick() {
//     const dialogRef = this.dialog.open(ProgressDialogComponent);

//     let data = JSON.parse(localStorage.getItem('token') || '{}');
//     var token = data.token;

//     var requestData = {
//         'route_id': this.routeMetaData.route_id
//       };
      
//     console.log(requestData);
//     this.RouteService.createViaRoute(token, requestData)
//     .pipe(
//             catchError((err) => {
//         return NetworkUtil.handleErrorForAll2(err, this.snackBar);
//       }),
//       finalize(() => dialogRef.close())
//     ).subscribe(
//       data => {
//         console.log('onSubmitClick response data ', data.body);

//         if(data.body.status == 200) {
//           dialogRef.close();  
//           this.onSuccessfullySubmitting(data.body);
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

//   onSuccessfullySubmitting(body: any) {
//     if(body.ui_message != null){
//       NetworkUtil.showSnackBar( this.snackBar, body.ui_message);
//     } else if(body.developer_message != null) {
//       NetworkUtil.showSnackBar(this.snackBar, body.developer_message);
//     } else {
//       NetworkUtil.showSnackBar(this.snackBar, 'Request was successful.');
//     }
//   }

//   onMapBusClick() {
//     let busRouteMappingMetaData = {
//       routeMetaData: this.routeMetaData as RouteMetaData,
//       bus: {

//       },
//       startTime: '',
//       interval: 0,
//       isActive: true
//     } as BusRouteMappingMetaData;

//     this.router.navigateByUrl('/dashboard/editBusRouteMapping', { state: busRouteMappingMetaData });
//   }

//   accummalateRoutePath() {
//     let pathCoordinates: google.maps.LatLng[] = [];
//     for(var town of this.route.towns) {
//       for(var townBoardingPoint of town.boardingPoints) {
//         if(townBoardingPoint.townBoardingPoint.latitude != null && townBoardingPoint.townBoardingPoint.longitude != null) {
//           pathCoordinates.push(new google.maps.LatLng( townBoardingPoint.townBoardingPoint.latitude, townBoardingPoint.townBoardingPoint.longitude));
//         }
//       }
//     }

//     // pathCoordinates = [
//     //   new google.maps.LatLng( 28.131804267802416, 75.4014405326668),
//     //   new google.maps.LatLng( 28.179748559637577, 75.49835375009575),
//     //   new google.maps.LatLng( 28.23232015847545, 75.57050025761703),
//     // ];

//     return pathCoordinates ;
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

//     this.drawRoutePath();
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
//       for (var town of this.route.towns){
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

//   deleteRoute(){
//     const dialogRef = this.dialog.open(ProgressDialogComponent);

//     let data = JSON.parse(localStorage.getItem('token') || '{}');
//     var token = data.token;

//     this.RouteService.deleteRoute(token, this.routeMetaData.route_id )
//     .pipe(
//             catchError((err) => {
//         return NetworkUtil.handleErrorForAll2(err, this.snackBar);
//       }),
//       finalize(() => dialogRef.close())
//     ).subscribe(
//       data => {
//         if(data.body.status == 200) {
//           this.onDeleteRouteSuccessful();
//         } else {
//           if(data.body.ui_message != null){
//             NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
//           } else if(data.body.developer_message != null) {
//             NetworkUtil.showSnackBar(this.snackBar, data.body.developer_message);
//           } else {
//             NetworkUtil.showSnackBar(this.snackBar, 'Unable to delete, please try again');
//           }
//         }
//       }
//     );
//   }

//   onDeleteRouteSuccessful(){
//     NetworkUtil.showSnackBar(this.snackBar, 'Route deleted successfully');
//     this.location.back();
//   }

// }



