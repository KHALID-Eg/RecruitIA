import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OfferService } from '../../../core/services/offer.service';

@Component({
  selector: 'app-offer-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">My Job Offers</h1>
        <a routerLink="/recruiter/offers/create" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">
           + Create Offer
        </a>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full leading-normal">
          <thead>
            <tr>
              <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Title
              </th>
              <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Description
              </th>
              <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let offer of offers">
              <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                 <p class="text-gray-900 whitespace-no-wrap font-bold">{{ offer.title }}</p>
              </td>
              <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                 <p class="text-gray-900 whitespace-no-wrap max-w-xs truncate">{{ offer.description }}</p>
              </td>
              <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                 <span class="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
                    <span aria-hidden class="absolute inset-0 bg-green-200 opacity-50 rounded-full"></span>
                    <span class="relative">Active</span>
                 </span>
              </td>
            </tr>
            <tr *ngIf="offers.length === 0">
               <td colspan="3" class="px-5 py-5 text-center text-gray-500">No offers found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class OfferListComponent implements OnInit {
  offerService = inject(OfferService);
  offers: any[] = [];

  ngOnInit() {
    this.offerService.getOffers().subscribe({
      next: (res: any) => this.offers = res,
      error: (err: any) => console.error(err)
    });
  }
}
