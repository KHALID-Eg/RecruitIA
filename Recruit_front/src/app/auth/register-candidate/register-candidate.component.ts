import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-register-candidate',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="bg-white p-8 rounded shadow-md w-full max-w-lg">
        <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">Candidate Registration</h2>
        <form (ngSubmit)="onSubmit()" #regForm="ngForm">
          <div class="grid grid-cols-2 gap-4 mb-4">
             <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">First Name</label>
                <input type="text" [(ngModel)]="data.firstName" name="firstName" required 
                       class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500">
             </div>
             <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">Last Name</label>
                <input type="text" [(ngModel)]="data.lastName" name="lastName" required 
                       class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500">
             </div>
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input type="email" [(ngModel)]="data.email" name="email" required 
                   class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500">
          </div>
          <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input type="password" [(ngModel)]="data.password" name="password" required 
                   class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500">
          </div>
          
          <!-- Add other fields as required by backend: phone, address, etc. -->
          
          <div *ngIf="error" class="mb-4 text-red-500 text-sm text-center">{{ error }}</div>
          
          <button type="submit" [disabled]="!regForm.form.valid"
                  class="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition disabled:opacity-50">
            Register
          </button>
        </form>
         <p class="mt-4 text-center text-sm text-gray-600">
          Already have an account? <a routerLink="/auth/login" class="text-indigo-600 hover:underline">Sign In</a>
        </p>
      </div>
    </div>
  `
})
export class RegisterCandidateComponent {
    data = { firstName: '', lastName: '', email: '', password: '' }; // Adjust fields to backend DTO
    error = '';

    authService = inject(AuthService);
    router = inject(Router);

    onSubmit() {
        this.authService.registerCandidate(this.data).subscribe({
            next: () => {
                alert('Registration successful! Please login.');
                this.router.navigate(['/auth/login']);
            },
            error: (err: any) => {
                this.error = 'Registration failed. Try again.';
                console.error(err);
            }
        });
    }
}
