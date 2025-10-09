import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export interface UserPayload {
  username: string;
  roles: string[];
  token?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private storageKey = 'app_user';

  constructor(private router: Router) {}

  login(payload: UserPayload) {
    // In a real app you'd call backend and receive JWT + roles.
    // Here store payload in localStorage for demo.
    localStorage.setItem(this.storageKey, JSON.stringify(payload));
  }

  logout() {
    localStorage.removeItem(this.storageKey);
    this.router.navigate(['/login']);
  }

  getUser(): UserPayload | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserPayload;
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getUser();
  }

  hasRole(role: string): boolean {
    const user = this.getUser();
    if (!user) return false;
    return user.roles?.includes(role);
  }
}
