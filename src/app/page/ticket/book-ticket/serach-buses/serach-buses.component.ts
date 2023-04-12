import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, finalize, map, Observable, startWith } from 'rxjs';
import { ProgressDialogComponent } from 'src/app/dialog/progress-dialog/progress-dialog.component';
import { Town } from 'src/app/model/location';
import { LocationService } from 'src/app/services/location/location.service';
import { CommonUtil } from 'src/app/util/common-util';
import { NetworkUtil } from 'src/app/util/network-util';


@Component({
  selector: 'app-serach-buses',
  templateUrl: './serach-buses.component.html',
  styleUrls: ['./serach-buses.component.scss']
})
export class SerachBusesComponent implements OnInit {

  
  town!: any;

  formGrp!: FormGroup;
  townControl!: FormControl;

  allSearchedTowns: any[] = [];
  filteredTownOptions!: Observable<any[]>;

  serachValue!: any;
  serachValueLettersCount!: number;

  constructor(public dialogRef: MatDialogRef<SerachBusesComponent>,  private locationService: LocationService, 
    private formBuilder: FormBuilder, private snackBar: MatSnackBar, public dialog: MatDialog, private router: Router) { 
    }

  ngOnInit(): void {
    this.initFormGrp();

    this.filteredTownOptions = this.townControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterTown(value)),
    );
  }

  initFormGrp() {
    this.townControl = new FormControl('', [Validators.required]);

    this.formGrp = this.formBuilder.group(
      {
        startTown : this.townControl,
        endTown : this.townControl,
        journeyDate : this.townControl
      }
    );
  }

  _filterTown(value: string): Town[] {
    const filterValue = value.toLowerCase();

    return this.allSearchedTowns.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  onTownSelectionChanged(town: any, event: any) {
    if(event.isUserInput) {
      this.town = CommonUtil.deepCopy(town);
    }
  }

  onKeyUpEvent(event: any){

    this.serachValueLettersCount = event.target.value.length;
    this.serachValue = event.target.value;

    if(this.serachValueLettersCount != 0 && this.serachValueLettersCount != 1 ){
        this.getTownList();     
    }
  }

  getTownList() {
    if(this.allSearchedTowns.length == 0) {
      const dialogRef = this.dialog.open(ProgressDialogComponent);

      let data = JSON.parse(localStorage.getItem('token') || '{}');
      var token = data.token;

      this.locationService.searchTown(token, undefined, this.serachValue)
      .pipe(
              catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
        finalize(() => dialogRef.close())
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

      this.allSearchedTowns.push(town);
    }
  }
  
  onSubmit() {
    if(this.town == null) {
      return;
    }
  }

}



