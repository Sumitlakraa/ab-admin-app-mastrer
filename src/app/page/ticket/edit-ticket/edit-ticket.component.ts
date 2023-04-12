import { Component, OnInit } from '@angular/core';
import { Router, Navigation } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { HttpErrorResponse, HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError  } from 'rxjs';
import { catchError, retry, finalize } from 'rxjs/operators';
import { Location } from '@angular/common';
import {map, startWith} from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { MatChip } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';

import { FileUploadService } from 'src/app/services/file-upload/file-upload.service';

import { BusService } from 'src/app/services/bus/bus.service';
import { NetworkUtil } from 'src/app/util/network-util';
import { BusRouteMappingMetaData } from 'src/app/model/route';
import { Ticket } from 'src/app/model/ticket';
import { TicketService } from 'src/app/services/ticket/ticket.service';
import { ProgressDialogComponent } from 'src/app/dialog/progress-dialog/progress-dialog.component';

@Component({
  selector: 'app-edit-ticket',
  templateUrl: './edit-ticket.component.html',
  styleUrls: ['./edit-ticket.component.scss']
})
export class EditTicketComponent implements OnInit {

  ticket_status_options: string[] = ['Cancelled By ApniBus', 'Cancelled By Passenger'];

  formGrp!: FormGroup;
  ticket!: Ticket;

  constructor(private router: Router, private formBuilder: FormBuilder, private snackBar: MatSnackBar, private location: Location,
    public dialog: MatDialog, private ticketService: TicketService) { 

    var navigation = this.router.getCurrentNavigation();
    if(navigation != null) {
      let ticket = navigation.extras.state as Ticket;
      this.ticket = ticket as Ticket;
      if(this.ticket == undefined){
        this.router.navigateByUrl('/dashboard/listTickets');
      }
    }


    this.initFormGrp();
  }

  ngOnInit(): void {
   }

  initFormGrp() {
    this.formGrp = this.formBuilder.group(
      {
        ticket_pnr : new FormControl({value: this.ticket.ticketPNR, disabled: true}),
        booking_date : new FormControl({value: this.ticket.bookingDate, disabled: true}),
        journey_date : new FormControl({value: this.ticket.jounrneyDate, disabled: true}),
        bus_number : new FormControl({value: this.ticket.busNumber, disabled: true}),
        passenger_mobile : new FormControl({value: this.ticket.passengerMobile, disabled: true}),

        normal_seats : new FormControl({value: this.ticket.normalSeats, disabled: true}),
        single_sleeper : new FormControl({value: this.ticket.singleSleeperSeats, disabled: true}),
        sharing_sleeper : new FormControl({value: this.ticket.sharingSleeperSeats, disabled: true}),

        payment_status : new FormControl({value: this.ticket.paymentStatus, disabled: true}),
        payment_type : new FormControl({value: this.ticket.paymentType, disabled: true}),

        total_amount_paid : new FormControl({value: this.ticket.totalAmountPaid, disabled: true}),
        discount : new FormControl({value: this.ticket.discount, disabled: true}),
        paid_by_wallet : new FormControl({value: this.ticket.paidByWallet, disabled: true}),
        ticket_status : new FormControl({value: this.ticket.ticketStatus}),

        conductor_name: new FormControl({value: this.ticket.conductorName, disabled: true}),
        conductor_mobile: new FormControl({value: this.ticket.conductorMobile, disabled: true}),
    
        operator_name: new FormControl({value: this.ticket.operatorName, disabled: true}),
        operator_mobile: new FormControl({value: this.ticket.operatorMobile, disabled: true}),
    
        poc_name: new FormControl({value: this.ticket.pocName, disabled: true}),
        poc_mobile: new FormControl({value: this.ticket.pocMobile, disabled: true}),
    
        cashback: new FormControl({value: this.ticket.cashback, disabled: true}),
        company_name: new FormControl({value: this.ticket.companyName, disabled: true}),
      }
    );
  }

  onTicketStatusSelectionChanged(event: any) {
    if(event.isUserInput) {
      //TODO
    }
  }

  onSubmit() {
    if(this.formGrp.invalid) {
      NetworkUtil.showSnackBar( this.snackBar, 'Please complete form');
      return;
    }else{
      if(confirm("Are you sure to cancel this ticket [ PNR -  "+ this.ticket.ticketPNR + " ]")) {
        this.updateTicketStatus();
      }
    }


    
  }

  updateTicketStatus() {
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    if( this.formGrp.value.ticket_status == "Cancelled By ApniBus"){

      this.formGrp.value.ticket_status = "cancelled_by_apnibus"

    }
    if( this.formGrp.value.ticket_status == "Cancelled By Passenger"){

      this.formGrp.value.ticket_status = "cancelled_by_passenger"

    }

    let jsonData = {

      'status' : this.formGrp.value.ticket_status
    };

    this.ticketService.updateTicketStatus(token, this.ticket.id as string, jsonData)
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
    this.location.back();
  }

}
