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
}
