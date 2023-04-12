import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, finalize, throwError } from 'rxjs';
import { ProgressDialogComponent } from 'src/app/dialog/progress-dialog/progress-dialog.component';
import { TownFilterDialogComponent } from 'src/app/dialog/town-filter-dialog/town-filter-dialog.component';
import { TownBoardingPoint } from 'src/app/model/location';
import { LocationService } from 'src/app/services/location/location.service';
import { FilterStorageUtil } from 'src/app/util/filter-storage-util';
import { NetworkUtil } from 'src/app/util/network-util';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-list-bus-addas',
  templateUrl: './list-bus-addas.component.html',
  styleUrls: ['./list-bus-addas.component.scss']
})
export class ListBusAddasComponent implements OnInit {

  townBoardingPoints: TownBoardingPoint[] = [];
  displayedColumns: string[] = ['boarding-point', 'boarding-point-hi', 'type', 'town', 'district', 'state', 'status'];

  filters = new Map();
  filtersDisplayValue = new Map();
  firstCallAfterFilterChanged: boolean = false;
  itemCount!: number;
  pageEvent!: PageEvent;
  @ViewChild('paginator') paginator!: MatPaginator;


  pageKey: string = 'listBusAddas'

  constructor(private router: Router, private locationService: LocationService, public dialog: MatDialog,
    private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    let savedFilterMaps = FilterStorageUtil.getAllFilters(this.pageKey , ['town']);
    this.filters = savedFilterMaps[0];
    this.filtersDisplayValue = savedFilterMaps[1];
    this.getTownBoardingPointsListFromServer(1);
  }

  removeFilter(key: string) {
    this.filters.delete(key);
    this.filtersDisplayValue.delete(key);
    this.firstCallAfterFilterChanged = true;
    
    FilterStorageUtil.removeFilter(this.pageKey, key);

    this.getTownBoardingPointsListFromServer(1);
  }

  onPaginateChange(event: PageEvent) {
    let page = event.pageIndex;
    let size = event.pageSize;

    page = page + 1;
    this.getTownBoardingPointsListFromServer(page);
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
        this.filters.set('town', town.id);
        this.filtersDisplayValue.set('town', town.name);

        FilterStorageUtil.saveFilter(this.pageKey, 'town', town.id, town.name );

        this.getTownBoardingPointsListFromServer(1);
      }
    });
  }

  onAddTownBoardingPointClick() {
    this.router.navigateByUrl('/dashboard/editBusAdda');
  }

  onEditTownBoardingPointClick(townBoardingPoint: TownBoardingPoint) {
    this.router.navigateByUrl('/dashboard/editBusAdda', { state: townBoardingPoint });
  }

  getTownBoardingPointsListFromServer(pageIndex: number) {
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    this.locationService.townStoppageList(token, pageIndex, this.filters.get('town')?? undefined, '')
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
    this.townBoardingPoints = [];
    this.itemCount = body.data.count;

    for(var item of body.data.results) {
      try {
        let townBoardingPoint = this.convertJsonToObject(item);
        this.townBoardingPoints.push(townBoardingPoint as TownBoardingPoint);
      } catch(error) {
        NetworkUtil.showSnackBar(this.snackBar, error as string);
      }
    }
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

}
