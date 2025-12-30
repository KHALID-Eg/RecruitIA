import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const authService = inject(AuthService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                // Only logout if 401 and not already on login page
                if (!router.url.includes('/auth/login')) {
                    console.warn('Session expired or invalid, logging out.');
                    authService.logout();
                }
            } else if (error.status === 403) {
                // Forbidden - User logged in but not enough permissions
                // Isolate 403 from logout logic
                console.error("Access forbidden: You do not have permission to access this resource.", error);
            }
            return throwError(() => error);
        })
    );
};
