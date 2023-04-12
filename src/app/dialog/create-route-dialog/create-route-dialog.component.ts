import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse, HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError  } from 'rxjs';
import { catchError, retry, finalize } from 'rxjs/operators';
import { Location } from '@angular/common';
import {map, startWith} from 'rxjs/operators';

import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProgressDialogComponent } from '../../dialog/progress-dialog/progress-dialog.component';

import { LocationService } from 'src/app/services/location/location.service';
import { RouteService } from 'src/app/services/route/route.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Town } from 'src/app/model/location';
import { CommonUtil } from 'src/app/util/common-util';
import { NetworkUtil } from 'src/app/util/network-util';

@Component({
  selector: 'app-create-route-dialog',
  templateUrl: './create-route-dialog.component.html',
  styleUrls: ['./create-route-dialog.component.scss']
})
export class CreateRouteDialogComponent implements OnInit {

  allSearchedTowns: Town[] = [];
  fromTownFilteredOptions!: Observable<Town[]>;
  toTownFilteredOptions!: Observable<Town[]>;

  serachValue!: any;
  serachValueLettersCount!: number;

  formGrp!: FormGroup;
  fromTownControl!: FormControl;
  toTownControl!: FormControl;

  submitData: any = {
    from_town: undefined,
    to_town: undefined,
    via: ''
  };

  constructor(public createDialogRef: MatDialogRef<CreateRouteDialogComponent>, private locationService: LocationService, private routeService: RouteService, 
    private formBuilder: FormBuilder, private snackBar: MatSnackBar, public dialog: MatDialog, private router: Router) { 

    this.initFormGrp();
    // this.getTownList();
  }

  ngOnInit(): void {
    this.fromTownFilteredOptions = this.fromTownControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value)),
    );

    this.toTownFilteredOptions = this.toTownControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value)),
    );
  }

  initFormGrp() {
    this.fromTownControl = new FormControl('');
    this.toTownControl = new FormControl('');

    this.formGrp = this.formBuilder.group(
      {
        from_town : this.fromTownControl,
        to_town : this.toTownControl,
        via : new FormControl('', [Validators.required]),
      }
    );
  }

  _filter(value: string): Town[] {
    const filterValue = value.toLowerCase();

    let data: Town[] = this.allSearchedTowns.filter(option => option.name.toLowerCase().includes(filterValue));
    return data;
  }

  onKeyUpEvent(event: any) {
    this.serachValueLettersCount = event.target.value.length;
    this.serachValue = event.target.value;

    if(this.serachValueLettersCount != 0 && this.serachValueLettersCount != 1  ){
       this.getTownList();   
    }
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
              NetworkUtil.showSnackBar(this.snackBar, 'Unable to get towns data, please try again');
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

    console.log(this.allSearchedTowns);
  }

  onFromTownSelectionChanged(option: any, event: any) {
    if(event.isUserInput) {
      this.submitData.from_town = option.id;
    }
  }

  onToTownSelectionChanged(option: any, event: any) {
    if(event.isUserInput) {
      this.submitData.to_town = option.id;
    }
  }

  onSubmit() {
    if(this.formGrp.invalid || this.submitData.from_town === undefined || this.submitData.to_town === undefined) {
      NetworkUtil.showSnackBar(this.snackBar, 'Please complete form');
      return;
    }

    this.createData();
  }

  createData() {
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    this.submitData.via = this.formGrp.value.via;
    let jsonData = this.createJSONDataFromFormData(this.submitData);

    this.routeService.createRoute(token, jsonData)
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

  onSubmitDataSuccessful(body: any) {
    this.createDialogRef.close(body.data);
  }

  createJSONDataFromFormData(value: any) {
    console.log('createJSONDataFromFormData', value);

    var data = {
        'from_town_id': value.from_town, 
        'to_town_id': value.to_town, 
        'via': value.via
      };

    return data;
  }

}
