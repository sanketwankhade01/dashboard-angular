import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AppSettings } from '../app.setting';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }
  createEmployee(reqObj: any) {
    if (!reqObj || Object.keys(reqObj).length === 0) {
      throw new Error('Request object is empty or undefined');
    }
    const payload = {
      Emp_ID: reqObj.id,
      Emp_Name: reqObj.username,
      Email_Id: reqObj.email,
      Company_ID: reqObj.company,
      Role: reqObj.role,
      Status: reqObj.status
    };

  return this.http.post<any>(AppSettings.endpoints.employees, payload);
  }

   getEmployees(): Observable<any[]> {
  return this.http.get<any[]>(AppSettings.endpoints.getEmployees);
    }
}
