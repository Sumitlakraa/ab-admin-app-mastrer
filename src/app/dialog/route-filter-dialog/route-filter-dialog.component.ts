import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, finalize, map, Observable, startWith } from 'rxjs';
import { Bus } from 'src/app/model/bus';
import { BusRouteService } from 'src/app/services/bus-route/bus-route.service';
import { LocationService } from 'src/app/services/location/location.service';
import { RouteService } from 'src/app/services/route/route.service';
import { CommonUtil } from 'src/app/util/common-util';
import { NetworkUtil } from 'src/app/util/network-util';
import { ProgressDialogComponent } from '../progress-dialog/progress-dialog.component';

@Component({
  selector: 'app-route-filter-dialog',
  templateUrl: './route-filter-dialog.component.html',
  styleUrls: ['./route-filter-dialog.component.scss']
})
export class RouteFilterDialogComponent implements OnInit {

  route!: any;

  formGrp!: FormGroup;
  routeControl!: FormControl;

  serachValue!: any;
  serachValueLettersCount!: number;

  allSearchedRoutes: any[] = [];
  filteredRouteOptions!: Observable<any[]>;

  constructor(public dialogRef: MatDialogRef<RouteFilterDialogComponent>, private busRouteService: BusRouteService, 
    private formBuilder: FormBuilder, private snackBar: MatSnackBar, public dialog: MatDialog, private router: Router) { 
      
    }

  ngOnInit(): void {
    this.initFormGrp();

    this.filteredRouteOptions = this.routeControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterRoute(value)),
    );
  }

  initFormGrp() {
    this.routeControl = new FormControl('', [Validators.required]);

    this.formGrp = this.formBuilder.group(
      {
        route : this.routeControl
      }
    );
  }

  _filterRoute(value: string): Bus[] {
    const filterValue = value.toLowerCase();

    return this.allSearchedRoutes.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  onRouteSelectionChanged(route: any, event: any) {
    if(event.isUserInput) {
      this.route = CommonUtil.deepCopy(route);
    }
  }

  onKeyUpEvent(event: any) {
    this.serachValueLettersCount = event.target.value.length;
    this.serachValue = event.target.value;

    if(this.serachValueLettersCount != 0 && this.serachValueLettersCount != 1 && this.serachValueLettersCount != 2   ){
      this.getRouteList(); 
    }
  }

  getRouteList() {
    // if(this.allSearchedRoutes.length == 0) {
      // const dialogRef = this.dialog.open(ProgressDialogComponent);

      let data = JSON.parse(localStorage.getItem('token') || '{}');
      var token = data.token;

      this.busRouteService.searchRoute(token, this.serachValue)
      .pipe(
              catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
        // finalize(() => dialogRef.close())
      ).subscribe(
        data => {
          if(data.body.status == 200) {
            this.onGettingRouteListSuccessfully(data.body);
          } else {
            if(data.body.ui_message != null){
              NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
            } else if(data.body.developer_message != null){
              NetworkUtil.showSnackBar(this.snackBar, data.body.developer_message);
            } else {
              NetworkUtil.showSnackBar(this.snackBar, 'Unable to get operators data, please try again');
            }
          }
        }
      );
    
  }

  onGettingRouteListSuccessfully(data: any) {
    this.allSearchedRoutes = [];

    for(var item of data.data) {
      let route = {
        route_id: item.id,
        name: item.name
      };

      this.allSearchedRoutes.push(route);
    }

    console.log(this.allSearchedRoutes);
  }
  
  onSubmit() {
    if(this.route == null) {
      return;
    }
    this.dialogRef.close(this.route);
  }

}
