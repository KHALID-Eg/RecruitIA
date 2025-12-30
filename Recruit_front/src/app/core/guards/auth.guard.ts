import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        return true;
    }

    router.navigate(['/auth/login']);
    return false;
};

export const candidateGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const role = authService.getUserRole();

    // Assuming role string matches 'CANDIDATE' or similar from backend
    if (authService.isAuthenticated() && role === 'CANDIDATE') {
        return true;
    }

    // Redirect if logged in but wrong role, or not logged in
    if (authService.isAuthenticated()) {
        // unauthorized for this role
        // potentially redirect to their own dashboard or 403 page
        if (role === 'RECRUITER') router.navigate(['/recruiter/dashboard']);
        else router.navigate(['/']);
    } else {
        router.navigate(['/auth/login']);
    }

    return false;
};

export const recruiterGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const role = authService.getUserRole();

    console.log('[RecruiterGuard] Checking access. Role:', role, 'Authenticated:', authService.isAuthenticated());

    if (authService.isAuthenticated() && role === 'RECRUITER') {
        return true;
    }

    if (authService.isAuthenticated()) {
        console.warn('[RecruiterGuard] Access denied. Role mismatch:', role);
        if (role === 'CANDIDATE') router.navigate(['/candidate/dashboard']);
        else router.navigate(['/']);
    } else {
        console.warn('[RecruiterGuard] Not authenticated, redirecting to login');
        router.navigate(['/auth/login']);
    }

    return false;
};
