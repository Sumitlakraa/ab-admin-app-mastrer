import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, finalize, map, Observable, startWith, throwError } from 'rxjs';
import { ProgressDialogComponent } from 'src/app/dialog/progress-dialog/progress-dialog.component';

import { District, State } from 'src/app/model/location';
import { LocationService } from 'src/app/services/location/location.service';
import { NetworkUtil } from 'src/app/util/network-util';

@Component({
  selector: 'app-edit-district',
  templateUrl: './edit-district.component.html',
  styleUrls: ['./edit-district.component.scss']
})
export class EditDistrictComponent implements OnInit {

  formGrp!: FormGroup;
  stateControl!: FormControl;

  allSearchedStates: State[] = [];
  filteredOptions!: Observable<State[]>;

  district!: District;
  userRole!: any;

  constructor(private router: Router, private formBuilder: FormBuilder, private snackBar: MatSnackBar, private location: Location,
    public dialog: MatDialog, private locationService: LocationService) { 
      var navigation = this.router.getCurrentNavigation();
      if(navigation != null) {
        let district = navigation.extras.state as District;
        this.district = district as District;
      }

      if(this.district == null) {
        this.district = {
          name: '',
          state: {
            name: ''
          }
        } as District;
      }

      this.initFormGrp();
      this.getStateList();
  }

  ngOnInit(): void {
    this.filteredOptions = this.stateControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value)),
    );

    let data = JSON.parse(localStorage.getItem('userRole') || '{}');
    this.userRole = data.userRole;
    console.log(this.userRole)
  }

  initFormGrp() {
    this.stateControl = new FormControl({value : this.district.state.name, disabled: this.district.state.id === undefined ? false : true});

    this.formGrp = this.formBuilder.group(
      {
        state : this.stateControl,
        district : new FormControl( this.district.name, [Validators.required]),
      }
    );
  }

  _filter(value: string): State[] {
    console.log(value);
    const filterValue = value.toLowerCase();

    return this.allSearchedStates.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  onStateSelectionChanged(state: State, event: any) {
    if(event.isUserInput) {
      this.district.state = state;
    }
  }

  onDeleteDistrictClick(){
    if(confirm("Are you sure to delete District "+ this.district.name)) {
      this.deleteDistrict();
    }
  }

  deleteDistrict(){

    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    this.locationService.deletedistrict(token, this.district.id )
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        if(data.body.status == 200) {
          this.onDeleteDistrictSuccessful();
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

  onDeleteDistrictSuccessful(){
    NetworkUtil.showSnackBar(this.snackBar, 'District deleted successfully');
  }

  getStateList() {
    if(this.allSearchedStates.length == 0) {
      const dialogRef = this.dialog.open(ProgressDialogComponent);

      let data = JSON.parse(localStorage.getItem('token') || '{}');
      var token = data.token;

      this.locationService.searchState(token, '')
      .pipe(
              catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
        finalize(() => dialogRef.close())
      ).subscribe(
        data => {
          if(data.body.status == 200) {
            this.onGettingStatesListSuccessfully(data.body);
          } else {
            if(data.body.ui_message != null){
              NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
            } else if(data.body.developer_message != null){
              NetworkUtil.showSnackBar(this.snackBar, data.body.developer_message);
            } else {
              NetworkUtil.showSnackBar(this.snackBar, 'Unable to get states data, please try again');
            }
          }
        }
      );
    }
  }

  onGettingStatesListSuccessfully(body: any) {
    this.allSearchedStates = [];

    for(var item of body.data) {
      let state = {
        id: item.id,
        name: item.name
      };

      this.allSearchedStates.push(state);
    }
  }

  onSubmit() {
    if(this.formGrp.invalid || this.district.state.id === undefined) {
      NetworkUtil.showSnackBar(this.snackBar, 'Please complete form');
      return;
    }

    console.log(this.district);
    if(this.district.id == null) {
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

    this.locationService.createDistrict(token, jsonData)
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

    this.locationService.updateDistrict(token, this.district.id as string, jsonData)
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
        'name': value.district, 
        'state_id': this.district.state.id
      };

    return data;
  }

}
