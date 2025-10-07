import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChartType } from 'chart.js';

export interface ChartDataset {
  label?: string;
  data: number[];
  backgroundColor?: string[] | string;
  borderColor?: string;
  fill?: boolean;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartResponse {
  title: string;
  type: ChartType;
  data: ChartData;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://127.0.0.1:5000/api';

  constructor(private http: HttpClient) {}

  // 🔹 Stats API
  getStats(date?: string, Product_Name?: string,Company_Name?: string ,filterType: string = 'all', filterValue: string = ''): Observable<any[]> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    if (Product_Name) params = params.set('Product_Name', Product_Name);
    if (Company_Name) params = params.set('Company_Name', Company_Name);
    if (filterType && filterType !== 'all') params = params.set('filterType', filterType);
    if (filterValue) params = params.set('filterValue', filterValue);

    return this.http.get<any[]>(`${this.apiUrl}/stats`, { params });
  }

  // 🔹 Charts API
  getCharts(date?: string, filterType: string = 'all', filterValue: string = ''): Observable<ChartResponse[]> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    if (filterType && filterType !== 'all') params = params.set('product', filterType);
    if (filterValue) params = params.set('company', filterValue);

    return this.http.get<ChartResponse[]>(`${this.apiUrl}/charts`, { params });
  }

  // 🔹 Monthly trends API
  getMonthlyTrends(filterType: string = 'all', filterValue: string = ''): Observable<ChartData> {
    let params = new HttpParams();
    if (filterType && filterType !== 'all') params = params.set('product', filterType);
    if (filterValue) params = params.set('company', filterValue);

    return this.http.get<ChartData>(`${this.apiUrl}/monthly-trends`, { params });
  }

  // 🔹 Dates API
  getDates(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/dates`);
  }

  // 🔹 Employees as Product_Name API
  getEmployees(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Product_Name`);
  }

  // 🔹 Companies API
  getCompanies(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/companies`);
  }
}




