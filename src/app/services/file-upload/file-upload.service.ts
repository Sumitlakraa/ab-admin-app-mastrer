import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  private photoUploadUrl_OperatorDocs = environment.api_base_url + '/admin_app/upload-operator-account-docs/';
  private deleteUrl_OperatorDocs = environment.api_base_url + '/admin_app/operator-account-image-destroy/';

  private photoUploadUrl_BusDocs = environment.api_base_url + '/admin_app/upload-bus-docs/';
  private deleteUrl_BusDocs = environment.api_base_url + '/admin_app/bus-image-destroy/';

  private csvUploadUrl_ConductorPricing = environment.api_base_url + '/bus/bvrp/conductor/upload';

  private csvUploadUrl_CommuterPricing = environment.api_base_url + '/bus/bvrp/commuter/upload';

  private Upload_notificationImage = environment.api_base_url + '/notification/upload/assets';




  constructor(private http: HttpClient) { }

  uploadOperatorDocs(token: string, idKey: string, idValue: string, fileType: string, file: File): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append(idKey, idValue);
    formData.append('image_type', fileType);
    formData.append('image_file', file);

    const req = new HttpRequest('POST', this.photoUploadUrl_OperatorDocs, formData, {
      reportProgress: true,
      responseType: 'json',
      headers:  new HttpHeaders({ 'Authorization': 'Token ' + token })
    });
    return this.http.request(req);
  }

  deleteOperatorDoc(token: string, imageId: string) {
    return this.http.delete<any>(
      this.deleteUrl_OperatorDocs + imageId, 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  uploadBusDocs(token: string, idKey: string, idValue: string, fileType: string, file: File): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append(idKey, idValue);
    formData.append('image_type', fileType);
    formData.append('image_file', file);

    const req = new HttpRequest('POST', this.photoUploadUrl_BusDocs, formData, {
      reportProgress: true,
      responseType: 'json',
      headers:  new HttpHeaders({ 'Authorization': 'Token ' + token })
    });
    return this.http.request(req);
  }

  deleteBusDoc(token: string, imageId: string) {
    return this.http.delete<any>(
      this.deleteUrl_BusDocs + imageId, 
      { 
        observe: 'response', 
        responseType: 'json',
        headers: {'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Token ' + token} 
      }
    );
  }

  uploadConductorPricing(file: File, token: string,): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append('pricing_file', file);

    return this.http.put<any>( this.csvUploadUrl_ConductorPricing, formData, {
      reportProgress: true,
      responseType: 'json',
      // headers:  new HttpHeaders({ })
      headers:  new HttpHeaders({ 'Authorization': 'Token ' + token })

    });;
  }

  uploadCommuterPricing(file: File, token: string): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append('pricing_file', file);

    const req = new HttpRequest('PUT', this.csvUploadUrl_CommuterPricing, formData, {
      reportProgress: true,
      responseType: 'json',
      // headers:  new HttpHeaders({ })
      headers:  new HttpHeaders({ 'Authorization': 'Token ' + token })

    });
    return this.http.request(req);
  }

  uploadNotificationImage(file: File, token: string): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    
    formData.append('img_file', file,);



    const req = new HttpRequest('POST', this.Upload_notificationImage, formData, {
      reportProgress: true,
      responseType: 'json',
      // headers:  new HttpHeaders({ })
      headers:  new HttpHeaders({ 'Authorization': 'Token ' + token })

    });
    return this.http.request(req);
  }



}
