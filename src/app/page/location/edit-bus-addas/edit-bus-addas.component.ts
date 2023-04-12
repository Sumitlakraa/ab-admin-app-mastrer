import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Loader } from '@googlemaps/js-api-loader';
import { catchError, finalize, map, Observable, startWith, throwError } from 'rxjs';
import { ProgressDialogComponent } from 'src/app/dialog/progress-dialog/progress-dialog.component';
import { BusesLocationData, Town, TownBoardingPoint } from 'src/app/model/location';
import { LocationService } from 'src/app/services/location/location.service';
import { NetworkUtil } from 'src/app/util/network-util';

@Component({
  selector: 'app-edit-bus-addas',
  templateUrl: './edit-bus-addas.component.html',
  styleUrls: ['./edit-bus-addas.component.scss']
})
export class EditBusAddasComponent implements OnInit, AfterViewInit {

  @ViewChild('mapContainer', {static: false}) gmap!: ElementRef;
  @ViewChild('busAddaInput') searchInput: any;

  @ViewChild('busAddaLat') busAddaLat: any;
  @ViewChild('busAddaLng') busAddaLng: any;

  type_options: string[] = ['major', 'minor'];

  map!: google.maps.Map;
  mapOptions: google.maps.MapOptions = {
    zoom: 12,
  };

  mapPolyline!: google.maps.Polyline;
  mapPolyline2!: google.maps.Polyline;

  path1: google.maps.LatLng[] = [];
  path2: google.maps.LatLng[] = [];


  marker!: google.maps.Marker;

  formGrp!: FormGroup;
  townControl!: FormControl;

  nearByTownBoardingPoints: TownBoardingPoint[] = [];
  busesLocation: BusesLocationData[] = [];



  allSearchedTowns: Town[] = [];
  filteredOptions!: Observable<Town[]>;

  townBoardingPoint!: TownBoardingPoint;
  userRole!: any;
  serachValue!: any;
  serachValueLettersCount!: number;

  constructor(private router: Router, private formBuilder: FormBuilder, private snackBar: MatSnackBar, private location: Location,
    public dialog: MatDialog, private locationService: LocationService) { 
      var navigation = this.router.getCurrentNavigation();
      if(navigation != null) {
        let townBoardingPoint = navigation.extras.state as TownBoardingPoint;
        this.townBoardingPoint = townBoardingPoint as TownBoardingPoint;
      }

      console.log(this.townBoardingPoint);
      if(this.townBoardingPoint == null) {
        this.townBoardingPoint = {
          name: '',
          town : {
            name: '',
            district: {
              name: '',
              state: {
                name: ''
              }
            }
          },
          nameTranslation: {
            
          }
        } as TownBoardingPoint;
      }

      this.initFormGrp();
      
  }

  ngOnInit(): void {
    this.filteredOptions = this.townControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value)),
    );

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

  initFormGrp() {
    this.townControl = new FormControl({value : this.townBoardingPoint.town.name, disabled: this.townBoardingPoint.town.id === undefined ? false : true});

    this.formGrp = this.formBuilder.group(
      {
        town : this.townControl,
        bus_adda : new FormControl( this.townBoardingPoint.name, [Validators.required]),
        bus_adda_hi : new FormControl( this.townBoardingPoint.nameTranslation.hindi, [Validators.required]),
        type : new FormControl( this.townBoardingPoint.type, [Validators.required]),

        latitude : new FormControl( this.townBoardingPoint.latitude, [Validators.required]),
        longitude : new FormControl( this.townBoardingPoint.longitude, [Validators.required]),
        geofence_radius : new FormControl( this.townBoardingPoint.geofenceRadius, [Validators.required]),
      }
    );

    this.formGrp.controls['latitude'].valueChanges.subscribe(() => {
      this.userChangedLatLngValues();
    });
    this.formGrp.controls['longitude'].valueChanges.subscribe(() => {
      this.userChangedLatLngValues();
    });
    this.formGrp.controls['geofence_radius'].valueChanges.subscribe(() => {
      this.userChangedGeoFanceRadius();
    });
  }

  _filter(value: string): Town[] {
    const filterValue = value.toLowerCase();

    return this.allSearchedTowns.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  onStateSelectionChanged(town: Town, event: any) {
    if(event.isUserInput) {
      this.townBoardingPoint.town = town;      
    }
  }

  userChangedLatLngValues() {
    let latitude = this.formGrp.controls['latitude'].value;
    let longitude = this.formGrp.controls['longitude'].value;

    if(latitude != null && longitude != null) {
      this.addMarker(new google.maps.LatLng(latitude, longitude));
    }
  }

  userChangedGeoFanceRadius() {
    let latitude = this.formGrp.controls['latitude'].value;
    let longitude = this.formGrp.controls['longitude'].value;

    if(latitude != null && longitude != null) {
      this.drawPolylineCircleAround(new google.maps.LatLng(latitude, longitude));
    }
    this.clearMapPolyline()
    this.addPolyline(this.path1)
    this.addPolyline2(this.path2)
  }

  onDeleteTownStoppageClick(){
    if(confirm("Are you sure to delete bus adda "+ this.townBoardingPoint.name)) {
      this.deleteTownStoppage();
    }
  }

  onKeyUpEvent(event: any){

    this.serachValueLettersCount = event.target.value.length;
    this.serachValue = event.target.value;

    if(this.serachValueLettersCount != 0 && this.serachValueLettersCount != 1 ){
        this.getTownList();     
    }
  }

  deleteTownStoppage(){
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    this.locationService.deleteTownStoppage(token, this.townBoardingPoint.id )
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        if(data.body.status == 200) {
          this.onDeleteTownStoppageSuccessful();
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

  onDeleteTownStoppageSuccessful(){
    NetworkUtil.showSnackBar(this.snackBar, 'Bus adda deleted successfully');
    this.router.navigateByUrl('/dashboard/listLocations/listBusAdda');
  }
  

  getTownList() {
    // if(this.allSearchedTowns.length == 0) {
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
              NetworkUtil.showSnackBar(this.snackBar, data.body.developer_message);
            } else {
              NetworkUtil.showSnackBar(this.snackBar, 'Unable to get districts data, please try again');
            }
          }
        }
      );
    
  }

  onGettingTownListSuccessfully(body: any) {
    this.allSearchedTowns = [];

    for(var item of body.data) {
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

  onSubmit() {
    if(this.formGrp.invalid || this.townBoardingPoint.town.id === undefined) {
      NetworkUtil.showSnackBar(this.snackBar, 'Please complete form');
      return;
    }

    if(this.townBoardingPoint.id == null) {
      this.createData();
    } else {
      this.updateData();
    }
  }

  createData() {
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    let jsonData = this.createJSONDataFromFormData(this.formGrp.value);

    this.locationService.createTownStoppage(token, jsonData)
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        if(data.body.status == 200) {
          this.onSubmitDataSuccessful(data.body);
        } else {
          if(data.body.ui_message != null){
            NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
          } else if(data.body.developer_message != null){
            NetworkUtil.showSnackBar(this.snackBar, data.body.developer_message);
          } else {
            NetworkUtil.showSnackBar(this.snackBar, 'Unable to submit data, please try again');
          }
        }
      }
    );
  }

  updateData() {
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    let jsonData = this.createJSONDataFromFormData(this.formGrp.value);

    this.locationService.updateTownStoppage(token, this.townBoardingPoint.id as string, jsonData)
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        if(data.body.status == 200) {
          this.onSubmitDataSuccessful(data.body);
        } else {
          if(data.body.ui_message != null){
            NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
          } else if(data.body.developer_message != null) {
            NetworkUtil.showSnackBar(this.snackBar, data.body.developer_message);
          } else {
            NetworkUtil.showSnackBar(this.snackBar, 'Unable to submit data, please try again');
          }
        }
      }
    );
  }

  onSubmitDataSuccessful(data: any) {
    // this.district.id = data.data.bus_id;
    this.location.back();
  }

  createJSONDataFromFormData(value: any) {
    console.log('createJSONDataFromFormData', value);

    var data = {
        'name': value.bus_adda, 
        'town_id': this.townBoardingPoint.town.id,
        'type': value.type,
        'latitude': value.latitude,
        'longitude': value.longitude,
        'radius': value.geofence_radius,
        'name_translation': {
          'hindi': value.bus_adda_hi
        }
      };

    return data;
  }

  initAndloadMap() {
    let location = new google.maps.LatLng( 28.61641300731585, 77.20925774636052);
    if(this.townBoardingPoint.latitude != null && this.townBoardingPoint.longitude != null) {
      location = new google.maps.LatLng( this.townBoardingPoint.latitude, this.townBoardingPoint.longitude);
    }
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

    this.mapPolyline2 = new google.maps.Polyline({
      path: [],
      geodesic: true,
      strokeColor: "#F1F2F4",
      strokeOpacity: 1.0,
      strokeWeight: 7,
    });
    this.mapPolyline2.setMap(this.map);

    this.initAutocomplete();

    if(this.townBoardingPoint.latitude != null && this.townBoardingPoint.longitude != null) {
      this.addMarker(new google.maps.LatLng( this.townBoardingPoint.latitude, this.townBoardingPoint.longitude));
    }

    google.maps.event.addListener( this.map, 'click', (event: any) => {
      this.addMarker(event.latLng);

      this.formGrp.controls['latitude'].setValue(event.latLng.lat());
      this.formGrp.controls['longitude'].setValue(event.latLng.lng());
    });
  }

  addMarker(latLng: google.maps.LatLng) {
    this.path1 = []
    this.path2= []
    this.getNearByTownBoardingPointsListFromServer(latLng.lat(), latLng.lng())
    const image = "../assets/img/green_mark.svg";

    if(this.marker == null) {
      this.marker = new google.maps.Marker({
        position: latLng,
        map: this.map,
        icon: image
      });
    }
    this.marker.setPosition(latLng);
    this.map.panTo(latLng);

    this.drawPolylineCircleAround(latLng);
  }

  drawPolylineCircleAround(latLng: google.maps.LatLng) {
    let geoFenceRadius = this.formGrp.controls['geofence_radius'].value;

    this.clearMapPolyline();
    // if(geoFenceRadius != null && this.marker != null) {
    this.circlePathCoordinates(latLng, geoFenceRadius);
    // }
  }

  circlePathCoordinates(latLng: google.maps.LatLng, radius: number) {
    let path: google.maps.LatLng[] = [];

    let angleSteps = 1;
    let angle = 0;
    do {
      this.path1.push(google.maps.geometry.spherical.computeOffset(latLng, radius, angle));
      if(angle==0){
      this.path2.push(google.maps.geometry.spherical.computeOffset(latLng, radius, angle));

      }

      angle = angle + angleSteps;
    } while(angle <= 360);

    return this.path1;
  }

  addPolyline(pathCoordinates: google.maps.LatLng[]) {
    this.mapPolyline.setPath(pathCoordinates);
    // this.mapPolyline2.setPath(pathCoordinates2);
  }
  addPolyline2(pathCoordinates: google.maps.LatLng[]) {
    this.mapPolyline2.setPath(pathCoordinates);
    // this.mapPolyline2.setPath(pathCoordinates2);
  }

  clearMapPolyline() {
    this.mapPolyline.setPath([]);
    this.mapPolyline2.setPath([]);
  }

  initAutocomplete() {
    console.log('### initAutocomplete');
    // Create the search box and link it to the UI element.
    const input = this.searchInput.nativeElement;
    const searchBox = new google.maps.places.SearchBox(input);

    // this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    this.map.addListener("bounds_changed", () => {
      searchBox.setBounds(this.map.getBounds() as google.maps.LatLngBounds);
    });

    let markers: google.maps.Marker[] = [];

    searchBox.addListener("places_changed", () => {
      const places = searchBox.getPlaces();
  
      if (places?.length == 0) {
        return;
      }
  
      // Clear out the old markers.
      markers.forEach((marker) => {
        marker.setMap(null);
      });
      markers = [];
  
      // For each place, get the icon, name and location.
      const bounds = new google.maps.LatLngBounds();
  
      places?.forEach((place) => {
        if (!place.geometry || !place.geometry.location) {
          console.log("Returned place contains no geometry");
          return;
        }
  
        const icon = {
          url: place.icon as string,
          size: new google.maps.Size(71, 71),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34),
          scaledSize: new google.maps.Size(25, 25),
        };
  
        // Create a marker for each place.
        markers.push(
          new google.maps.Marker({
            // this.map,
            icon,
            title: place.name,
            position: place.geometry.location,
          })
        );
        markers[markers.length-1].setMap(this.map);
  
        if (place.geometry.viewport) {
          // Only geocodes have viewport.
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }

        this.fillForm_OnPlaceSelection(place);
      });
      this.map.fitBounds(bounds);
    });
  }

  fillForm_OnPlaceSelection(place: google.maps.places.PlaceResult) {
    console.log('fillForm_OnPlaceSelection');
    console.log(place);

    // Get each component of the address from the place details,
    // and then fill-in the corresponding field on the form.
    // place.address_components are google.maps.GeocoderAddressComponent objects
    // which are documented at http://goo.gle/3l5i5Mr
    for (const component of place.address_components as google.maps.GeocoderAddressComponent[]) {
      // @ts-ignore remove once typings fixed
      const componentType = component.types[0];

      switch (componentType) {
        case "street_number": {
          // address1 = `${component.long_name} ${address1}`;
          break;
        }

        case "route": {
          this.formGrp.controls['bus_adda'].setValue(component.long_name);
          break;
        }

        case "postal_code": {
          // postcode = `${component.long_name}${postcode}`;
          break;
        }

        case "postal_code_suffix": {
          // postcode = `${postcode}-${component.long_name}`;
          break;
        }

        case "locality":
          // this.formGrp.controls['bus_adda'].setValue(component.long_name);
          break;

        case "administrative_area_level_1": {
          // (document.querySelector("#state") as HTMLInputElement).value =
          //   component.short_name;
          break;
        }

        case "country":
          // (document.querySelector("#country") as HTMLInputElement).value =
          //   component.long_name;
          break;
      }
    }
  }


getNearByTownBoardingPointsListFromServer(lat: any, lng:any) {
  const dialogRef = this.dialog.open(ProgressDialogComponent);

  let data = JSON.parse(localStorage.getItem('token') || '{}');
  var token = data.token;

  this.locationService.nearByTownStoppages(token, lat , lng)
  .pipe(
          catchError((err) => {
      return NetworkUtil.handleErrorForAll2(err, this.snackBar);
    }),
    finalize(() => dialogRef.close())
  ).subscribe(
    data => {
      console.log('getTownBoardingPointsListFromServer response data ', data.body);

      if(data.body.status == 200) {
        dialogRef.close();
        this.onSuccessfullyGettingTownBoardingPoints(data.body);
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

onSuccessfullyGettingTownBoardingPoints(body: any) {
  this.nearByTownBoardingPoints = [];


  for(var item of body.data) {
    try {
      let townBoardingPoint = this.convertJsonToObject(item);
      this.nearByTownBoardingPoints.push(townBoardingPoint as TownBoardingPoint);
    } catch(error) {
      NetworkUtil.showSnackBar(this.snackBar, error as string);
    }
  }


  for(var nearByTownBoardingPoint of this.nearByTownBoardingPoints ){
    let name  = nearByTownBoardingPoint.town.name + " - " + nearByTownBoardingPoint.name
    let radius  = nearByTownBoardingPoint.geofenceRadius
    console.log("55555555555555555555")
    console.log(nearByTownBoardingPoint)

    this.addNearByMarker(radius,name, new google.maps.LatLng( nearByTownBoardingPoint.latitude, nearByTownBoardingPoint.longitude))
  }

  this.addPolyline(this.path1)
  this.addPolyline2(this.path2)

}

convertJsonToObject(item: any) {
  let townBoardingPoint = {
    id: item.id,
    name: item.name,
    latitude: item.latitude,
    longitude: item.longitude,
    status: item.status,
    town: {
      id: item.town.id,
      name: item.town.name,
      status: item.status,
      townStoppageCount: item.town_stoppage_count,
      district: {
        id: item.town.district.id,
        name: item.town.district.name,
        state: {
          id: item.town.district.state.id,
          name: item.town.district.state.name
        }
      }
    },
    type: item.type,

    geofenceRadius: item.radius,
    nameTranslation: item.name_translation,
  };

  return townBoardingPoint;
}

addNearByMarker(radius:any, name: string, latLng: google.maps.LatLng) {
  // if(this.marker == null) {
  const image = "../assets/img/marker.svg";
  this.marker = new google.maps.Marker({
    position: latLng,
    map: this.map,
    icon: image,
    title: name,
    label: name
  });
  // }
  this.marker.setPosition(latLng);
  this.map.panTo(latLng);

  this.drawNearByPolylineCircleAround(radius, latLng);
}

drawNearByPolylineCircleAround(radius:any,latLng: google.maps.LatLng) {
  let geoFenceRadius = radius

  this.clearMapPolyline();
  // if(geoFenceRadius != null && this.marker != null) {
  this.circlePathCoordinates(latLng, geoFenceRadius);
  // }
}

  onCheckBusesClick(){
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;
  
    this.locationService.checkBusesInGeofenceRadius(token, this.townBoardingPoint.id )
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        console.log('getTownBoardingPointsListFromServer response data ', data.body);
  
        if(data.body.status == 200) {
          dialogRef.close();
          this.onSuccessfullyGettingBusesData(data.body);
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

  onSuccessfullyGettingBusesData(body: any) {
    const busesLocationData: BusesLocationData[] = [];

    for (const vehicleNumber in body.data) {
      if (Object.prototype.hasOwnProperty.call(body.data, vehicleNumber)) {
        const locationData = body.data[vehicleNumber][0];
        busesLocationData.push({
          name: vehicleNumber,
          lat: locationData.latitude,
          lng: locationData.longitude,
          date: locationData.servertime
        });
      }
    }
    console.log(busesLocationData)

    for(var bus of busesLocationData ){

        const latlng = new google.maps.LatLng( bus.lat, bus.lng)
        const image = "../assets/img/bus_icon.png";
    
        this.marker = new google.maps.Marker({
          position: latlng,
          map: this.map,
          icon: image,
          title: bus.name + ", "+ bus.date,
          label: bus.name + ", "+ bus.date
          
        });    

      }

    }
   
  }



