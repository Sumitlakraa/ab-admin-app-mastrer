import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, retry, finalize } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ProgressDialogComponent } from 'src/app/dialog/progress-dialog/progress-dialog.component';
import { NetworkUtil } from 'src/app/util/network-util';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { LedgerService } from 'src/app/services/ledger/ledger.service';
import { TicketLedgerDetail } from 'src/app/model/ledger';

@Component({
  selector: 'app-ticket-ledger',
  templateUrl: './ticket-ledger.component.html',
  styleUrls: ['./ticket-ledger.component.scss']
})
export class TicketLedgerComponent implements OnInit {

  displayedColumns: string[] = ['ticket_id', 'travel_date', 'amount', 'gst', 'discount', 'payment_mode', 'commission', 'gst_on_commission', 'payable'];
  ledgerDetails: TicketLedgerDetail[] = [];

  firstCallAfterFilterChanged: boolean = false;

  itemCount!: number;
  pageEvent!: PageEvent;
  @ViewChild('paginator') paginator!: MatPaginator;

  constructor(private router: Router, private ledgerService: LedgerService, public dialog: MatDialog,
    private snackBar: MatSnackBar) { 
  }

  ngOnInit(): void {
    this.getLedgerDetailsFromServer(1);
  }

  onPaginateChange(event: PageEvent) {
    let page = event.pageIndex;
    let size = event.pageSize;

    page = page + 1;
    this.getLedgerDetailsFromServer(page);
  }

  getLedgerDetailsFromServer(pageIndex: number) {
    const dialogRef = this.dialog.open(ProgressDialogComponent);

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    this.ledgerService.busLevelDetails(token, pageIndex)
    .pipe(
      catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
      finalize(() => dialogRef.close())
    ).subscribe(
      data => {
        console.log('getLedgerDetailsFromServer response data ', data.body);

        if(data.body.status == 200) {
          this.onSuccessfullyGettingLedgerDetails(data.body);
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

  onSuccessfullyGettingLedgerDetails(body: any) {
    this.ledgerDetails = [];
    this.itemCount = body.data.count;

    for(var item of body.data.results) {
      try {
        let ledgerDetail = this.convertJsonToObject(item); 
        this.ledgerDetails.push(ledgerDetail);
      } catch(error) {
        NetworkUtil.showSnackBar(this.snackBar, error as string);
      }
    }

    if(this.firstCallAfterFilterChanged) {
      this.paginator.pageIndex = 0;
    }
  }

  convertJsonToObject(item: any) {
    let ledgerDetail: TicketLedgerDetail = {
      id : '---'
    };

    return ledgerDetail;
  }

}
