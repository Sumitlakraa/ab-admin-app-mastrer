import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, finalize, throwError } from 'rxjs';
import { ProgressDialogComponent } from 'src/app/dialog/progress-dialog/progress-dialog.component';
import { District } from 'src/app/model/location';
import { LocationService } from 'src/app/services/location/location.service';
import { NetworkUtil } from 'src/app/util/network-util';

@Component({
  selector: 'app-list-districts',
  templateUrl: './list-districts.component.html',
  styleUrls: ['./list-districts.component.scss']
})
export class ListDistrictsComponent implements OnInit {

  districts: District[] = [];
  displayedColumns: string[] = ['district', 'state'];

  constructor(private router: Router, private locationService: LocationService, public dialog: MatDialog,
    private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.getDistrictsListFromServer();
  }

  onAddDistrictClick() {
    this.router.navigateByUrl('/dashboard/editDistrict');
  }

  onEditDistrictClick(district: District) {
    this.router.navigateByUrl('/dashboard/editDistrict', { state: district });
  }

  getDistrictsListFromServer() {
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    this.locationService.searchDistrict(token, '', '')
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        console.log('getDistrictsListFromServer response data ', data.body);

        if(data.body.status == 200) {
          dialogRef.close();  
          this.onSuccessfullyGettingDistricts(data.body);
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

  onSuccessfullyGettingDistricts(body: any) {
    this.districts = [];

    for(var item of body.data) {
      try {
        let district = this.convertJsonToObject(item);
        this.districts.push(district);
      } catch(error) {
        NetworkUtil.showSnackBar(this.snackBar, error as string);
      }
    }
  }

  convertJsonToObject(item: any) {
    let district: District = {
      id: item.id,
      name: item.name,
      state: {
        id: item.state.id,
        name: item.state.name
      }
    };

    return district;
  }

}
