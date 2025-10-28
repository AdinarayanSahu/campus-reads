import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SessionService } from '../services/session.service';

export const authGuard: CanActivateFn = (route, state) => {
    const sessionService = inject(SessionService);
    const router = inject(Router);
    if (sessionService.isLoggedIn()) {
        const requiredRoles = route.data['roles'] as string[];
        if (requiredRoles && requiredRoles.length > 0) {
            const userData = sessionService.getUserData();
            const userRole = userData?.role?.toUpperCase();
            if (requiredRoles.some(role => role.toUpperCase() === userRole)) {
                return true;
            } else {
                router.navigate(['/dashboard']);
                return false;
            }
        }
        return true;
    }
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
};
