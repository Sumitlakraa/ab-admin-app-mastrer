import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, of, throwError  } from 'rxjs';

import { environment } from '../../../environments/environment';
import { NumberInput } from '@angular/cdk/coercion';

@Injectable({
  providedIn: 'root'
})
export class OperatorService {

  private operatorsList_ApiUrl = environment.api_base_url + '/account/operator/list';
  private submitData_ApiUrl = environment.api_base_url + '/account/operator/create/';
  private updateData_ApiUrl = environment.api_base_url + '/account/operator/update/';
  private retrieveData_APIUrl = environment.api_base_url + '/account/operator/retrieve/';
  private searchOperatorsList_ApiUrl = environment.api_base_url + '/account/operator/search?';
  private createInvoice_ApiUrl = environment.api_base_url + '/operators/operator-invoice/create';
  private listInvoice_ApiUrl = environment.api_base_url + '/operators/operator-invoice/adminlist';
  private listPayment_ApiUrl = environment.api_base_url + '/operators/apnibus-payment-to-operator/list?requested_by=admin_panel_user';


  private updateOperatorInvoice_ApiUrl = environment.api_base_url + '/operators/operator-invoice/update/';
  private updateApnibusPayment_ApiUrl = environment.api_base_url + '/operators/apnibus-payment/update/';


  


  constructor(private http:HttpClient) { }

  operatorsList(token: string, pageIndex: number,companyName: string|undefined, ownerName: string|undefined, mobile: number|undefined): Observable<any> {
    let params = new HttpParams();
    params = params.append('page', pageIndex);

    if(companyName != null) {
      params = params.append('name', companyName);
    }
    if(ownerName != null) {
      params = params.append('owner', ownerName);
    }
    if(mobile != null) {
      params = params.append('mobile', mobile);
    }

    return this.http.get<any>(
      this.operatorsList_ApiUrl , 
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

  updateData(token: string, operatorId: string, data: any) {
    return this.http.put<any>(
      this.updateData_ApiUrl + operatorId, 
      JSON.stringify(data), 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  retrieveData(token: string, operatorId: string): Observable<any>{
    return this.http.get<any>(
      this.retrieveData_APIUrl + operatorId, 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  searchCompanyName(token: string, param: string,search: string): Observable<any>{
    return this.http.get<any>(
      this.searchOperatorsList_ApiUrl + param +search, 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  searchOwnerName(token: string, param: string, search: string): Observable<any>{
    return this.http.get<any>(
      this.searchOperatorsList_ApiUrl + param + search, 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  searchOwnerMobile(token: string, param:string, search: string): Observable<any>{
    return this.http.get<any>(
      this.searchOperatorsList_ApiUrl + param + search, 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  createInvoice(token: string, data: any): Observable<any>{
    return this.http.post<any>(
      this.createInvoice_ApiUrl, 
      JSON.stringify(data), 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  operatorsInvoiceList(token: string, pageIndex: number,companyName: string|undefined, ownerName: string|undefined, mobile: number|undefined, date: string|undefined): Observable<any>  {
    let params = new HttpParams();
    params = params.append('page', pageIndex);

    if(companyName != null) {
      params = params.append('comapny_name', companyName);
    }
    if(ownerName != null) {
      params = params.append('owner', ownerName);
    }
    if(mobile != null) {
      params = params.append('mobile', mobile);
    }
    if(date != null) {
      params = params.append('date', date);
    }

    return this.http.get<any>(
      this.listInvoice_ApiUrl , 
      { 
        params: params,
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  updateOperatorInvoice(token: string, operatorInvoiceId: string, data: any) {
    return this.http.put<any>(
      this.updateOperatorInvoice_ApiUrl + operatorInvoiceId, 
      JSON.stringify(data), 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }


  ApnibusPaymentList(token: string, companyName: string|undefined, ownerName: string|undefined, mobile: number|undefined): Observable<any>  {
    let params = new HttpParams();

    if(companyName != null) {
      params = params.append('comapny_name', companyName);
    }
    if(ownerName != null) {
      params = params.append('owner', ownerName);
    }
    if(mobile != null) {
      params = params.append('mobile', mobile);
    }


    return this.http.get<any>(
      this.listPayment_ApiUrl , 
      { 
        params: params,
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  updateApnibusPayment(token: string, apnibus_payment_id: string, data: any) {
    return this.http.put<any>(
      this.updateApnibusPayment_ApiUrl + apnibus_payment_id, 
      JSON.stringify(data), 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }






}
