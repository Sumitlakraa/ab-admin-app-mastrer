import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, retry, finalize } from 'rxjs/operators';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BusService } from 'src/app/services/bus/bus.service';
import { ConcessionService } from 'src/app/services/concession/concession.service';
import { ProgressDialogComponent } from 'src/app/dialog/progress-dialog/progress-dialog.component';
import { NetworkUtil } from 'src/app/util/network-util';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { BusRouteMappingMetaData, RouteMetaData } from 'src/app/model/route';
import { BusFilterDialogComponent } from 'src/app/dialog/bus-filter-dialog/bus-filter-dialog.component';
import { Concession } from 'src/app/model/concession';
import { FilterStorageUtil } from 'src/app/util/filter-storage-util';

@Component({
  selector: 'app-list-pos-concession',
  templateUrl: './list-pos-concession.component.html',
  styleUrls: ['./list-pos-concession.component.scss']
})
export class ListPosConcessionComponent implements OnInit {
  busRouteMappingMetaDataList: BusRouteMappingMetaData[] = [];
  displayedColumns: string[] = ['bus_number', 'concession_name', 'concession_percentage', 'is_active'];
  concession: Concession[] = [];

  itemCount!: number;

  filters = new Map();
  filtersDisplayValue = new Map();
  firstCallAfterFilterChanged: boolean = false;

  pageKey: string = 'listPosConcession'
  // pageEvent!: PageEvent;
  // @ViewChild('paginator') paginator!: MatPaginator;

  constructor(private router: Router, private busService: BusService, private concessionService: ConcessionService,
     public dialog: MatDialog,
    private snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    let savedFilterMaps = FilterStorageUtil.getAllFilters(this.pageKey , ['bus']);
    this.filters = savedFilterMaps[0];
    this.filtersDisplayValue = savedFilterMaps[1];
    this.getConcessionListFromServer();
  }

  onAddBusClick() {
    this.router.navigateByUrl('/dashboard/editPosConcession');
  }

  toggleEvent( concession: Concession) {
    this.updateConcession_Status(concession);
  }

  stopPropagation(event: Event){
    event.stopPropagation();
  }

  onEditBusClick(concession: Concession) {
    this.router.navigateByUrl('/dashboard/editPosConcession', { state: concession });
  }

  // onPaginateChange(event: PageEvent) {
  //   let page = event.pageIndex;
  //   let size = event.pageSize;

  //   page = page + 1;
  //   this.getBusListFromServer(page);
  // }

  getConcessionListFromServer() {
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    this.concessionService.ticketConcessionList(token,this.filters.get('bus')?? undefined )
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        console.log('concession list, response data ', data.body);

        if(data.body.status == 200) {
          dialogRef.close();
          this.onSuccessfullyGettingConcession(data.body);
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

  onSuccessfullyGettingConcession(body: any) {
    this.concession = [];
    this.itemCount = body.data.count;

    for(var item of body.data) {
      try {
        if(item.bus_number != undefined) {
          let concession = this.convertJsonToObject(item);
          this.concession.push(concession);
        }
      } catch(error) {
        NetworkUtil.showSnackBar(this.snackBar, error as string);
      }
    }
  }

  convertJsonToObject(item: any) {
    let concession: Concession = {
      concession_id: item.id,
      bus_number: item.bus_number,
      bus_id: item.bus,
      name: item.name,
      value: item.value,
      is_active: item.is_active,
      new_is_active: item.is_active,
    };

    return concession;
  }

  removeFilter(key: string) {
    this.filters.delete(key);
    this.filtersDisplayValue.delete(key);
    this.firstCallAfterFilterChanged = true;

    FilterStorageUtil.removeFilter(this.pageKey, key);

    this.getConcessionListFromServer();
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
        this.filters.set('bus', bus.number);
        this.filtersDisplayValue.set('bus', bus.number);

        FilterStorageUtil.saveFilter(this.pageKey, 'bus', bus.number, bus.number );

        this.getConcessionListFromServer();
      }
    });
  }

  onUpdateConcession_Status(concession: Concession){
    this.updateConcession_Status(concession);
    
  }

  updateConcession_Status(concession: Concession) {
    console.log('updateConcession_Status');
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    var requestData = {
      'is_active': concession.is_active == true ? 'false' : 'true'
    };
    this.concessionService.updateTicketConcession(token, concession.concession_id, requestData)
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        if(data.body.status == 200) {
          this.onConcessionStatus_UpdatedSuccessfully(data.body);
        } else {
          concession.is_active = concession.new_is_active;

          if(data.body.ui_message != null){
            NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
          } else if(data.body.developer_message != null){
            NetworkUtil.showSnackBar(this.snackBar, data.body.developer_message);
          } else {
            NetworkUtil.showSnackBar(this.snackBar, 'Unable to update town on this route, please try again');
          }
        }
      }
    );
  }

  onConcessionStatus_UpdatedSuccessfully(body: any) {
    NetworkUtil.showSnackBar(this.snackBar, 'Updated Successfully');
  }
    
}