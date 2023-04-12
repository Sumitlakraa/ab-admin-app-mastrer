import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  private ticketList_ApiUrl = environment.api_base_url + '/booking/ticket-list';
  private ticketDetail_ApiUrl = environment.api_base_url + '/route/route-based-pricing/list';
  private passengerMobileSerach_ApiUrl = environment.api_base_url + '/booking/ticket/search?';
  private pnrSerach_ApiUrl = environment.api_base_url + '/booking/ticket/search?';

  private updateTicketStatus_ApiUrl = environment.api_base_url + '/booking/ticket/update/';

  constructor(private http:HttpClient) { }

  ticketList(token: string, pageIndex: number, busId: string, passengerMobile: string, pnr: string, bookingDate: any, fromTown: string, toTown: string): Observable<any> {
    let params = new HttpParams();
    params = params.append('page', pageIndex);


    if(passengerMobile != null) {
      params = params.append('passenger_mobile', passengerMobile);
    }
    if(busId != null) {
      params = params.append('bus_id', busId);
    }
    if(pnr != null) {
      params = params.append('pnr', pnr);
    }
    if(bookingDate != null) {
      params = params.append('created_on', bookingDate);
    }
    if(toTown != null) {
      params = params.append('to_town', toTown);
    }
    if(fromTown != null) {
      params = params.append('from_town', fromTown);
    }

    return this.http.get<any>(
      this.ticketList_ApiUrl, 
      { 
        params: params,
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  passengerMobileSearch(token: string , param:string, passengerMobile: string): Observable<any>{
    return this.http.get<any>(
      this.passengerMobileSerach_ApiUrl + param + passengerMobile , 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  PnrSearch(token: string , param:string, pnr: string): Observable<any>{
    return this.http.get<any>(
      this.pnrSerach_ApiUrl + param + pnr ,
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  ticketDetail(token: string, ticketId: string): Observable<any> {
    return this.http.get<any>(
      this.ticketDetail_ApiUrl + ticketId, 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  updateTicketStatus(token: string, ticketId: string, data: any): Observable<any>{
    return this.http.put<any>(
      this.updateTicketStatus_ApiUrl + ticketId, 
      JSON.stringify(data), 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

}
