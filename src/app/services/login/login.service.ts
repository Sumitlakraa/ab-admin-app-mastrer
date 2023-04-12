import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private generateOtp_ApiUrl = environment.api_base_url + '/account/internal-user/otp/';
  private verifyOtp_ApiUrl = environment.api_base_url + '/account/internal-user/otp/verify/';
  private adminUserLogin_ApiUrl = environment.api_base_url + '/account/admin/login';

  constructor(private http:HttpClient) { }

  generateOtp(mobile: string): Observable<any>{
    return this.http.post<any>(
      this.generateOtp_ApiUrl, 
      JSON.stringify({'mobile': mobile, 'user_type': 'sales'}), 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8'} 
      }
      );
  }

  verifyOtp(mobile: string, otp: string): Observable<any>{
    return this.http.put<any>(
      this.verifyOtp_ApiUrl, 
      JSON.stringify({'mobile': mobile, 'otp': otp}), 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8'} 
      }
      );
  }

  adminUserLogin(data: any): Observable<any>{
    return this.http.post<any>(
      this.adminUserLogin_ApiUrl, 
      JSON.stringify(data), 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8'} 
      }
    );
  }

}
