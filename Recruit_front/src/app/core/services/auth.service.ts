import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    token?: string;
    accessToken?: string;
    role?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:8888/auth';
    private tokenKey = 'recruit_token';

    private currentUserSubject = new BehaviorSubject<any>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    private http = inject(HttpClient);
    private router = inject(Router);

    // Explicit JSON headers to ensure correct Content-Type
    private httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    };

    constructor() {
        this.loadUser();
    }

    private loadUser() {
        const token = localStorage.getItem(this.tokenKey);
        if (token) {
            try {
                const decoded = this.decodeToken(token);
                // Ensure we handle role correctly
                let role = decoded.role;
                if (!role && decoded.authorities) {
                    role = decoded.authorities[0];
                }

                // Consistency check logic
                if (role && !role.startsWith('ROLE_') && role === 'RECRUITER') {
                    // Should match backend enum name
                }

                console.log('User Loaded:', { ...decoded, token, parsedRole: role });
                this.currentUserSubject.next({ ...decoded, token, role });
            } catch (e) {
                console.error('Invalid token', e);
                this.logout();
            }
        }
    }

    login(credentials: LoginRequest): Observable<AuthResponse> {
        // DEBUG: Log the exact payload being sent
        const payload = {
            email: credentials.email,
            password: credentials.password
        };

        console.log('=== AUTH SERVICE DEBUG ===');
        console.log('URL:', `${this.apiUrl}/login`);
        console.log('Payload:', JSON.stringify(payload));
        console.log('Headers:', this.httpOptions.headers);
        console.log('==========================');

        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload, this.httpOptions).pipe(
            tap(response => {
                console.log('=== LOGIN RESPONSE ===');
                console.log('Response:', response);
                console.log('======================');

                // Handle different token field names from backend
                const token = response.token || response.accessToken;
                if (token && typeof token === 'string') {
                    localStorage.setItem(this.tokenKey, token);
                    this.loadUser();
                }
            })
        );
    }

    registerCandidate(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/register-candidate`, data, this.httpOptions);
    }

    registerRecruiter(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/register-recruiter`, data, this.httpOptions);
    }

    logout() {
        localStorage.removeItem(this.tokenKey);
        this.currentUserSubject.next(null);
        this.router.navigate(['/auth/login']);
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    getUserRole(): string | null {
        const user = this.currentUserSubject.value;
        if (!user) return null;

        let role = user.role || user.roles?.[0] || user.authorities?.[0]?.authority || null;

        // Normalize role: Remove 'ROLE_' prefix if present
        if (role && typeof role === 'string' && role.startsWith('ROLE_')) {
            role = role.substring(5);
        }

        return role;
    }

    isAuthenticated(): boolean {
        const token = this.getToken();
        if (!token) return false;
        // Optional: Check expiration
        const user = this.currentUserSubject.value;
        if (user && user.exp) {
            const isExpired = Date.now() >= user.exp * 1000;
            if (isExpired) {
                this.logout();
                return false;
            }
        }
        return true;
    }

    private decodeToken(token: string): any {
        try {
            return jwtDecode(token);
        } catch (error) {
            return null;
        }
    }
}
