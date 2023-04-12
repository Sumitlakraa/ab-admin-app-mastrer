import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, finalize, throwError } from 'rxjs';
import { DistrictFilterDialogComponent } from 'src/app/dialog/district-filter-dialog/district-filter-dialog.component';
import { ProgressDialogComponent } from 'src/app/dialog/progress-dialog/progress-dialog.component';
import { Town } from 'src/app/model/location';
import { LocationService } from 'src/app/services/location/location.service';
import { FilterStorageUtil } from 'src/app/util/filter-storage-util';
import { NetworkUtil } from 'src/app/util/network-util';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { TownFilterDialogComponent } from 'src/app/dialog/town-filter-dialog/town-filter-dialog.component';



@Component({
  selector: 'app-list-towns',
  templateUrl: './list-towns.component.html',
  styleUrls: ['./list-towns.component.scss']
})
export class ListTownsComponent implements OnInit {

  towns: Town[] = [];
  displayedColumns: string[] = ['town', 'town-hi','type', 'district', 'state', 'bus_adda_count', 'status'];

  filters = new Map();
  filtersDisplayValue = new Map();
  firstCallAfterFilterChanged: boolean = false;

  itemCount!: number;
  pageEvent!: PageEvent;
  @ViewChild('paginator') paginator!: MatPaginator;

  pageKey: string = 'listTown';

  constructor(private router: Router, private locationService: LocationService, public dialog: MatDialog,
    private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    let savedFilterMaps = FilterStorageUtil.getAllFilters(this.pageKey , ['district']);
    this.filters = savedFilterMaps[0];
    this.filtersDisplayValue = savedFilterMaps[1];
    this.getTownsListFromServer(1);
  }

  removeFilter(key: string) {
    this.filters.delete(key);
    this.filtersDisplayValue.delete(key);
    this.firstCallAfterFilterChanged = true;

    FilterStorageUtil.removeFilter(this.pageKey, key);

    this.getTownsListFromServer(1);
  }

  onPaginateChange(event: PageEvent) {
    let page = event.pageIndex;
    let size = event.pageSize;

    page = page + 1;
    this.getTownsListFromServer(page);
  }

  openDistrictFilterDialog(value: any) {
    let button: MatButton = value;
    console.log(button._elementRef.nativeElement.getBoundingClientRect());

    let dialogPositionTop: string = button._elementRef.nativeElement.getBoundingClientRect().top + button._elementRef.nativeElement.getBoundingClientRect().height + 5 + 'px';
    let dialogPositionLeft: string = button._elementRef.nativeElement.getBoundingClientRect().left + 'px';

    const dialogRef = this.dialog.open(DistrictFilterDialogComponent, {
      position: { top: dialogPositionTop, left: dialogPositionLeft}
    }).afterClosed().subscribe(district => {
      if(district != null) {
        this.firstCallAfterFilterChanged = true;
        this.filters.set('district', district.id);
        this.filtersDisplayValue.set('district', district.name);

        FilterStorageUtil.saveFilter(this.pageKey, 'district', district.id, district.name );

        this.getTownsListFromServer(1);
      }
    });
  }

  onAddTownClick() {
    this.router.navigateByUrl('/dashboard/editTown');
  }

  onEditTownClick(town: Town) {
    this.router.navigateByUrl('/dashboard/editTown', { state: town });
  }

  openTownFilterDialog(value: any) {
    let button: MatButton = value;
    console.log(button._elementRef.nativeElement.getBoundingClientRect());

    let dialogPositionTop: string = button._elementRef.nativeElement.getBoundingClientRect().top + button._elementRef.nativeElement.getBoundingClientRect().height + 5 + 'px';
    let dialogPositionLeft: string = button._elementRef.nativeElement.getBoundingClientRect().left + 'px';

    const dialogRef = this.dialog.open(TownFilterDialogComponent, {
      position: { top: dialogPositionTop, left: dialogPositionLeft}
    }).afterClosed().subscribe(town => {
      if(town != null) {
        this.firstCallAfterFilterChanged = true;
        this.filters.set('town', town.name);
        this.filtersDisplayValue.set('town', town.name);

        FilterStorageUtil.saveFilter(this.pageKey, 'town', town.id, town.name );

        this.getTownsListFromServer(1);
      }
    });
  }

  getTownsListFromServer(pageIndex: number) {
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    this.locationService.townList(token, pageIndex,  this.filters.get('district')?? undefined, this.filters.get('town'))
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        console.log('getTownsListFromServer response data ', data.body);

        if(data.body.status == 200) {
          dialogRef.close();  
          this.onSuccessfullyGettingTowns(data.body);
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

  onSuccessfullyGettingTowns(body: any) {
    this.towns = [];
    this.itemCount = body.data.count;


    for(var item of body.data.results) {
      try {
        let town = this.convertJsonToObject(item);
        this.towns.push(town);
      } catch(error) {
        NetworkUtil.showSnackBar(this.snackBar, error as string);
      }
    }
  }

  convertJsonToObject(item: any) {
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
      },
      type: item.type,
      
      latitude: item.latitude,
      longitude: item.longitude,
      nameTranslation: item.name_translation,
    };

    return town;
  }

}
