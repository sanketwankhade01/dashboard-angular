import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const expectedRoles: string[] = route.data['roles'] || [];
    if (!this.auth.isLoggedIn()) return this.router.parseUrl('/login');
    if (expectedRoles.length === 0) return true;

    const has = expectedRoles.some(r => this.auth.hasRole(r));
    if (has) return true;

    // Optionally redirect to unauthorized page or login
    return this.router.parseUrl('/login');
  }
}
