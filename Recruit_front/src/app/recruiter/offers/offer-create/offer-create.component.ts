import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OfferService } from '../../../core/services/offer.service';

@Component({
    selector: 'app-offer-create',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="p-6 max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold mb-6 text-gray-800">Create New Offer</h1>
      
      <div class="bg-white p-6 rounded-lg shadow">
         <form (ngSubmit)="onSubmit()" #offerForm="ngForm">
            <div class="mb-4">
               <label class="block text-gray-700 text-sm font-bold mb-2">Job Title</label>
               <input type="text" [(ngModel)]="offer.title" name="title" required 
                      class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500">
            </div>
            <div class="mb-4">
               <label class="block text-gray-700 text-sm font-bold mb-2">Company</label>
               <input type="text" [(ngModel)]="offer.company" name="company" required 
                      class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500">
            </div>
             <div class="mb-6">
               <label class="block text-gray-700 text-sm font-bold mb-2">Description</label>
               <textarea [(ngModel)]="offer.description" name="description" required rows="5"
                         class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
            </div>

            <!-- Domain & Skills -->
            <div class="mb-4">
               <label class="block text-gray-700 text-sm font-bold mb-2">Domain</label>
               <select [(ngModel)]="offer.domain" name="domain" (change)="onDomainChange()" required
                       class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500">
                   <option value="" disabled>Select a Domain</option>
                   <option *ngFor="let d of domainKeys" [value]="d">{{d}}</option>
               </select>
            </div>

            <div class="mb-6" *ngIf="offer.domain">
               <label class="block text-gray-700 text-sm font-bold mb-2">Required Skills</label>
               <div class="flex flex-wrap gap-2">
                   <div *ngFor="let skill of availableSkills" 
                        (click)="toggleSkill(skill)"
                        [class.bg-indigo-600]="isSkillSelected(skill)"
                        [class.text-white]="isSkillSelected(skill)"
                        [class.bg-gray-200]="!isSkillSelected(skill)"
                        [class.text-gray-700]="!isSkillSelected(skill)"
                        class="px-3 py-1 rounded-full cursor-pointer text-sm font-medium transition-colors select-none">
                       {{ skill }}
                   </div>
               </div>
                <p *ngIf="offer.requiredSkills?.length === 0" class="text-red-500 text-xs mt-1">Please select at least one skill.</p>
            </div>

            <!-- New Fields -->
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                   <label class="block text-gray-700 text-sm font-bold mb-2">Location</label>
                   <input type="text" [(ngModel)]="offer.location" name="location"
                          class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500">
                </div>
                <div>
                   <label class="block text-gray-700 text-sm font-bold mb-2">Contract Type</label>
                   <select [(ngModel)]="offer.contractType" name="contractType"
                           class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500">
                       <option value="">Select Type</option>
                       <option value="CDI">CDI</option>
                       <option value="CDD">CDD</option>
                       <option value="STAGE">Stage</option>
                       <option value="FREELANCE">Freelance</option>
                   </select>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-6">
                <div>
                   <label class="block text-gray-700 text-sm font-bold mb-2">Salary</label>
                   <input type="number" [(ngModel)]="offer.salary" name="salary"
                          class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500">
                </div>
                <div>
                   <label class="block text-gray-700 text-sm font-bold mb-2">Expiration Date</label>
                   <input type="date" [(ngModel)]="offer.expirationDate" name="expirationDate"
                          class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500">
                </div>
            </div>
            
            <div class="flex justify-end space-x-4">
                <button type="button" (click)="cancel()" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                <button type="submit" [disabled]="!offerForm.form.valid" 
                        class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">
                   Post Offer
                </button>
            </div>
         </form>
      </div>
    </div>
  `
})
export class OfferCreateComponent {
    offer: any = {
        title: '',
        description: '',
        company: '',
        location: '',
        contractType: '',
        salary: null,
        expirationDate: '',
        domain: '',
        requiredSkills: []
    };

    domains: any = {
        "Software Engineering": [
            "Java", "Spring Boot", "Microservices", "Angular",
            "React", "Docker", "DevOps", "SQL", "MongoDB"
        ],
        "Data & AI": [
            "Python", "Machine Learning", "NLP",
            "Deep Learning", "Pandas", "Scikit-learn", "TensorFlow"
        ],
        "SAP & ERP": [
            "SAP FI", "SAP MM", "SAP SD",
            "SAP HCM", "SAP S/4HANA", "SAP Fiori"
        ]
    };

    domainKeys = Object.keys(this.domains);

    get availableSkills(): string[] {
        return this.offer.domain ? this.domains[this.offer.domain] || [] : [];
    }

    onDomainChange() {
        this.offer.requiredSkills = [];
    }

    toggleSkill(skill: string) {
        if (!this.offer.requiredSkills) this.offer.requiredSkills = [];
        const index = this.offer.requiredSkills.indexOf(skill);
        if (index > -1) {
            this.offer.requiredSkills.splice(index, 1);
        } else {
            this.offer.requiredSkills.push(skill);
        }
    }

    isSkillSelected(skill: string): boolean {
        return this.offer.requiredSkills?.includes(skill);
    }

    offerService = inject(OfferService);
    router = inject(Router);

    onSubmit() {
        this.offerService.createOffer(this.offer).subscribe({
            next: () => {
                alert('Offer created successfully!');
                this.router.navigate(['/recruiter/my-offers']); // Better redirect
            },
            error: (err: any) => {
                console.error(err);
                alert('Error creating offer');
            }
        });
    }

    cancel() {
        this.router.navigate(['/recruiter/my-offers']);
    }
}
