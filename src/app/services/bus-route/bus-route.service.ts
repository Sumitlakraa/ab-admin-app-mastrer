import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BusRouteService {

  private busRouteList_ApiUrl = environment.api_base_url + '/bus/bus-route/list';
  private searchBus_ApiUrl = environment.api_base_url + '/bus/search?bus_number=';
  private searchRoute_ApiUrl = environment.api_base_url + '/route/route/admin-search?name=';
  private createBusRoute_ApiUrl = environment.api_base_url + '/bus/bus-route/create/';
  private updateBusRoute_ApiUrl = environment.api_base_url + '/bus/bus-route/update/';
  private busRouteDetail_ApiUrl = environment.api_base_url + '/bus/bus-route-town-mapping/create/';
  private updateBusRouteTown_ApiUrl = environment.api_base_url + '/bus/bus-route-town/update/';
  private updateBusRouteTownBoardingPoint_ApiUrl = environment.api_base_url + '/bus/bus-route-town-stoppage/update/';
  private viaRouteList_ApiUrl = environment.api_base_url + '/bus/bus-via-route/create/';
  private updateViaRouteStatus_ApiUrl = environment.api_base_url + '/bus/bus-via-route/update/';
  private busRouteStoppageList_ApiUrl = environment.api_base_url + '/bus/bus-route-town-stoppage/list?bus_route_id=';
  private createBusRouteJourney_ApiUrl = environment.api_base_url + '/bus/extend-bus-route-journeys';
  private busRouteJourneyList_ApiUrl = environment.api_base_url + '/bus/bus-route-journey';
  private busRouteJourneyUpdate_ApiUrl = environment.api_base_url + '/bus/update-bus-route-journey/';
  private searchStartAndEndTown_ApiUrl = environment.api_base_url + '/bus/bus-via-route/list?bus_route_id=';
  private getViaRouteList_ApiUrl = environment.api_base_url + '/bus/bus-via-route/list?is_paginated=False';
  private deleteBusRouteMapping_ApiUrl = environment.api_base_url + '/bus/delete-bus-route?bus_route_id=';

  constructor(private http:HttpClient) { }

  busRouteList(token: string, pageIndex: number, busId: string|undefined, routeId: string|undefined, busStatus: string|undefined): Observable<any> {
    let params = new HttpParams();
    params = params.append('page', pageIndex);

    if(busId != null) {
      params = params.append('bus_id', busId);
    }
    if(routeId != null) {
      params = params.append('route_id', routeId);
    }
    if(busStatus != null) {
      params = params.append('bus_status', busStatus);
    }

    return this.http.get<any>(
      this.busRouteList_ApiUrl, 
      { 
        params: params,
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  searchBus(token: string, search: string): Observable<any>{
    return this.http.get<any>(
      this.searchBus_ApiUrl + search, 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  searchRoute(token: string, search: string): Observable<any>{
    return this.http.get<any>(
      this.searchRoute_ApiUrl + search, 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  // searchStartTown1(token: string, search: string|undefined,): Observable<any>{ 
    
  //   return this.http.get<any>(
  //     this.searchStartAndEndTown_ApiUrl , 
  //     { 
  //       observe: 'response', 
  //       responseType: 'json',
  //       headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
  //     }
  //   );
  // }

  searchStartTown(token: string, search: any): Observable<any> {
    return this.http.get<any>(
      this.searchStartAndEndTown_ApiUrl  + search, 
      // JSON.stringify(body), 
      { 

        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  searchEndTown(token: string, busId: string|undefined, search: string): Observable<any>{
    return this.http.get<any>(
      this.searchStartAndEndTown_ApiUrl + busId + search,
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  createBusRoute(token: string, data: any): Observable<any>{
    return this.http.post<any>(
      this.createBusRoute_ApiUrl, 
      JSON.stringify(data), 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  updateBusRoute(token: string, busRouteId: string, data: any) {
    return this.http.put<any>(
      this.updateBusRoute_ApiUrl + busRouteId, 
      JSON.stringify(data), 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  routeDetails(token: string, data: any): Observable<any>{
    return this.http.post<any>(
      this.busRouteDetail_ApiUrl, 
      JSON.stringify(data), 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  updateBusRouteTown(token: string, busRouteTownId: string, data: any): Observable<any>{
    return this.http.put<any>(
      this.updateBusRouteTown_ApiUrl + busRouteTownId, 
      JSON.stringify(data), 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  updateBusRouteTownBoardingPoint(token: string, routeTownBoardingPointId: string, data: any): Observable<any>{
    return this.http.put<any>(
      this.updateBusRouteTownBoardingPoint_ApiUrl + routeTownBoardingPointId, 
      JSON.stringify(data), 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  createViaRouteList(token: string, body: any): Observable<any> {
    let params = new HttpParams();

    return this.http.post<any>(
      this.viaRouteList_ApiUrl,     
      JSON.stringify(body), 
      { 
        params: params,
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  getViaRouteList(token: string, busRouteId: any, startTown:string , endTown:string): Observable<any> {
    let params = new HttpParams();

    if(startTown != null) {
      params = params.append('start_town_id', startTown);
    }
    if(busRouteId != null) {
      params = params.append('bus_route_id', busRouteId);
    }
    if(endTown != null) {
      params = params.append('end_town_id', endTown);
    }
    return this.http.get<any>(
      this.getViaRouteList_ApiUrl,
      { 
        params: params,
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  updateViaRouteStatus(token: string, viaRouteId: string, data: any): Observable<any>{
    return this.http.put<any>(
      this.updateViaRouteStatus_ApiUrl + viaRouteId, 
      JSON.stringify(data), 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  busRouteStoppageList(token: string, busRouteId: string): Observable<any>{
    return this.http.get<any>(
      this.busRouteStoppageList_ApiUrl + busRouteId, 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  createJourneys(token: string, body: any): Observable<any> {
    return this.http.post<any>(
      this.createBusRouteJourney_ApiUrl, 
      JSON.stringify(body), 
      { 

        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  busRouteJourneyList(token: string, busRouteId: string): Observable<any> {
    let params = new HttpParams();
    params = params.append('bus_route_id', busRouteId);

    return this.http.get<any>(
      this.busRouteJourneyList_ApiUrl, 
      { 
        params: params,
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  busRouteJourneyUpdate(token: string, busRouteJourneyId: string, data: any): Observable<any>{
    return this.http.put<any>(
      this.busRouteJourneyUpdate_ApiUrl + busRouteJourneyId, 
      JSON.stringify(data), 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  deleteBusRouteMapping(token: string, busRouteJourneyId: string, ): Observable<any>{
    return this.http.delete<any>(
      this.deleteBusRouteMapping_ApiUrl + busRouteJourneyId,
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }
}
