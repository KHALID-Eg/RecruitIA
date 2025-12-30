import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent],
    template: `
    <div class="flex flex-col h-screen">
      <app-navbar class="z-10"></app-navbar>
      <div class="flex flex-1 overflow-hidden">
         <app-sidebar class="hidden md:block shadow-inner"></app-sidebar>
         <main class="flex-1 overflow-y-auto bg-gray-50">
            <router-outlet></router-outlet>
         </main>
      </div>
    </div>
  `
})
export class MainLayoutComponent { }
