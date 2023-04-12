import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, of, throwError  } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  private searchStateList_ApiUrl = environment.api_base_url + '/location/state/search?';

  private searchDistrictList_ApiUrl = environment.api_base_url + '/location/district/search?';
  private createDistrict_ApiUrl = environment.api_base_url + '/location/district/create/';
  private updateDistrict_ApiUrl = environment.api_base_url + '/location/district/update/';

  private searchTownList_ApiUrl = environment.api_base_url + '/location/town/search';
  private TownList_ApiUrl = environment.api_base_url + '/location/town/search?is_paginated=true';
  private createTown_ApiUrl = environment.api_base_url + '/location/town/create/';
  private updateTown_ApiUrl = environment.api_base_url + '/location/town/update/';

  private searchTownStoppageList_ApiUrl = environment.api_base_url + '/location/town-stoppage/search?';
  private TownStoppageList_ApiUrl = environment.api_base_url + '/location/town-stoppage/search?is_paginated=true';
  private createTownStoppage_ApiUrl = environment.api_base_url + '/location/town-stoppage/create/';
  private updateTownStoppage_ApiUrl = environment.api_base_url + '/location/town-stoppage/update/';

  private deleteTown_ApiUrl = environment.api_base_url + '/location/delete-town?town_id=';
  private deleteDistrict_ApiUrl = environment.api_base_url + '/location/delete-district?district_id=';
  private deleteTownStoppage_ApiUrl = environment.api_base_url + '/location/delete-town-stoppage?town_stoppage_id=';
  private NearByTownStoppages_ApiUrl = environment.api_base_url + '/location/nearby-town-stoppage?';
  private checkBusesInGeofenceRadius_ApiUrl = environment.api_base_url + '/location/near-by-positions';


  constructor(private http:HttpClient) { }

  searchState(token: string, search: string): Observable<any> {
    let params = new HttpParams();
    params = params.append('name', search);

    return this.http.get<any>(
      this.searchStateList_ApiUrl + search, 
      { 
        params: params,
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  searchDistrict(token: string, stateId: string, search: string): Observable<any> {
    let params = new HttpParams();
    params = params.append('state_id', stateId);
    params = params.append('name', search);

    return this.http.get<any>(
      this.searchDistrictList_ApiUrl + search, 
      { 
        params: params,
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  createDistrict(token: string, data: any): Observable<any>{
    return this.http.post<any>(
      this.createDistrict_ApiUrl, 
      JSON.stringify(data), 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  updateDistrict(token: string, districtId: string, data: any) {
    return this.http.put<any>(
      this.updateDistrict_ApiUrl + districtId, 
      JSON.stringify(data), 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  searchTown(token: string, districtId: string|undefined, search: string): Observable<any>{
    let params = new HttpParams();
    
    params = params.append('name', search);
    if(districtId != null) {
      params = params.append('district_id', districtId);
    }

    return this.http.get<any>(
      this.searchTownList_ApiUrl , 
      { 
        params: params,
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  createTown(token: string, data: any): Observable<any>{
    return this.http.post<any>(
      this.createTown_ApiUrl, 
      JSON.stringify(data), 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  updateTown(token: string, townId: string, data: any) {
    return this.http.put<any>(
      this.updateTown_ApiUrl + townId, 
      JSON.stringify(data), 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  searchTownStoppage(token: string, townId: string, search: string) {
    let params = new HttpParams();
    
    params = params.append('name', search);
    if(townId != null) {
      params = params.append('town_id', townId);
    }

    return this.http.get<any>(
      this.searchTownStoppageList_ApiUrl, 
      { 
        params: params,
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  townStoppageList(token: string, pageIndex: number,  townId: string, search: string) {
    let params = new HttpParams();
    params = params.append('page', pageIndex);
    
    params = params.append('name', search);
    if(townId != null) {
      params = params.append('town_id', townId);
    }

    return this.http.get<any>(
      this.TownStoppageList_ApiUrl, 
      { 
        params: params,
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  townList(token: string, pageIndex:number, districtId: string|undefined, search: string): Observable<any>{
    let params = new HttpParams();
    params = params.append('page', pageIndex);

    
    

    if(search != null){
      params = params.append('name', search);
    }

    if(search == null){
      params = params.append('name', '');
    }

    if(districtId != null) {
      params = params.append('district_id', districtId);
    }

    return this.http.get<any>(
      this.TownList_ApiUrl , 
      { 
        params: params,
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  createTownStoppage(token: string, data: any): Observable<any>{
    return this.http.post<any>(
      this.createTownStoppage_ApiUrl, 
      JSON.stringify(data), 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  updateTownStoppage(token: string, townStoppageId: string, data: any) {
    return this.http.put<any>(
      this.updateTownStoppage_ApiUrl + townStoppageId, 
      JSON.stringify(data), 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  deleteTown(token: string, townId: string ) {
    return this.http.delete<any>(
      this.deleteTown_ApiUrl + townId, 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  deletedistrict(token: string, districtId: string) {
    return this.http.delete<any>(
      this.deleteDistrict_ApiUrl + districtId, 

      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  deleteTownStoppage(token: string, townStoppageId: string ) {
    return this.http.delete<any>(
      this.deleteTownStoppage_ApiUrl + townStoppageId, 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  nearByTownStoppages(token: string,  latitude: any, longitude: any) {
    let params = new HttpParams();
    params = params.append('latitude', latitude);
    params = params.append('longitude', longitude);

    
    return this.http.get<any>(
      this.NearByTownStoppages_ApiUrl, 
      { 
        params: params,
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

    checkBusesInGeofenceRadius(token: string, town_stoppage_id: string) {
      let params = new HttpParams();
      params = params.append('town_stoppage_id', town_stoppage_id);  
      
      return this.http.get<any>(
        this.checkBusesInGeofenceRadius_ApiUrl, 
        { 
          params: params,
          observe: 'response', 
          responseType: 'json',
          headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
        }
      );
  }



}
