import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
  const requiredRoles: string[] = (route.data && (route.data as any)['roles']) || [];

    if (!this.auth.isLoggedIn()) {
      return this.router.parseUrl('/login');
    }

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const hasAny = requiredRoles.some(r => this.auth.hasRole(r));
    if (hasAny) return true;

    // Not allowed - redirect to dashboard or login
    return this.router.parseUrl('/dashboard');
  }
}
