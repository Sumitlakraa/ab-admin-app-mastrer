import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError  } from 'rxjs';
import { catchError, retry, finalize } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ProgressDialogComponent } from 'src/app/dialog/progress-dialog/progress-dialog.component';
import { NetworkUtil } from 'src/app/util/network-util';
import { PricingService } from 'src/app/services/pricing/pricing.service';
import { BusSpecificPricing } from 'src/app/model/pricing';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { CreateRouteDialogComponent } from 'src/app/dialog/create-route-dialog/create-route-dialog.component';
import { MatButton } from '@angular/material/button';
import { BusFilterDialogComponent } from 'src/app/dialog/bus-filter-dialog/bus-filter-dialog.component';
import { TownFilterDialogComponent } from 'src/app/dialog/town-filter-dialog/town-filter-dialog.component';
import { CategoryFilterDialogComponent } from 'src/app/dialog/category-filter-dialog/category-filter-dialog.component';
import { AcFilterDialogComponent } from 'src/app/dialog/ac-filter-dialog/ac-filter-dialog.component';
import { Sort } from '@angular/material/sort';
import { FilterStorageUtil } from 'src/app/util/filter-storage-util';

@Component({
  selector: 'app-bus-specific-pricing',
  templateUrl: './bus-specific-pricing.component.html',
  styleUrls: ['./bus-specific-pricing.component.scss']
})
export class BusSpecificPricingComponent implements OnInit {

  busSpecificPricingList: BusSpecificPricing[] = [];
  displayedColumns: string[] = ['category', 'bus', 'from_town', 'to_town', 'ac_state', 'seater', 'upper_sharing_sleeper', 'upper_single_sleeper', 'lower_sharing_sleeper', 'lower_single_sleeper','action'];

  filters = new Map();
  filtersDisplayValue = new Map();
  firstCallAfterFilterChanged: boolean = false;

  pageKey: string = 'busSpecificPricing';

  itemCount!: number;
  pageEvent!: PageEvent;
  @ViewChild('paginator') paginator!: MatPaginator;

  sortingColumn: string = '';
  sortingOrder: string = '';

  constructor(private router: Router, private pricingService: PricingService, public dialog: MatDialog,
    private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    let savedFilterMaps = FilterStorageUtil.getAllFilters(this.pageKey, ['category', 'acState', 'bus', 'fromTown', 'tillTown' ]);
    this.filters = savedFilterMaps[0];
    this.filtersDisplayValue = savedFilterMaps[1];
    this.getBusSpecificPricingListFromServer(1);
  }

  // toggleEvent(busRouteStoppage: BusRouteStoppage) {
  //   this.updateBusRouteStoppage_LatLong(busRouteStoppage);
  // }

  onUpdateClick(busSpecificPriceEntry: BusSpecificPricing) {
    this.updateBusSpecificPricing(busSpecificPriceEntry);
  }

  onPaginateChange(event: PageEvent) {
    let page = event.pageIndex;
    let size = event.pageSize;

    page = page + 1;
    this.getBusSpecificPricingListFromServer(page);
  }

  removeFilter(key: string) {
    this.filters.delete(key);
    this.filtersDisplayValue.delete(key);
    this.firstCallAfterFilterChanged = true;

    FilterStorageUtil.removeFilter(this.pageKey, key);

    this.getBusSpecificPricingListFromServer(1);
  }

  openBusFilterDialog(value: any) {
    let button: MatButton = value;
    console.log(button._elementRef.nativeElement.getBoundingClientRect());

    let dialogPositionTop: string = button._elementRef.nativeElement.getBoundingClientRect().top + button._elementRef.nativeElement.getBoundingClientRect().height + 5 + 'px';
    let dialogPositionLeft: string = button._elementRef.nativeElement.getBoundingClientRect().left + 'px';

    const dialogRef = this.dialog.open(BusFilterDialogComponent, {
      position: { top: dialogPositionTop, left: dialogPositionLeft}
    }).afterClosed().subscribe(bus => {
      if(bus != null) {
        this.firstCallAfterFilterChanged = true;
        this.filters.set('bus', bus.id);
        this.filtersDisplayValue.set('bus', bus.number);

        FilterStorageUtil.saveFilter(this.pageKey, 'bus', bus.id, bus.number );

        this.getBusSpecificPricingListFromServer(1);
      }
    });
  }

  openFromFilterDialog(value: any) {
    let button: MatButton = value;
    console.log(button._elementRef.nativeElement.getBoundingClientRect());

    let dialogPositionTop: string = button._elementRef.nativeElement.getBoundingClientRect().top + button._elementRef.nativeElement.getBoundingClientRect().height + 5 + 'px';
    let dialogPositionLeft: string = button._elementRef.nativeElement.getBoundingClientRect().left + 'px';

    const dialogRef = this.dialog.open(TownFilterDialogComponent, {
      position: { top: dialogPositionTop, left: dialogPositionLeft}
    }).afterClosed().subscribe(town => {
      if(town != null) {
        this.firstCallAfterFilterChanged = true;
        this.filters.set('fromTown', town.id);
        this.filtersDisplayValue.set('fromTown', 'From ' + town.name);

        FilterStorageUtil.saveFilter(this.pageKey, 'fromTown', town.id, 'From ' + town.name );

        this.getBusSpecificPricingListFromServer(1);
      }
    });
  }

  openTillFilterDialog(value: any) {
    let button: MatButton = value;
    console.log(button._elementRef.nativeElement.getBoundingClientRect());

    let dialogPositionTop: string = button._elementRef.nativeElement.getBoundingClientRect().top + button._elementRef.nativeElement.getBoundingClientRect().height + 5 + 'px';
    let dialogPositionLeft: string = button._elementRef.nativeElement.getBoundingClientRect().left + 'px';

    const dialogRef = this.dialog.open(TownFilterDialogComponent, {
      position: { top: dialogPositionTop, left: dialogPositionLeft}
    }).afterClosed().subscribe(town => {
      if(town != null) {
        this.firstCallAfterFilterChanged = true;
        this.filters.set('tillTown', town.id);
        this.filtersDisplayValue.set('tillTown', 'Till ' + town.name);

        FilterStorageUtil.saveFilter(this.pageKey, 'tillTown', town.id, 'Till ' + town.name );

        this.getBusSpecificPricingListFromServer(1);
      }
    });
  }

  openCategoryFilterDialog(value: any) {
    let button: MatButton = value;
    console.log(button._elementRef.nativeElement.getBoundingClientRect());

    let dialogPositionTop: string = button._elementRef.nativeElement.getBoundingClientRect().top + button._elementRef.nativeElement.getBoundingClientRect().height + 5 + 'px';
    let dialogPositionLeft: string = button._elementRef.nativeElement.getBoundingClientRect().left + 'px';

    const dialogRef = this.dialog.open(CategoryFilterDialogComponent, {
      position: { top: dialogPositionTop, left: dialogPositionLeft}
    }).afterClosed().subscribe(category => {
      if(category != null) {
        this.firstCallAfterFilterChanged = true;
        this.filters.set('category', category.toLowerCase());
        this.filtersDisplayValue.set('category', category);
        
        FilterStorageUtil.saveFilter(this.pageKey, 'category',category.toLowerCase(),category);

        this.getBusSpecificPricingListFromServer(1);
      }
    });
  }

  openAcFilterDialog(value: any) {
    let button: MatButton = value;
    console.log(button._elementRef.nativeElement.getBoundingClientRect());

    let dialogPositionTop: string = button._elementRef.nativeElement.getBoundingClientRect().top + button._elementRef.nativeElement.getBoundingClientRect().height + 5 + 'px';
    let dialogPositionLeft: string = button._elementRef.nativeElement.getBoundingClientRect().left + 'px';

    const dialogRef = this.dialog.open(AcFilterDialogComponent, {
      position: { top: dialogPositionTop, left: dialogPositionLeft}
    }).afterClosed().subscribe(acState => {
      if(acState != null) {
        this.firstCallAfterFilterChanged = true;
        this.filters.set('acState', acState);
        this.filtersDisplayValue.set('acState', acState as boolean ? 'AC' : 'Non AC');

        FilterStorageUtil.saveFilter(this.pageKey, 'acState', acState, acState as boolean ? 'AC' : 'Non AC' );

        this.getBusSpecificPricingListFromServer(1);
      }
    });
  }

  announceSortChange(sortState: Sort) {
    console.log('announceSortChange' + sortState.direction);
    console.log('announceSortChange' + sortState.active);

    this.sortingColumn = sortState.active;
    this.sortingOrder = sortState.direction;

    this.firstCallAfterFilterChanged = true;
    this.getBusSpecificPricingListFromServer(1);
  }

  getBusSpecificPricingListFromServer(pageIndex: number) {
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    this.pricingService.busSpecificPricingList(token, pageIndex, 
      this.filters.get('category'), this.filters.get('bus')?? undefined, 
      this.filters.get('fromTown')?? undefined, this.filters.get('tillTown')?? undefined, 
      this.filters.get('acState'), this.sortingColumn, this.sortingOrder)
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => {
        dialogRef.close();
        this.firstCallAfterFilterChanged = false;
      })
    ).subscribe(
      data => {
        console.log('getBusSpecificPricingListFromServer response data ', data.body);

        if(data.body.status == 200) {
          this.onSuccessfullyGettingBusSpecificPricing(data.body);
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

  onSuccessfullyGettingBusSpecificPricing(body: any) {
    this.busSpecificPricingList = [];
    this.itemCount = body.data.count;

    for(var item of body.data.results) {
      try {
        let busSpecificPriceEntry = this.convertJsonToObject(item); 
        this.busSpecificPricingList.push(busSpecificPriceEntry);
      } catch(error) {
        NetworkUtil.showSnackBar(this.snackBar, error as string);
      }
    }

    if(this.firstCallAfterFilterChanged) {
      this.paginator.pageIndex = 0;
    }
  }

  convertJsonToObject(item: any) {
    let busSpecificPriceEntry: BusSpecificPricing = {
      id: item.id,
      busNumber: item.bus_details.bus_number,
      fromTownName: item.from_town.name,
      toTownName: item.to_town.name,
      isAcAvailable: item.bus_details.is_air_conditioned,
      category: item.bus_details.category,
  
      normalSeatPrice: item.normal_seat_price,
      upperSingleSleeperPrice: item.upper_single_sleeper_price,
      upperShareSleeperPrice: item.upper_sharing_sleeper_price,

      lowerSingleSleeperPrice: item.single_sleeper_price,
      lowerShareSleeperPrice: item.sharing_sleeper_price,

      newNormalSeatPrice: item.normal_seat_price,
      newUpperSingleSleeperPrice: item.upper_single_sleeper_price,
      newUpperShareSleeperPrice: item.upper_sharing_sleeper_price,
      newLowerSingleSleeperPrice: item.single_sleeper_price,
      newLowerShareSleeperPrice: item.sharing_sleeper_price,
    };

    return busSpecificPriceEntry;
  }

  updateBusSpecificPricing(busSpecificPriceEntry: BusSpecificPricing) {
    console.log('updateBusSpecificPricing');
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    var requestData = {
      'normal_seat_price': busSpecificPriceEntry.newNormalSeatPrice,
      'single_sleeper_price': busSpecificPriceEntry.newLowerSingleSleeperPrice,
      'sharing_sleeper_price': busSpecificPriceEntry.newLowerShareSleeperPrice,
      'upper_single_sleeper_price': busSpecificPriceEntry.newUpperSingleSleeperPrice,
      'upper_sharing_sleeper_price': busSpecificPriceEntry.newUpperShareSleeperPrice
    };
    this.pricingService.updatebusSpecificPricing(token, busSpecificPriceEntry.id, requestData)
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        if(data.body.status == 200) {
          this.onBusPricing_UpdatedSuccessfully(busSpecificPriceEntry, data.body);
        } else {
          if(data.body.ui_message != null){
            NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
          } else if(data.body.developer_message != null){
            NetworkUtil.showSnackBar(this.snackBar, data.body.developer_message);
          } else {
            NetworkUtil.showSnackBar(this.snackBar, 'Unable to update lat-long, please try again');
          }
        }
      }
    );
  }

  onBusPricing_UpdatedSuccessfully(busSpecificPriceEntry: BusSpecificPricing, body: any) {
    busSpecificPriceEntry.normalSeatPrice = busSpecificPriceEntry.newNormalSeatPrice;
    busSpecificPriceEntry.upperSingleSleeperPrice = busSpecificPriceEntry.newUpperSingleSleeperPrice;
    busSpecificPriceEntry.upperShareSleeperPrice = busSpecificPriceEntry.newUpperShareSleeperPrice;

    NetworkUtil.showSnackBar(this.snackBar, 'Updated Successfully');
  }

  categoryStyle(busSpecificPriceEntry: BusSpecificPricing) {
    if(busSpecificPriceEntry.category == 'general') {
      return '#FFF8BC';
    } else if(busSpecificPriceEntry.category == 'luxury') {
      return '#D99BFF';      
    } else if(busSpecificPriceEntry.category == 'express') {
      return '#C1E1FF';
    } else {
      return '';
    }
  }

}
