import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, LoginRequest } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="mb-4">
            <label for="email" class="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input 
              type="email" 
              id="email"
              name="email"
              [(ngModel)]="email" 
              required 
              email
              #emailInput="ngModel"
              class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              [class.border-red-500]="emailInput.invalid && emailInput.touched">
            <div *ngIf="emailInput.invalid && emailInput.touched" class="text-red-500 text-xs mt-1">
              Please enter a valid email
            </div>
          </div>
          <div class="mb-6">
            <label for="password" class="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input 
              type="password" 
              id="password"
              name="password"
              [(ngModel)]="password" 
              required
              minlength="3"
              #passwordInput="ngModel"
              class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              [class.border-red-500]="passwordInput.invalid && passwordInput.touched">
            <div *ngIf="passwordInput.invalid && passwordInput.touched" class="text-red-500 text-xs mt-1">
              Password is required
            </div>
          </div>
          <div *ngIf="error" class="mb-4 text-red-500 text-sm text-center">{{ error }}</div>
          <button 
            type="submit" 
            [disabled]="loginForm.invalid || isLoading"
            class="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition disabled:opacity-50">
            {{ isLoading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
        
        <!-- DEBUG: Show current values -->
        <div class="mt-4 p-2 bg-gray-200 rounded text-xs" *ngIf="false">
          <p>Email: {{ email }}</p>
          <p>Password: {{ password ? '***' : '(empty)' }}</p>
        </div>
        
        <p class="mt-4 text-center text-sm text-gray-600">
          Not registered? <a routerLink="/auth/register-candidate" class="text-indigo-600 hover:underline">Create a Candidate Account</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  // Use separate properties instead of object for cleaner ngModel binding
  email = '';
  password = '';
  error = '';
  isLoading = false;

  private authService = inject(AuthService);
  private router = inject(Router);

  onSubmit() {
    // Clear previous error
    this.error = '';
    this.isLoading = true;

    // Build credentials object
    const credentials: LoginRequest = {
      email: this.email.trim(),
      password: this.password
    };

    // DEBUG: Log in component
    console.log('=== LOGIN COMPONENT DEBUG ===');
    console.log('Form email:', this.email);
    console.log('Form password:', this.password ? '[HIDDEN]' : '[EMPTY]');
    console.log('Credentials object:', { email: credentials.email, password: credentials.password ? '[HIDDEN]' : '[EMPTY]' });
    console.log('==============================');

    this.authService.login(credentials).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        console.log('Login successful, checking role...');
        const role = this.authService.getUserRole();
        console.log('User role:', role);

        if (role === 'CANDIDATE') {
          this.router.navigate(['/candidate/dashboard']);
        } else if (role === 'RECRUITER') {
          this.router.navigate(['/recruiter/dashboard']);
        } else {
          // Fallback: check if we at least have a token
          if (this.authService.isAuthenticated()) {
            console.log('Authenticated but role unknown, redirecting to candidate dashboard');
            this.router.navigate(['/candidate/dashboard']);
          } else {
            this.router.navigate(['/']);
          }
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('=== LOGIN ERROR ===');
        console.error('Status:', err.status);
        console.error('Error body:', err.error);
        console.error('Full error:', err);
        console.error('===================');

        // Extract error message from backend response
        if (err.error?.message) {
          this.error = err.error.message;
        } else if (err.error?.error) {
          this.error = err.error.error;
        } else if (typeof err.error === 'string') {
          this.error = err.error;
        } else {
          this.error = 'Invalid credentials or server error';
        }
      }
    });
  }
}
