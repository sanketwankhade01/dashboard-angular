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

    /**
     * Fetch tickets filtered by company id and company email.
     * Both query parameter keys are added (lowercase and PascalCase) to be
     * resilient to backend naming differences.
     *
     * Example request: /tickets?company_id=123&company_email=foo@bar.com
     */
    getTicketsByCompany(companyId: string | number, companyEmail: string): Observable<any[]> {
      if (!companyId || !companyEmail) {
        throw new Error('companyId and companyEmail are required');
      }

      let params = new HttpParams()
        .set('company_id', String(companyId))
        .set('Company_Email', String(companyEmail));

      // add alternate casing commonly seen in APIs
      return this.http.get<any[]>(AppSettings.endpoints.tickets, { params });
    }

    /**
     * Fetch comments for a given ticket number.
     * GET /comments?ticket_no=...
     */
    /**
     * Fetch comments for a given ticket number. Optionally include companyId/email
     * which some backends require.
     * GET /comments?ticket_no=...&company_id=... 
     */
    getCommentsByTicket(ticketNo: string | number, companyId?: string | number, companyEmail?: string): Observable<any[]> {
      if (ticketNo == null) throw new Error('ticketNo is required');
      let params = new HttpParams().set('Ticket_No', String(ticketNo));

      if (companyId) {
        params = params.set('Company_ID', String(companyId));
      }
      if (companyEmail) {
        params = params.set('Company_Email', String(companyEmail));
      }

      return this.http.get<any[]>(AppSettings.endpoints.getcomments, { params });
    }

    /**
     * Add a comment for a ticket.
     * POST /comments
     * Required JSON body (one of the accepted names must be present):
     *  - company_id or Company_ID (required)
     *  - company_email or Company_Email (required)
     *  - uniqueid or UniqueId or ticket_no or Ticket_No (required)
     *  - comment (string) or comments (list of strings) (required)
     */
    addComment(payload: any) {
      if (!payload) throw new Error('Payload is required');

      const hasCompany = payload.company_id || payload.Company_ID || payload.companyId || payload.CompanyId;
      const hasEmail = payload.company_email || payload.Company_Email || payload.companyEmail || payload.CompanyEmail;
      const hasUnique = payload.uniqueid || payload.UniqueId || payload.ticket_no || payload.Ticket_No || payload.uniqueId;
      const hasComment = (typeof payload.comment === 'string' && payload.comment.trim() !== '') || (Array.isArray(payload.comments) && payload.comments.length > 0) || payload.Comment_Text;

      if (!hasCompany || !hasEmail || !hasUnique || !hasComment) {
        // We don't throw here to allow more flexible callers, but log and still POST to let backend validate.
        console.warn('addComment: payload may be missing required fields', payload);
      }

      return this.http.put<any>(AppSettings.endpoints.addcomments, payload);
    }
}
