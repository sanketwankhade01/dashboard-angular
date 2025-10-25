import { Component } from '@angular/core';
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

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent {
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

  applyFilters() {
    console.log('Filters applied:', this.selectedDate, this.selectedCompany);
  }

  // 🔹 Search & users
  searchText: string = '';
  users: User[] = [
    { id: 1, username: 'john_doe', email: 'john@example.com', company: 'Acme Corp', role: 'Admin', status: 'Active' },
    { id: 2, username: 'jane_smith', email: 'jane@example.com', company: 'Globex', role: 'User', status: 'Active' },
    { id: 3, username: 'rohit_k', email: 'rohit@example.com', company: 'Initech', role: 'Manager', status: 'Inactive' }
  ];

  // 🔹 Modal state
  showModal: boolean = false;
  editMode: boolean = false;
  currentUser: User = { id: 0, username: '', email: '', company: '', role: 'User', status: 'Active' };

  // ====== SIDEBAR / THEME METHODS ======
  toggleCollapse() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
  }

  selectMenu(name: string) {
    this.activeMenu = name;

    if (name === 'dashboard') {
      this.router.navigate(['/dashboard']); // ✅ navigate to dashboard
    }

    if (name === 'logout') {
      localStorage.clear(); // optional: clear session
      this.router.navigate(['/login']); // ✅ navigate to login
    }
  }

  // ====== USER MODAL / CRUD ======
  openModal(user?: User) {
    if (user) {
      this.editMode = true;
      this.currentUser = { ...user };
    } else {
      this.editMode = false;
      this.currentUser = { id: 0, username: '', email: '', company: '', role: 'User', status: 'Active' };
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