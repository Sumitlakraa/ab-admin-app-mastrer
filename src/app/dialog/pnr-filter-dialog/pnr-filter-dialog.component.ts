import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, finalize, map, Observable, startWith } from 'rxjs';
import { Bus } from 'src/app/model/bus';
import { OperatorService } from 'src/app/services/operator/operator.service';
import { LocationService } from 'src/app/services/location/location.service';
import { RouteService } from 'src/app/services/route/route.service';
import { CommonUtil } from 'src/app/util/common-util';
import { NetworkUtil } from 'src/app/util/network-util';
import { ProgressDialogComponent } from '../progress-dialog/progress-dialog.component';
import { TicketService } from 'src/app/services/ticket/ticket.service';

@Component({
  selector: 'app-pnr-filter-dialog',
  templateUrl: './pnr-filter-dialog.component.html',
  styleUrls: ['./pnr-filter-dialog.component.scss']
})
export class PnrFilterDialogComponent implements OnInit { 
  
  pnr!: any;

  
  formGrp!: FormGroup;
  pnrControl!: FormControl;

  allSearchedPnr: any[] = [];
  filteredPnrOptions!: Observable<any[]>;

  serachValue!: any;
  serachValueLettersCount!: number;

  constructor(public dialogRef: MatDialogRef<PnrFilterDialogComponent>, private operatorService: OperatorService, private ticketService: TicketService, 
    private formBuilder: FormBuilder, private snackBar: MatSnackBar, public dialog: MatDialog, private router: Router) { 
    }

  ngOnInit(): void {
    this.initFormGrp();

    this.filteredPnrOptions = this.pnrControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterPnr(value)),
    );
  }

  initFormGrp() {
    this.pnrControl = new FormControl('', [Validators.required]);

    this.formGrp = this.formBuilder.group(
      {
        pnr : this.pnrControl
      }
    );
  }

  _filterPnr(value: number): Bus[] {
    const filterValue = value;

    return this.allSearchedPnr.filter(option => option.number.includes(filterValue));
  }

  onPnrSelectionChanged(pnr: any, event: any) {
    if(event.isUserInput) {
      this.pnr = CommonUtil.deepCopy(pnr);
    }
  }

  onKeyUpEvent(event: any){

    this.serachValueLettersCount = event.target.value.length;
    this.serachValue = event.target.value;

    if(this.serachValueLettersCount != 0 && this.serachValueLettersCount != 1 ){
        this.getPnrList();     
    }
  }

  getPnrList() {
    // if(this.allSearchedPnr.length == 0) {
      // const dialogRef = this.dialog.open(ProgressDialogComponent);

      let data = JSON.parse(localStorage.getItem('token') || '{}');
      var token = data.token;

      this.ticketService.PnrSearch(token,'pnr=' , this.serachValue)
      .pipe(
              catchError((err) => {
        return NetworkUtil.handleErrorForAll2(err, this.snackBar);
      }),
        // finalize(() => dialogRef.close())
      ).subscribe(
        data => {
          if(data.body.status == 200) {
            this.onGettingPnrListSuccessfully(data.body);
          } else {
            if(data.body.ui_message != null){
              NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
            } else if(data.body.developer_message != null){
              NetworkUtil.showSnackBar(this.snackBar, data.body.developer_message);
            } else {
              NetworkUtil.showSnackBar(this.snackBar, 'Unable to get PNR data, please try again');
            }
          }
        }
      );
    
  }

  onGettingPnrListSuccessfully(data: any) {
    this.allSearchedPnr = [];

    for(var item of data.data) {
      let pnr = {
        id: item.id,
        number: item.pnr
      };

      this.allSearchedPnr.push(pnr);
      console.log(pnr)
    }
  }
  
  onSubmit() {
    if(this.pnr == null) {
      return;
    }
    this.dialogRef.close(this.pnr);
  }

}
