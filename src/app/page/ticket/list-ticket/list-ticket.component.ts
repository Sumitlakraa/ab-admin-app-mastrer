import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, retry, finalize } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ProgressDialogComponent } from 'src/app/dialog/progress-dialog/progress-dialog.component';
import { NetworkUtil } from 'src/app/util/network-util';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Ticket } from 'src/app/model/ticket';
import { TicketService } from 'src/app/services/ticket/ticket.service';
import { MatButton } from '@angular/material/button';
import { BusFilterDialogComponent } from 'src/app/dialog/bus-filter-dialog/bus-filter-dialog.component';
import { FilterStorageUtil } from 'src/app/util/filter-storage-util';
import { TownFilterDialogComponent } from 'src/app/dialog/town-filter-dialog/town-filter-dialog.component';
import { PassengerMobileFilterDialogComponent } from 'src/app/dialog/passenger-mobile-filter-dialog/passenger-mobile-filter-dialog.component';
import { PnrFilterDialogComponent } from 'src/app/dialog/pnr-filter-dialog/pnr-filter-dialog.component';
import { BookingDateFilterDialogComponent } from 'src/app/dialog/booking-date-filter-dialog/booking-date-filter-dialog.component';

@Component({
  selector: 'app-list-ticket',
  templateUrl: './list-ticket.component.html',
  styleUrls: ['./list-ticket.component.scss']
})
export class MultipleTicketComponent implements OnInit {

  displayedColumns: string[] = ['ticket_pnr', 'bus_number', 'mobile', 'from_town', 'to_town', 'payment_type', 'paid_amount', 
      'ticket_status', 'seats', 'booking_date'];
  tickets: Ticket[] = [];

  firstCallAfterFilterChanged: boolean = false;
  ticketRequestFilter: boolean = false;
  filters = new Map();
  filtersDisplayValue = new Map();
  pageKey: string = 'listticket';

  itemCount!: number;
  pageEvent!: PageEvent;
  @ViewChild('paginator') paginator!: MatPaginator;

  constructor(private router: Router, private ticketService: TicketService, public dialog: MatDialog,
    private snackBar: MatSnackBar) { 
  }



  ngOnInit(): void {

    let savedFilterMaps = FilterStorageUtil.getAllFilters(this.pageKey , ['bus', 'name', 'mobile']);
    this.filters = savedFilterMaps[0];
    this.filtersDisplayValue = savedFilterMaps[1];

    this.getTicketListFromServer(1);
  }

  onToggleButtonChange(value: any) {
    if(value == 'Tickets') {
      this.ticketRequestFilter = false;

      this.firstCallAfterFilterChanged = true;
      this.tickets = [];
      this.getTicketListFromServer(1);
    } else if(value == 'Requests') {
      this.ticketRequestFilter = true;

      this.firstCallAfterFilterChanged = true;
      this.tickets = [];
      this.getTicketListFromServer(1);
    } else {
      //nothing
    }
  }

  onViewTicketDetailClick(ticket:Ticket) { //TODO
    // this.retrieveTicketDetailsFromServer(ticket as string);
    this.router.navigateByUrl('/dashboard/editTicket', { state: ticket });
  }

  onPaginateChange(event: PageEvent) {
    let page = event.pageIndex;
    let size = event.pageSize;

    page = page + 1;
    this.getTicketListFromServer(page);
  }

  onBookTicketClick(){
    
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

        this.getTicketListFromServer(1);
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

        this.getTicketListFromServer(1);
      }
    });
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
        this.getTicketListFromServer(1);
      }
    });
  }

  openPassengerMobileFilterDialog(value: any){
    let button: MatButton = value;
      console.log(button._elementRef.nativeElement.getBoundingClientRect());
  
      let dialogPositionTop: string = button._elementRef.nativeElement.getBoundingClientRect().top + button._elementRef.nativeElement.getBoundingClientRect().height + 5 + 'px';
      let dialogPositionLeft: string = button._elementRef.nativeElement.getBoundingClientRect().left + 'px';
  
      const dialogRef = this.dialog.open(PassengerMobileFilterDialogComponent, {
        position: { top: dialogPositionTop, left: dialogPositionLeft}
      }).afterClosed().subscribe(passengerMobile => {
        if(passengerMobile != null) {
          this.firstCallAfterFilterChanged = true;
          this.filters.set('passenger_mobile', passengerMobile.number);
          this.filtersDisplayValue.set('passenger_mobile', passengerMobile.number);

          FilterStorageUtil.saveFilter(this.pageKey, 'passenger_mobile', passengerMobile.number, passengerMobile.number );

          this.getTicketListFromServer(1);
        }
      }
    );
  }

  openPnrFilterDialog(value: any){
    let button: MatButton = value;
      console.log(button._elementRef.nativeElement.getBoundingClientRect());
  
      let dialogPositionTop: string = button._elementRef.nativeElement.getBoundingClientRect().top + button._elementRef.nativeElement.getBoundingClientRect().height + 5 + 'px';
      let dialogPositionLeft: string = button._elementRef.nativeElement.getBoundingClientRect().left + 'px';
  
      const dialogRef = this.dialog.open(PnrFilterDialogComponent, {
        position: { top: dialogPositionTop, left: dialogPositionLeft}
      }).afterClosed().subscribe(pnr => {
        if(pnr != null) {
          this.firstCallAfterFilterChanged = true;
          this.filters.set('pnr', pnr.number);
          this.filtersDisplayValue.set('pnr', pnr.number);

          FilterStorageUtil.saveFilter(this.pageKey, 'pnr', pnr.number, pnr.number );

          this.getTicketListFromServer(1);
        }
      }
    );
  }



  openBookingDateDialog(value: any) {
    let button: MatButton = value;
    console.log(button._elementRef.nativeElement.getBoundingClientRect());

    let dialogPositionTop: string = button._elementRef.nativeElement.getBoundingClientRect().top + button._elementRef.nativeElement.getBoundingClientRect().height + 5 + 'px';
    let dialogPositionLeft: string = button._elementRef.nativeElement.getBoundingClientRect().left + -180 + 'px';

    const dialogRef = this.dialog.open(BookingDateFilterDialogComponent, {
      position: { top: dialogPositionTop, left: dialogPositionLeft}
    }).afterClosed().subscribe(date => {
      if(date != null) {
        this.firstCallAfterFilterChanged = true;
        this.filters.set('booking_date', date);
        this.filtersDisplayValue.set('booking_date', date);

        FilterStorageUtil.saveFilter(this.pageKey, 'booking_date', date, date );

        this.getTicketListFromServer(1);
        }
      }
    );
  }

  removeFilter(key: string) {
    this.filters.delete(key);
    this.filtersDisplayValue.delete(key);
    this.firstCallAfterFilterChanged = true;

    FilterStorageUtil.removeFilter(this.pageKey, key);

    this.getTicketListFromServer(1);
  }

  getTicketListFromServer(pageIndex: number) {
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    this.ticketService.ticketList(token, pageIndex,
       this.filters.get('bus')?? undefined,
       this.filters.get('passenger_mobile')??undefined, 
       this.filters.get('pnr')??undefined, 
       this.filters.get('booking_date')?? undefined, 
       this.filters.get('fromTown')?? undefined, 
       this.filters.get('tillTown')?? undefined)
    .pipe(
      catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        console.log('getTicketListFromServer response data ', data.body);

        if(data.body.status == 200) {
          this.onSuccessfullyGettingTickets(data.body);
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

  onSuccessfullyGettingTickets(body: any) {
    this.tickets = [];
    this.itemCount = body.data.count;

    for(var item of body.data.results) {
      try {
        let ticket = this.convertJsonToObject(item); 
        this.tickets.push(ticket);
      } catch(error) {
        NetworkUtil.showSnackBar(this.snackBar, error as string);
      }
    }

    if(this.firstCallAfterFilterChanged) {
      this.paginator.pageIndex = 0;
    }
  }

  convertJsonToObject(item: any) {
    let ticket: Ticket = {
      id: item.id,

      ticketPNR: item.pnr,
      bookingDate: item.created_on,
      jounrneyDate: item.journey_date,
  
      fromTown: item.start_town.name,
      toTown: item.end_town.name,
  
      busNumber: item.bus_details.bus_number,
      passengerMobile: item.passenger_mobile,
  
      normalSeats: item.normal_seat,
      singleSleeperSeats: item.single_sleeper,
      sharingSleeperSeats: item.sharing_sleeper,
  
      paymentStatus: item.status,
      paymentType: item.payment_mode,
  
      totalAmountPaid: item.payable_amount,
      discount: item.discount,
      paidByWallet: item.paid_from_wallet,
  
      ticketStatus: item.status,

      conductorName: item.bus_details.conductor_name,
      conductorMobile: item.bus_details.conductor_contact,
  
      operatorName: item.bus_details.operator_name,
      operatorMobile: item.bus_details.mobile,
  
      pocName: item.bus_details.poc_name,
      pocMobile: item.bus_details.poc_mobile,
  
      cashback: item.cashback_received,
      companyName: item.bus_details.company,

    };

    return ticket;
  }

  retrieveTicketDetailsFromServer(ticketId: string) {
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    this.ticketService.ticketDetail(token, ticketId)
    .pipe(
            catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        if(data.body.status == 200) {
          dialogRef.close();  
          this.onSuccessfullyGettingTicketDetails(data.body);
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

  onSuccessfullyGettingTicketDetails(data: any) {
    let ticket = this.convertJsonToObject(data.data);
    this.router.navigateByUrl('/dashboard/editTicket', { state: ticket });
  }

}
