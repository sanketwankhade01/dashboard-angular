import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppSettings } from '../app.setting';

const httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'  })
  };

@Injectable({
  providedIn: 'root'
})
export class LoginServiceService {

  constructor(private http: HttpClient) { 

  }
  getEmpLogin(email: string, password: string): Observable<any> {
   const  payload= {
      email: email,
      password: password,
    };

    return this.http.post<any>(AppSettings.endpoints.login,payload,httpOptions);
  }

  // Session helpers stored in sessionStorage (per-request)
  saveSession(payload: { Emp_ID: string | number; Emp_Name: string; Email_Id: string; Company_ID: string | number; App_Role: string | string[] }) {
    if (!payload) return;
    try {
      if (typeof sessionStorage === 'undefined') return;
      sessionStorage.setItem('app_session', JSON.stringify(payload));
    } catch (err) {
      console.error('Failed to save session', err);
    }
  }

  getSession(){
   try {
      if (typeof sessionStorage === 'undefined') return null;
      const raw = sessionStorage.getItem('app_session');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      console.error('Failed to read session', err);
      return null;
    }
  }
}
