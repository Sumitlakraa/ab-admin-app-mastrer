import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Loader } from '@googlemaps/js-api-loader';
import { catchError, finalize, map, Observable, startWith, throwError, timeout } from 'rxjs';
import { ProgressDialogComponent } from 'src/app/dialog/progress-dialog/progress-dialog.component';
import { District, Town } from 'src/app/model/location';
import { LocationService } from 'src/app/services/location/location.service';
import { NetworkUtil } from 'src/app/util/network-util';

@Component({
  selector: 'app-edit-town',
  templateUrl: './edit-town.component.html',
  styleUrls: ['./edit-town.component.scss']
})
export class EditTownComponent implements OnInit, AfterViewInit {

  @ViewChild('mapContainer', {static: false}) gmap!: ElementRef;
  @ViewChild('townInput') searchInput: any;

  type_options: string[] = ['CITY', 'TOWN', 'VILLAGE'];

  map!: google.maps.Map;
  mapOptions: google.maps.MapOptions = {
    zoom: 12,
  };

  formGrp!: FormGroup;
  districtControl!: FormControl;

  serachValue!: any;
  serachValueLettersCount!: number;

  allSearchedDistricts: District[] = [];
  filteredOptions!: Observable<District[]>;

  town!: Town;
  userRole!: any;

  constructor(private router: Router, private formBuilder: FormBuilder, private snackBar: MatSnackBar, private location: Location,
    public dialog: MatDialog, private locationService: LocationService) { 
      var navigation = this.router.getCurrentNavigation();
      if(navigation != null) {
        let town = navigation.extras.state as Town;
        this.town = town as Town;
      }

      if(this.town == null) {
        this.town = {
          name: '',
          district: {
            name: '',
            state: {
              name: ''
            }
          },
          nameTranslation: {

          }
        } as Town;
      }

      this.initFormGrp();
      
  }

  ngOnInit(): void {
    this.filteredOptions = this.districtControl.valueChanges.pipe(
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
    this.districtControl = new FormControl({value : this.town.district.name, disabled: this.town.district.id === undefined ? false : true});

    this.formGrp = this.formBuilder.group(
      {
        district : this.districtControl,
        town : new FormControl( this.town.name, [Validators.required]),
        town_hi : new FormControl( this.town.nameTranslation.hindi, [Validators.required]),
        type : new FormControl( this.town.type, [Validators.required]),
      }
    );
  }

  _filter(value: string): District[] {
    const filterValue = value.toLowerCase();

    return this.allSearchedDistricts.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  onStateSelectionChanged(district: District, event: any) {
    if(event.isUserInput) {
      this.town.district = district;
    }
  }

  onDeleteTownClick(){
    if(confirm("Are you sure to delete Town "+ this.town.name)) {
      this.deleteTown();
    }
  }

  onKeyUpEvent(event: any){

    this.serachValueLettersCount = event.target.value.length;
    this.serachValue = event.target.value;

    if(this.serachValueLettersCount != 0 && this.serachValueLettersCount != 1 ){
       this.getDistrictList();     
    }
  }

  deleteTown(){
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    this.locationService.deleteTown(token, this.town.id )
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        if(data.body.status == 200) {
          this.onDeleteTownSuccessful();
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

  onDeleteTownSuccessful(){
    NetworkUtil.showSnackBar(this.snackBar, 'Town deleted successfully');
  }
  

  getDistrictList() {
    // if(this.allSearchedDistricts.length == 0) {
      // const dialogRef = this.dialog.open(ProgressDialogComponent);

      let data = JSON.parse(localStorage.getItem('token') || '{}');
      var token = data.token;

      this.locationService.searchDistrict(token, '', this.serachValue)
      .pipe(
              catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
        // finalize(() => dialogRef.close())
      ).subscribe(
        data => {
          if(data.body.status == 200) {
            this.onGettingDistrictsListSuccessfully(data.body);
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

  onGettingDistrictsListSuccessfully(body: any) {
    this.allSearchedDistricts = [];

    for(var item of body.data) {
      let district = {
        id: item.id,
        name: item.name,
        state: {
          id: item.id,
          name: item.name
        }
      };

      this.allSearchedDistricts.push(district);
    }
  }

  onSubmit() {
    if(this.formGrp.invalid || this.town.district.id === undefined) {
      NetworkUtil.showSnackBar(this.snackBar, 'Please complete form');
      return;
    }

    if(this.town.id == null) {
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

    this.locationService.createTown(token, jsonData)
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

    this.locationService.updateTown(token, this.town.id as string, jsonData)
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
        'name': value.town, 
        'district_id': this.town.district.id,
        'type': value.type,
        'latitude': value.latitude,
        'longitude': value.longitude,
        'name_translation': {
          'hindi': value.town_hi
        }
      };

    return data;
  }

  initAndloadMap() {
    const location = new google.maps.LatLng( 28.61641300731585, 77.20925774636052);
    this.mapOptions.center = location;

    this.map = new google.maps.Map(this.gmap.nativeElement, this.mapOptions);
    this.initAutocomplete();
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
          // address1 += component.short_name;
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
          this.formGrp.controls['town'].setValue(component.long_name);
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

}
