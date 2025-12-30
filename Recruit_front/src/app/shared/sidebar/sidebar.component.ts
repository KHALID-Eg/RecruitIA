import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="w-64 bg-gray-800 text-white min-h-screen p-4 flex flex-col">
       <div class="mb-8 font-semibold text-lg text-gray-400 uppercase tracking-wider">Menu</div>
       
       <ng-container *ngIf="authService.currentUser$ | async as user">
          <ul class="space-y-2">
            <!-- Candidate Links -->
            <ng-container *ngIf="user.role === 'CANDIDATE'">
              <li>
                <a routerLink="/candidate/dashboard" routerLinkActive="bg-gray-700" class="block p-3 rounded hover:bg-gray-700">Dashboard</a>
              </li>
              <li>
                <a routerLink="/candidate/profile" routerLinkActive="bg-gray-700" class="block p-3 rounded hover:bg-gray-700">My Profile</a>
              </li>
            </ng-container>

            <!-- Recruiter Links -->
            <ng-container *ngIf="user.role === 'RECRUITER'">
              <li>
                 <a routerLink="/recruiter/dashboard" routerLinkActive="bg-gray-700" class="block p-3 rounded hover:bg-gray-700">Dashboard</a>
              </li>
              <li>
                 <a routerLink="/recruiter/my-offers" routerLinkActive="bg-gray-700" class="block p-3 rounded hover:bg-gray-700">Manage Offers</a>
              </li>
               <li>
                 <a routerLink="/recruiter/offers/create" routerLinkActive="bg-gray-700" class="block p-3 rounded hover:bg-gray-700">New Offer</a>
              </li>
            </ng-container>
          </ul>
       </ng-container>
    </div>
  `
})
export class SidebarComponent {
  authService = inject(AuthService);
}
