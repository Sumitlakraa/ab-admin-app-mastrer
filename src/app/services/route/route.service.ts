import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, of, throwError  } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RouteService {

  private routeList_ApiUrl = environment.api_base_url + '/route/route/list';
  private routeDetails_ApiUrl = environment.api_base_url + '/route/route-town/list?route_id=';

  private createRoute_ApiUrl = environment.api_base_url + '/route/route/create/';
  private cloneRoute_ApiUrl = environment.api_base_url + '/route/route/clone' ;

  private createRouteTown_ApiUrl = environment.api_base_url + '/route/route-town/create/';
  private updateRouteTown_ApiUrl = environment.api_base_url + '/route/route-town/update/';

  private createRouteTownBoardingPoint_ApiUrl = environment.api_base_url + '/route/route-town-stoppage/create/';
  private updateRouteTownBoardingPoint_ApiUrl = environment.api_base_url + '/route/route-town-stoppage/update/';

  private createViaRoute_ApiUrl = environment.api_base_url + '/route/create-via-route';

  private deleteRoute_apiUrl = environment.api_base_url + '/route/delete-route?route_id=';

  private createFirstRouteTown_ApiUrl = environment.api_base_url + '/route/route-town/add-new-town-on-top';

  private createReverseRoute_ApiUrl = environment.api_base_url + '/route/reverse-route';


  constructor(private http:HttpClient) { }

  routeList(token: string, pageIndex: number,routeId: string|undefined): Observable<any> {
    let params = new HttpParams();
    params = params.append('page', pageIndex);

    if(routeId != null) {
      params = params.append('route_id', routeId);
    }

    return this.http.get<any>(
      this.routeList_ApiUrl, 
      { 
        params: params,
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  routeDetails(token: string, routeId: string): Observable<any>{
    return this.http.get<any>(
      this.routeDetails_ApiUrl + routeId, 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  createRoute(token: string, data: any): Observable<any>{
    return this.http.post<any>(
      this.createRoute_ApiUrl, 
      JSON.stringify(data), 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  cloneRoute(token: string, data: any): Observable<any>{
    return this.http.post<any>(
      this.cloneRoute_ApiUrl, 
      JSON.stringify(data), 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  createRouteTown(token: string, data: any): Observable<any>{
    return this.http.post<any>(
      this.createRouteTown_ApiUrl, 
      JSON.stringify(data), 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  createFirstRouteTown(token: string, data: any): Observable<any>{
    return this.http.post<any>(
      this.createFirstRouteTown_ApiUrl, 
      JSON.stringify(data), 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  updateRouteTown(token: string, routeTownId: string, data: any): Observable<any>{
    return this.http.put<any>(
      this.updateRouteTown_ApiUrl + routeTownId, 
      JSON.stringify(data), 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  createRouteTownBoardingPoint(token: string, data: any): Observable<any>{
    return this.http.post<any>(
      this.createRouteTownBoardingPoint_ApiUrl, 
      JSON.stringify(data), 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  updateRouteTownBoardingPoint(token: string, routeTownBoardingPointId: string, data: any): Observable<any>{
    return this.http.put<any>(
      this.updateRouteTownBoardingPoint_ApiUrl + routeTownBoardingPointId, 
      JSON.stringify(data), 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }


  createViaRoute(token: string, data: any): Observable<any>{
    return this.http.post<any>(
      this.createViaRoute_ApiUrl, 
      JSON.stringify(data), 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  deleteRoute(token: string, routeId: any): Observable<any>{
    return this.http.delete<any>(
      this.deleteRoute_apiUrl + routeId, 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  createReverseRoute(token: string, data: any): Observable<any>{
    return this.http.post<any>(
      this.createReverseRoute_ApiUrl, 
      JSON.stringify(data), 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

}
