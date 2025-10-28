import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionService } from '../services/session.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const sessionService = inject(SessionService);
    const router = inject(Router);
    sessionService.updateLastActivity();
    const token = sessionService.getToken();
    if (token && !req.url.includes('/api/auth/login') && !req.url.includes('/api/auth/register')) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }
    return next(req).pipe(
        catchError((error) => {
            if (error.status === 401) {
                sessionService.clearSession();
                router.navigate(['/login']);
            }
            return throwError(() => error);
        })
    );
};
