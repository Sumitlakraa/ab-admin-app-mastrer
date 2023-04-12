import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConcessionService {

  private ticketConcessionList_ApiUrl = environment.api_base_url + '/booking/ticket-concession-list';
  private CRUDTicketConcession_ApiUrl = environment.api_base_url + '/booking/ticket/concession/';

  constructor(private http:HttpClient) { }
  
  ticketConcessionList(token: string, busNumber: string): Observable<any> {
    let params = new HttpParams();

    if(busNumber != null) {
      params = params.append('bus_number', busNumber);
    }

    return this.http.get<any>(
      this.ticketConcessionList_ApiUrl, 
      { 
        params: params,
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  updateTicketConcession(token: string, id: string, data: any): Observable<any>{
    return this.http.put<any>(
      this.CRUDTicketConcession_ApiUrl + id +'/', 
      JSON.stringify(data), 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  createTicketConcession(token: string, data: any): Observable<any>{
    return this.http.post<any>(
      this.CRUDTicketConcession_ApiUrl, 
      JSON.stringify(data), 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

}
