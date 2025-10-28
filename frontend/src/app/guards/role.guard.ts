import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SessionService } from '../services/session.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);
  
  if (!sessionService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }
  
  const requiredRoles = route.data['roles'] as string[];
  const userData = sessionService.getUserData();
  const userRole = userData?.role?.toUpperCase();
  
  if (requiredRoles && requiredRoles.length > 0) {
    if (requiredRoles.some(role => role.toUpperCase() === userRole)) {
      return true;
    } else {
      switch (userRole) {
        case 'ADMIN':
          router.navigate(['/admin-dashboard']);
          break;
        case 'LIBRARIAN':
          router.navigate(['/librarian-dashboard']);
          break;
        case 'USER':
          router.navigate(['/dashboard']);
          break;
        default:
          router.navigate(['/login']);
      }
      return false;
    }
  }
  
  return true;
};
