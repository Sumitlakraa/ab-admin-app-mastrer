import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PricingService {

  private routePricingList_ApiUrl = environment.api_base_url + '/route/route-based-pricing/list';
  private updateRoutePricing_ApiUrl = environment.api_base_url + '/route/base-via-route-pricing/update/';

  private busSpecificPricingList_ApiUrl = environment.api_base_url + '/bus/bus-via-route-pricing/list';
  private updatebusSpecificPricing_ApiUrl = environment.api_base_url + '/bus/bus-via-route-pricing/update/';
  
  private conductorPricingList_ApiUrl = environment.api_base_url + '/bus/bus-via-route-pricing/list';
  private updateconductorPricingList_ApiUrl = environment.api_base_url + '/bus/bus-via-route-pricing/update/';

  private downloadPricingList_ApiUrl = environment.api_base_url + '/bus/bvrp/export';

  private downloadCommuterPricingList_ApiUrl = environment.api_base_url + '/bus/bvrp/export';

  private autoFillPricing_ApiUrl = environment.api_base_url + '/bus/bvrp/auto-fill'

  constructor(private http:HttpClient) { }

  routePricingList(token: string, pageIndex: number, 
    category: string|undefined, routeId: string|undefined, fromTownId: string|undefined, toTownId: string|undefined, acState: boolean|undefined,
    sortingColumn: string, sortingOrder: string): Observable<any> {
    let params = new HttpParams();
    params = params.append('page', pageIndex);

    if(category != null) {
      params = params.append('bus_category', category);      
    }
    if(routeId != null) {
      params = params.append('route_id', routeId);
    }
    if(fromTownId != null) {
      params = params.append('from_town_id', fromTownId);
    }
    if(toTownId != null) {
      params = params.append('to_town_id', toTownId);
    }
    if(acState != null) {
      params = params.append('is_air_conditioned', acState ? 'True': 'False');
    }

    if(sortingOrder.length > 0) {
      if(sortingColumn == 'seater') {
        params = params.append('seater_order', sortingOrder.toUpperCase());
      } else if(sortingColumn == 'sharing_sleeper') {
        params = params.append('sharing_sleeper_order', sortingOrder.toUpperCase());
      } else if(sortingColumn == 'single_sleeper') {
        params = params.append('single_sleeper_order', sortingOrder.toUpperCase());
      }
    }

    return this.http.get<any>(
      this.routePricingList_ApiUrl, 
      { 
        params: params,
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  updateRoutePricing(token: string, id: string, data: any): Observable<any>{
    return this.http.put<any>(
      this.updateRoutePricing_ApiUrl + id, 
      JSON.stringify(data), 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  busSpecificPricingList(token: string, pageIndex: number, 
    category: string|undefined, busId: string|undefined, fromTownId: string|undefined, toTownId: string|undefined, acState: boolean|undefined,
    sortingColumn: string, sortingOrder: string): Observable<any> {
    let params = new HttpParams();
    params = params.append('page', pageIndex);

    if(category != null) {
      params = params.append('bus_category', category);      
    }
    if(busId != null) {
      params = params.append('bus_id', busId);
    }
    if(fromTownId != null) {
      params = params.append('from_town_id', fromTownId);
    }
    if(toTownId != null) {
      params = params.append('to_town_id', toTownId);
    }
    if(acState != null) {
      params = params.append('is_air_conditioned', acState ? 'True': 'False');
    }

    if(sortingOrder.length > 0) {
      if(sortingColumn == 'seater') {
        params = params.append('seater_order', sortingOrder.toUpperCase());
      } else if(sortingColumn == 'sharing_sleeper') {
        params = params.append('sharing_sleeper_order', sortingOrder.toUpperCase());
      } else if(sortingColumn == 'single_sleeper') {
        params = params.append('single_sleeper_order', sortingOrder.toUpperCase());
      }
    }
    
    return this.http.get<any>(
      this.busSpecificPricingList_ApiUrl, 
      { 
        params: params,
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  updatebusSpecificPricing(token: string, id: string, data: any): Observable<any>{
    return this.http.put<any>(
      this.updatebusSpecificPricing_ApiUrl + id, 
      JSON.stringify(data), 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  conductorPricingList(token: string, pageIndex: number, 
    category: string|undefined, busId: string|undefined, fromTownId: string|undefined, toTownId: string|undefined, acState: boolean|undefined,
    sortingColumn: string, sortingOrder: string, pricingType: string|undefined): Observable<any> {
    let params = new HttpParams();
    params = params.append('page', pageIndex);

    if(category != null) {
      params = params.append('bus_category', category);      
    }
    if(busId != null) {
      params = params.append('bus_id', busId);
    }
    if(fromTownId != null) {
      params = params.append('from_town_id', fromTownId);
    }
    if(toTownId != null) {
      params = params.append('to_town_id', toTownId);
    }
    if(acState != null) {
      params = params.append('is_air_conditioned', acState ? 'True': 'False');
    }
    if(pricingType != null) {
      params = params.append('pricing_type', 'conductor' );
    }

    if(sortingOrder.length > 0) {
      if(sortingColumn == 'seater') {
        params = params.append('conductor_seater_order', sortingOrder.toUpperCase());
      } else if(sortingColumn == 'sharing_sleeper') {
        params = params.append('conductor_sharing_sleeper_order', sortingOrder.toUpperCase());
      } else if(sortingColumn == 'single_sleeper') {
        params = params.append('conductor_single_sleeper_order', sortingOrder.toUpperCase());
      }
    }
    
    return this.http.get<any>(
      this.conductorPricingList_ApiUrl, 
      { 
        params: params,
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  updateconductorPricing(token: string, id: string, data: any, pricingType: string|undefined): Observable<any>{
    let params = new HttpParams();
    if(pricingType != null) {
      params = params.append('pricing_type', 'conductor' );
    }
    return this.http.put<any>(
      this.updateconductorPricingList_ApiUrl + id , 
      JSON.stringify(data), 
      { 
        params: params,
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }
//getUrlToDownloadBusRoutepricing  this method is used for download conductor price
  getUrlToDownloadBusRoutepricing(id: string): string {
    return this.downloadPricingList_ApiUrl + '?is_commuter=False&' + 'bus_route_id='+ id;
  }

  getUrlToDownloadCommuterBusRoutepricing(id: string): string {
    return this.downloadCommuterPricingList_ApiUrl + '?is_commuter=True&' + 'bus_route_id='+ id;
  }

  autoFillPricing(token: string, data: any): Observable<any>{

    // let params = new HttpParams();
    // params = params.append('bus_route_id=', bus_route_id);


    return this.http.post<any>(
      this.autoFillPricing_ApiUrl, 
      JSON.stringify(data), 
      { 
        
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }
}
