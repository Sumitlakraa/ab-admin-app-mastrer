import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, of, throwError  } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BusService {

  private busList_ApiUrl = environment.api_base_url + '/bus/list';
  private submitData_ApiUrl = environment.api_base_url + '/bus/create';
  private updateData_ApiUrl = environment.api_base_url + '/bus/update/';
  private retrieveData_APIUrl = environment.api_base_url + '/bus/retrieve/';
  private searchOperator_APIUrl = environment.api_base_url + '/account/operator/search?mobile=';
  private busDelete_ApiUrl = environment.api_base_url + '/bus/delete-bus?bus_number=';

  constructor(private http:HttpClient) { }

  busList(token: string, pageIndex: number,busId: string|undefined,companyName: string|undefined, mobile: string|undefined): Observable<any> {
    let params = new HttpParams();
    params = params.append('page', pageIndex);

    if(companyName != null) {
      params = params.append('company_name', companyName);
    }
    if(busId != null) {
      params = params.append('bus_id', busId);
    }
    if(mobile != null) {
      params = params.append('operator_mobile_number', mobile);
    }

    return this.http.get<any>(
      this.busList_ApiUrl, 
      { 
        params: params,
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  submitData(token: string, data: any): Observable<any>{
    return this.http.post<any>(
      this.submitData_ApiUrl, 
      JSON.stringify(data), 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  updateData(token: string, busId: string, data: any) {
    return this.http.put<any>(
      this.updateData_ApiUrl + busId, 
      JSON.stringify(data), 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  retrieveData(token: string, busId: string): Observable<any>{
    return this.http.get<any>(
      this.retrieveData_APIUrl + busId, 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  searchOperator(token: string, search: string): Observable<any>{
    return this.http.get<any>(
      this.searchOperator_APIUrl + search, 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  deleteBus(token: string, busNumber: any): Observable<any>{
    return this.http.delete<any>(
      this.busDelete_ApiUrl + busNumber,  
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

}
