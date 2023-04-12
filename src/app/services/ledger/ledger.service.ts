import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LedgerService {

  private operatorLevelDetails_ApiUrl = environment.api_base_url + '/route/route-based-pricing/list';
  private busLevelDetails_ApiUrl = environment.api_base_url + '/route/route-based-pricing/list';
  private ticketLevelDetails_ApiUrl = environment.api_base_url + '/route/route-based-pricing/list';

  constructor(private http:HttpClient) { }

  operatorLevelDetails(token: string, pageIndex: number): Observable<any> {
    let params = new HttpParams();
    params = params.append('page', pageIndex);

    return this.http.get<any>(
      this.operatorLevelDetails_ApiUrl, 
      { 
        params: params,
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  busLevelDetails(token: string, pageIndex: number): Observable<any> {
    let params = new HttpParams();
    params = params.append('page', pageIndex);

    return this.http.get<any>(
      this.busLevelDetails_ApiUrl, 
      { 
        params: params,
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  ticketLevelDetails(token: string, pageIndex: number): Observable<any> {
    let params = new HttpParams();
    params = params.append('page', pageIndex);

    return this.http.get<any>(
      this.ticketLevelDetails_ApiUrl, 
      { 
        params: params,
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

}
