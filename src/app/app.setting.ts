import { environment } from '../environments/environment';

/**
 * Centralized application API routes.
 * Import `AppSettings.endpoints` where you need full endpoint URLs,
 * or use `AppSettings.apiUrl` for the base url.
 */
export const AppSettings = {
  apiUrl: environment.apiUrl,
  endpoints: {
    // Dashboard
    stats: `${environment.apiUrl}/stats`,
    charts: `${environment.apiUrl}/charts`,
    monthlyTrends: `${environment.apiUrl}/monthly-trends`,
    dates: `${environment.apiUrl}/dates`,
    productName: `${environment.apiUrl}/Product_Name`,
    companies: `${environment.apiUrl}/companies`,

    // User management
    employees: `${environment.apiUrl}/employees`, // create employee (POST)
    getEmployees: `${environment.apiUrl}/getemployees`, // list employees (GET)

    // Auth (placeholders - implement on backend if available)
    login: `${environment.apiUrl}/auth/login`,
    signup: `${environment.apiUrl}/auth/signup`
  }
};

export type AppSettingsType = typeof AppSettings;
