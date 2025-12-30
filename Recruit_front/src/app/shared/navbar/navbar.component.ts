import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <nav class="bg-indigo-600 text-white shadow-md p-4 flex justify-between items-center">
      <a routerLink="/" class="text-xl font-bold">RecruitIA</a>
      <div *ngIf="authService.currentUser$ | async as user; else loginBtn">
        <span class="mr-4">Hello, {{ user.sub || 'User' }}</span>
        <button (click)="logout()" class="bg-red-500 hover:bg-red-600 px-3 py-1 rounded">Logout</button>
      </div>
      <ng-template #loginBtn>
        <div class="space-x-4">
           <a routerLink="/auth/login" class="hover:text-indigo-200">Login</a>
           <a routerLink="/auth/register-candidate" class="bg-indigo-800 hover:bg-indigo-900 px-3 py-1 rounded">Register</a>
        </div>
      </ng-template>
    </nav>
  `
})
export class NavbarComponent {
    authService = inject(AuthService);

    logout() {
        this.authService.logout();
    }
}
