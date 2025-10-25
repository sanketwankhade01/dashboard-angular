import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export interface UserPayload {
  username: string;
  roles: string[];
  token?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private storageKey = 'app_user';

  constructor(private router: Router) {}

  login(payload: UserPayload) {
    if (typeof localStorage !== 'undefined') {
      try { localStorage.setItem(this.storageKey, JSON.stringify(payload)); } catch {}
    }
  }

  logout() {
    if (typeof localStorage !== 'undefined') {
      try { localStorage.removeItem(this.storageKey); } catch {}
    }
    try { this.router.navigate(['/login']); } catch {}
  }

  getUser(): UserPayload | null {
    try {
      if (typeof localStorage === 'undefined') return null;
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return null;
      return JSON.parse(raw) as UserPayload;
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean { return !!this.getUser(); }

  hasRole(role: string): boolean {
    const user = this.getUser();
    if (!user) return false;
    return user.roles?.includes(role);
  }

  // Convenience helpers
  getRoles(): string[] {
    const user = this.getUser();
    return user?.roles || [];
  }

  getRole(): string | null {
    const roles = this.getRoles();
    return roles.length ? roles[0] : null;
  }

  isAdmin(): boolean { return this.hasRole('Admin') || this.hasRole('admin'); }
  isUser(): boolean { return this.hasRole('User') || this.hasRole('user'); }
}
