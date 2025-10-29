import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // ✅ added for navigation
import { UserManagementService } from './user-management.service';
import { AuthService } from '../auth.service';

interface User {
  id: number;
  username: string;
  email: string;
  company: string;
  role: string;
  status: 'Active' | 'Inactive';
}

interface Ticket {
  ticket_no: string | number;
  ticket_category: string;
  ticket_details: string;
  ticket_creation_date: string | Date;
  ticket_closing_date?: string | Date | null;
  ticket_priority: 'High' | 'Medium' | 'Low';
  ticket_status: string;
  ticket_day_open?: number;
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

  constructor(private router: Router, private userManagementService: UserManagementService, public auth: AuthService) {
    this.getEmployees();
  } // ✅ inject Router

  ngOnInit(): void {
    // restore collapse/dark state from localStorage (keeps UI consistent with other pages)
    try {
      const collapsed = localStorage.getItem('helpdesk:collapsed');
      if (collapsed === '1') this.sidebarCollapsed = true;
      const dark = localStorage.getItem('helpdesk:isDark');
      if (dark === '1') this.isDarkMode = true;
    } catch {}
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
      ticket_no,
      ticket_category,
      ticket_details,
      ticket_creation_date,
      ticket_closing_date,
      ticket_priority,
      ticket_status,
      ticket_day_open
    } as Ticket;
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

  // Inputs for backend query (company id/email)
  ticketCompanyId: string = '';
  ticketCompanyEmail: string = '';

  loadingTickets: boolean = false;
  ticketsError: string | null = null;

  showTicketModal: boolean = false;
  ticketEditMode: boolean = false;
  currentTicket: Ticket = { ticket_no: 0, ticket_category: '', ticket_details: '', ticket_creation_date: new Date().toISOString(), ticket_closing_date: null, ticket_priority: 'Low', ticket_status: 'Open' };

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
    } else {
      this.ticketEditMode = false;
      this.currentTicket = { ticket_no: this.getNextTicketNo(), ticket_category: '', ticket_details: '', ticket_creation_date: new Date().toISOString(), ticket_closing_date: null, ticket_priority: 'Low', ticket_status: 'Open' };
    }
    this.showTicketModal = true;
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
      const t = this.searchText.toLowerCase();
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