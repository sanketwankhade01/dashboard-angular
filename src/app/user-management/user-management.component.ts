import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // ✅ added for navigation
import { UserManagementService } from './user-management.service';
import { AuthService } from '../auth.service';
import { LoginServiceService } from '../login/login-service.service';

interface User {
  id: number;
  username: string;
  email: string;
  company: string;
  role: string;
  status: 'Active' | 'Inactive';
}

interface Ticket {
  Uniqueid: number;
  ticket_no: string | number;
  ticket_category: string;
  ticket_details: string;
  ticket_creation_date: string | Date;
  ticket_closing_date?: string | Date | null;
  ticket_priority: 'High' | 'Medium' | 'Low';
  ticket_status: string;
  ticket_day_open?: number;
}

interface Comment {
  comment_id?: string | number;
  ticket_no: string | number;
  comment_text: string;
  author?: string;
  created_at?: string | Date;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  // 🔹 Sidebar + dark mode
  sidebarCollapsed = false;
  sidebarOpen = true;
  isDarkMode = false;
  activeMenu: string = 'user';

  // 🔹 Filters
  selectedDate: string = '';
  selectedCompany: string = '';
  availableDates: string[] = ['2023-01-01', '2023-02-01', '2023-03-01']; // example values
  companies: { name: string }[] = [
    { name: 'Acme Corp' },
    { name: 'Globex' },
    { name: 'Initech' }
  ];
  showAdvancedFilters: boolean = false;

  constructor(
    private router: Router,
    private userManagementService: UserManagementService,
    public auth: AuthService,
    private loginService: LoginServiceService
  ) {
    // this.getEmployees();
  } // ✅ inject Router

  ngOnInit(): void {
    // restore collapse/dark state from localStorage (keeps UI consistent with other pages)
    try {
      const collapsed = localStorage.getItem('helpdesk:collapsed');
      if (collapsed === '1') this.sidebarCollapsed = true;
      const dark = localStorage.getItem('helpdesk:isDark');
      if (dark === '1') this.isDarkMode = true;
    } catch {}

    // Try to auto-load tickets for the logged-in user's company from session
    try {
      const sess = this.loginService.getSession();
      if (sess) {
        const companyId = sess.Company_ID ?? sess.Emp_ID ?? null;
        const companyEmail = sess.Email_Id ?? null;
        if (companyId && companyEmail) {
          this.ticketCompanyId = String(companyId);
          this.ticketCompanyEmail = String(companyEmail);
          this.loadTickets(companyId, companyEmail);
        }
      }
    } catch (e) {
      // ignore session read errors
      console.error('Failed to read session for tickets', e);
    }
  }

  /**
   * Load tickets from backend for given company id / email. If params are not passed,
   * method will use `ticketCompanyId` and `ticketCompanyEmail` from component state.
   */
  loadTickets(companyId?: string | number, companyEmail?: string) {
    const id = companyId ?? this.ticketCompanyId;
    const email = companyEmail ?? this.ticketCompanyEmail;

    if (!id || !email) {
      this.ticketsError = 'companyId and companyEmail are required to load tickets.';
      return;
    }

    this.loadingTickets = true;
    this.ticketsError = null;
    this.userManagementService.getTicketsByCompany(id, email).subscribe({
      next: (res: any) => {
        // Accept either plain array or { data: [...] } shape
        const raw: any[] = Array.isArray(res) ? res : ((res as any)?.data || []);
        // Map API shape to local Ticket shape
        this.tickets = raw.map(r => this.mapApiTicket(r));
        this.loadingTickets = false;
      },
      error: (err: any) => {
        console.error('Failed to load tickets', err);
        this.ticketsError = err?.message || 'Failed to load tickets';
        this.loadingTickets = false;
      }
    });
  }

  private mapApiTicket(api: any): Ticket {
    // API example fields (PascalCase): Ticket_No, Ticket_Category, Ticket_Details, Ticket_Creation_Date, Ticket_Closing_Date, Ticket_Priority, Ticket_Status, Ticket_Day_Open
    const Uniqueid = api?.Uniqueid ?? '';
    const ticket_no = api?.Ticket_No ?? api?.TicketNo ?? api?.ticket_no ?? '';
    const ticket_category = api?.Ticket_Category ?? api?.TicketCategory ?? api?.ticket_category ?? '';
    const ticket_details = api?.Ticket_Details ?? api?.TicketDetails ?? api?.ticket_details ?? '';
    const ticket_creation_date = api?.Ticket_Creation_Date ?? api?.TicketCreationDate ?? api?.ticket_creation_date ?? null;
    const ticket_closing_date = api?.Ticket_Closing_Date ?? api?.TicketClosingDate ?? api?.ticket_closing_date ?? null;
    const priorityRaw = (api?.Ticket_Priority ?? api?.TicketPriority ?? api?.ticket_priority ?? '') as string;
    const ticket_priority = (priorityRaw?.toString().toLowerCase() === 'high') ? 'High' : (priorityRaw?.toString().toLowerCase() === 'medium' ? 'Medium' : 'Low');
    const ticket_status = api?.Ticket_Status ?? api?.TicketStatus ?? api?.ticket_status ?? '';
    const ticket_day_open_raw = api?.Ticket_Day_Open ?? api?.TicketDayOpen ?? api?.ticket_day_open ?? null;
    const ticket_day_open = ticket_day_open_raw != null ? Number(ticket_day_open_raw) : undefined;

    return {
      Uniqueid,
      ticket_no,
      ticket_category,
      ticket_details,
      ticket_creation_date,
      ticket_closing_date,
      ticket_priority,
      ticket_status,
      ticket_day_open
    } as unknown as Ticket;
  }

  applyFilters() {
    console.log('Filters applied:', this.selectedDate, this.selectedCompany);
  }

  // 🔹 Search & users
  searchText: string = '';
  users: User[] = [
    { id: 1, username: 'john_doe', email: 'john@example.com', company: 'Acme Corp', role: 'Admin', status: 'Active' },
    { id: 2, username: 'jane_smith', email: 'jane@example.com', company: 'Globex', role: 'Agent', status: 'Active' },
    { id: 3, username: 'rohit_k', email: 'rohit@example.com', company: 'Initech', role: 'Agent', status: 'Inactive' }
  ];

  // 🔹 Modal state
  showModal: boolean = false;
  editMode: boolean = false;
  // Default role changed to 'Agent' (we only support Admin and Agent)
  currentUser: User = { id: 0, username: '', email: '', company: '', role: 'Agent', status: 'Active' };

  // ====== Ticket state ======
  tickets: Ticket[] = [];
  // comments keyed by ticket_no
  commentsMap: { [ticketNo: string]: Comment[] } = {};
  // new comment input for modal
  currentCommentText: string = '';

  // Inputs for backend query (company id/email)
  ticketCompanyId: string = '';
  ticketCompanyEmail: string = '';

  loadingTickets: boolean = false;
  ticketsError: string | null = null;

  showTicketModal: boolean = false;
  ticketEditMode: boolean = false;
  currentTicket: Ticket = { Uniqueid: 0, ticket_no: 0, ticket_category: '', ticket_details: '', ticket_creation_date: new Date().toISOString(), ticket_closing_date: null, ticket_priority: 'Low', ticket_status: 'Open' };

  // ====== SIDEBAR / THEME METHODS ======
  toggleCollapse() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    try { localStorage.setItem('helpdesk:collapsed', this.sidebarCollapsed ? '1' : '0'); } catch {}
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    try { localStorage.setItem('helpdesk:isDark', this.isDarkMode ? '1' : '0'); } catch {}
  }

  selectMenu(name: string) {
    this.activeMenu = name;
    if (name === 'dashboard') {
      this.router.navigate(['/dashboard']); // navigate to dashboard
      return;
    }

    if (name === 'user') {
      this.router.navigate(['/user-management']);
      return;
    }

    if (name === 'myticket') {
      this.router.navigate(['/my-ticket']);
      return;
    }

    if (name === 'logout') {
      try { localStorage.clear(); } catch {}
      this.router.navigate(['/login']); // navigate to login
      return;
    }
  }

  // ====== USER MODAL / CRUD ======
  openModal(user?: User) {
    if (user) {
      this.editMode = true;
      this.currentUser = { ...user };
    } else {
      this.editMode = false;
      this.currentUser = { id: 0, username: '', email: '', company: '', role: 'Agent', status: 'Active' };
    }
    this.showModal = true;
  }

  saveUser() {
    if (this.editMode) {
      const index = this.users.findIndex(u => u.id === this.currentUser.id);
      if (index > -1) this.users[index] = { ...this.currentUser };
    } else {
      const newId = this.users.length ? Math.max(...this.users.map(u => u.id)) + 1 : 1;
      this.users.push({ ...this.currentUser, id: newId });
      this.currentUser.id = newId;
      this.userManagementService.createEmployee(this.currentUser).subscribe({
        next: (response:any) => {
          console.log('Employee saved:', response);
        },
        error: (err:any) => {
          console.error('Error saving employee:', err);
        }
      });
        }
        this.showModal = false;
  }

  deleteUser(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.users = this.users.filter(u => u.id !== id);
    }
  }

  // ====== TICKET MANAGEMENT ======
  openTicketModal(ticket?: Ticket) {
    if (ticket) {
      this.ticketEditMode = true;
      this.currentTicket = { ...ticket };
      // load existing comments for this ticket
      try {
        this.loadComments(this.currentTicket.ticket_no);
      } catch (e) {}
    } else {
      this.ticketEditMode = false;
      this.currentTicket = { Uniqueid: 0, ticket_no: this.getNextTicketNo(), ticket_category: '', ticket_details: '', ticket_creation_date: new Date().toISOString(), ticket_closing_date: null, ticket_priority: 'Low', ticket_status: 'Open' };
    }
    this.showTicketModal = true;
  }

  /** Load comments for the given ticket and store in commentsMap */
  loadComments(ticketNo: string | number) {
    const key = String(ticketNo);
    // clear existing while loading
    this.commentsMap[key] = this.commentsMap[key] || [];
    // try to use session or current query inputs to include company info
    const sess = (this.loginService as any)?.getSession?.();
    const companyId = sess?.Company_ID ?? sess?.Emp_ID ?? this.ticketCompanyId ?? null;
    const companyEmail = sess?.Email_Id ?? this.ticketCompanyEmail ?? null;

    this.userManagementService.getCommentsByTicket(ticketNo, companyId, companyEmail).subscribe({
      next: (res: any) => {
        // Normalize multiple possible response shapes:
        // - Array of comment objects
        // - { data: [...] }
        // - { Comments: 'c1,c2', Ticket_No: 'T..', added: [...] }
        let rawItems: any[] = [];
        if (Array.isArray(res)) {
          rawItems = res;
        } else if (res && Array.isArray(res.data)) {
          rawItems = res.data;
        } else if (res && typeof res.Comments === 'string') {
          // comma-separated string
          const parsed = String(res.Comments).split(',').map((s: string) => s.trim()).filter(Boolean);
          rawItems = parsed.map((txt: string) => ({ Comment_Text: txt }));
          if (Array.isArray(res.added)) {
            rawItems = rawItems.concat(res.added.map((t: any) => ({ Comment_Text: String(t) })));
          }
        } else if (res && typeof res === 'object' && Object.keys(res).length) {
          // single object fallback
          rawItems = [res];
        }

        this.commentsMap[key] = rawItems.map((c: any) => {
          if (typeof c === 'string') {
            return {
              comment_id: undefined,
              ticket_no: ticketNo,
              comment_text: c,
              author: '',
              created_at: null
            } as unknown as Comment;
          }

          const text = c?.Comment_Text ?? c?.comment ?? c?.comment_text ?? c?.text ?? c;
          return {
            comment_id: c?.Comment_ID ?? c?.comment_id ?? c?.id,
            ticket_no: c?.Ticket_No ?? c?.ticket_no ?? ticketNo,
            comment_text: text ?? '',
            author: c?.Author ?? c?.author ?? c?.CreatedBy ?? '',
            created_at: c?.Created_At ?? c?.created_at ?? c?.createdAt ?? null
          } as Comment;
        });
      },
      error: (err: any) => {
        console.error('Failed to load comments', err);
      }
    });
  }

  /** Add a comment to the current ticket via API and update UI */
  addComment() {
    if (!this.currentCommentText || !this.currentTicket) return;
    const ticketNo = this.currentTicket.ticket_no;
    const uniqueId = this.currentTicket?.Uniqueid;
    const sess = (this.loginService as any)?.getSession?.();
    const companyId = sess?.Company_ID ?? sess?.Emp_ID ?? this.ticketCompanyId ?? null;
    const companyEmail = sess?.Email_Id ?? this.ticketCompanyEmail ?? null;

    // Build payload using accepted parameter names per backend contract
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    const createdAt = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(hours12)}:${pad(now.getMinutes())}:${pad(now.getSeconds())} ${ampm}`;

    const payload: any = {
      Company_ID: companyId,
      Company_Email: companyEmail,
      Uniqueid: uniqueId,
      Ticket_No: ticketNo,
      comment: createdAt+' => '+this.currentCommentText,
    };

    this.userManagementService.addComment(payload).subscribe({
      next: (res: any) => {
        const key = String(ticketNo);
        this.commentsMap[key] = this.commentsMap[key] || [];

        // Handle shapes: { added: [...] }, { Comments: 'a,b' }, or returned objects/data
        if (res && Array.isArray(res.added)) {
          for (const txt of res.added) {
            this.commentsMap[key].push({
              comment_id: undefined,
              ticket_no: ticketNo,
              comment_text: String(txt),
              author: sess ? (sess.Emp_Name ?? sess.Email_Id ?? sess.Emp_ID) : undefined,
              created_at: new Date().toISOString()
            });
          }
        } else if (res && typeof res.Comments === 'string') {
          const parsed = String(res.Comments).split(',').map((s: string) => s.trim()).filter(Boolean);
          for (const txt of parsed) {
            this.commentsMap[key].push({
              comment_id: undefined,
              ticket_no: ticketNo,
              comment_text: String(txt),
              author: sess ? (sess.Emp_Name ?? sess.Email_Id ?? sess.Emp_ID) : undefined,
              created_at: new Date().toISOString()
            });
          }
        } else {
          const added = (res && (res.data || res)) ? (Array.isArray(res.data) ? res.data : res) : payload;
          if (Array.isArray(added)) {
            for (const a of added) {
              const text = a?.Comment_Text ?? a?.comment ?? a?.comment_text ?? a?.text ?? a;
              this.commentsMap[key].push({
                comment_id: a?.Comment_ID ?? a?.comment_id ?? a?.id,
                ticket_no: ticketNo,
                comment_text: String(text),
                author: a?.Author ?? a?.author ?? sess ? (sess.Emp_Name ?? sess.Email_Id ?? sess.Emp_ID) : undefined,
                created_at: a?.Created_At ?? a?.created_at ?? a?.createdAt ?? new Date().toISOString()
              });
            }
          } else {
            const a = added;
            const text = a?.Comment_Text ?? a?.comment ?? a?.comment_text ?? a?.text ?? this.currentCommentText;
            this.commentsMap[key].push({
              comment_id: a?.Comment_ID ?? a?.comment_id ?? a?.id,
              ticket_no: ticketNo,
              comment_text: String(text),
              author: a?.Author ?? a?.author ?? sess ? (sess.Emp_Name ?? sess.Email_Id ?? sess.Emp_ID) : undefined,
              created_at: a?.Created_At ?? a?.created_at ?? a?.createdAt ?? new Date().toISOString()
            });
          }
        }
        this.currentCommentText = '';
      },
      error: (err: any) => {
        console.error('Failed to add comment', err);
        // Optionally show an error toast
      }
    });
  }

  saveTicket() {
    if (this.ticketEditMode) {
      const idx = this.tickets.findIndex(t => String(t.ticket_no) === String(this.currentTicket.ticket_no));
      if (idx > -1) this.tickets[idx] = { ...this.currentTicket };
    } else {
      this.tickets.push({ ...this.currentTicket });
    }
    this.showTicketModal = false;
  }

  deleteTicket(ticket_no: string | number) {
    if (confirm('Are you sure you want to delete this ticket?')) {
      const key = String(ticket_no);
      this.tickets = this.tickets.filter(t => String(t.ticket_no) !== key);
    }
  }

  private getNextTicketNo(): string {
    // Extract numeric parts from ticket_no values and increment the max.
    const nums = this.tickets.map(t => {
      const s = String(t.ticket_no || '');
      const n = parseInt(s.replace(/\D/g, ''), 10);
      return isNaN(n) ? 0 : n;
    });
    const max = nums.length ? Math.max(...nums) : 1000;
    return `T${max + 1}`;
  }

  closeTicket(ticket: Ticket) {
  const idx = this.tickets.findIndex(t => String(t.ticket_no) === String(ticket.ticket_no));
    if (idx === -1) return;
    this.tickets[idx].ticket_status = 'Closed';
    this.tickets[idx].ticket_closing_date = new Date().toISOString();
    this.tickets[idx].ticket_day_open = this.calculateDaysOpen(this.tickets[idx].ticket_creation_date, this.tickets[idx].ticket_closing_date);
  }

  filteredTickets() {
    let result = this.tickets;
    if (this.searchText) {
      const t = this.searchText;
      result = result.filter(ticket =>
        (ticket.ticket_no?.toString() || '').includes(t) ||
        (ticket.ticket_category || '').toLowerCase().includes(t) ||
        (ticket.ticket_details || '').toLowerCase().includes(t) ||
        (ticket.ticket_status || '').toLowerCase().includes(t) ||
        (ticket.ticket_priority || '').toLowerCase().includes(t)
      );
    }
    return result;
  }

  calculateDaysOpen(created: string | Date | undefined, closed?: string | Date | null) {
    if (!created) return 0;
    const start = new Date(created as any);
    const end = closed ? new Date(closed as any) : new Date();
    const diff = Math.max(0, end.getTime() - start.getTime());
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  filteredUsers() {
    let result = this.users;

    if (this.selectedCompany) {
      result = result.filter(u => u.company === this.selectedCompany);
    }

    if (this.selectedDate) {
      console.log('Filtering by date:', this.selectedDate);
    }

    if (this.searchText) {
      const text = this.searchText.toLowerCase();
      result = result.filter(u =>
        u.username.toLowerCase().includes(text) ||
        u.email.toLowerCase().includes(text) ||
        u.company.toLowerCase().includes(text) ||
        u.role.toLowerCase().includes(text)
      );
    }

    return result;
  }

  getEmployees() {
    this.userManagementService.getEmployees().subscribe({
      next: (data:any) => {
        if (data && Array.isArray(data)) {
          this.users = data;
        console.log('Employees fetched:', data);
        }
      },
      error: (err:any) => {
        console.error('Error fetching employees:', err);
      }
    });
  }
}