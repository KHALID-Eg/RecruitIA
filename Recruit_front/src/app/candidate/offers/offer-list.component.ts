import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { OfferService, Offer } from '../../core/services/offer.service';
import { CandidateService } from '../../core/services/candidate.service';

@Component({
  selector: 'app-offer-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="offers-container">
      <h1>📋 Offres d'emploi disponibles</h1>
      
      <div *ngIf="loading" class="loading">Chargement des offres...</div>
      
      <div *ngIf="!loading && offers.length === 0" class="no-offers">
        Aucune offre disponible pour le moment.
      </div>
      
      <div class="offers-grid" *ngIf="!loading && offers.length > 0">
        <div class="offer-card" *ngFor="let offer of offers" (click)="selectOffer(offer)">
          <div class="offer-header">
            <h3>{{ offer.title }}</h3>
            <span class="contract-badge" [class]="offer.contractType?.toLowerCase()">
              {{ offer.contractType || 'Non spécifié' }}
            </span>
          </div>
          <p class="company">🏢 {{ offer.company }}</p>
          <p class="location" *ngIf="offer.location">📍 {{ offer.location }}</p>
          <p class="salary" *ngIf="offer.salary">💰 {{ offer.salary | number:'1.0-0' }} €</p>
          <p class="date">📅 Publié le {{ offer.publishedDate | date:'dd/MM/yyyy' }}</p>
          <p class="description">{{ offer.description | slice:0:150 }}{{ (offer.description.length || 0) > 150 ? '...' : '' }}</p>
          <button class="btn btn-primary" (click)="checkProfileAndApply(offer, $event)">
            📝 Postuler
          </button>
        </div>
      </div>
      
      <!-- Offer Detail Modal -->
      <div class="modal-overlay" *ngIf="selectedOffer" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="closeModal()">✕</button>
          <h2>{{ selectedOffer.title }}</h2>
          <p class="company">🏢 {{ selectedOffer.company }}</p>
          <p class="location" *ngIf="selectedOffer.location">📍 {{ selectedOffer.location }}</p>
          <div class="detail-row">
            <span class="label">Contrat:</span>
            <span>{{ selectedOffer.contractType || 'Non spécifié' }}</span>
          </div>
          <div class="detail-row" *ngIf="selectedOffer.salary">
            <span class="label">Salaire:</span>
            <span>{{ selectedOffer.salary | number:'1.0-0' }} €</span>
          </div>
          <div class="detail-row" *ngIf="selectedOffer.expirationDate">
            <span class="label">Date limite:</span>
            <span>{{ selectedOffer.expirationDate | date:'dd/MM/yyyy' }}</span>
          </div>
          <div class="description-full">
            <h4>Description du poste</h4>
            <p>{{ selectedOffer.description }}</p>
          </div>
          <button class="btn btn-primary btn-large" (click)="checkProfileAndApply(selectedOffer, $event)">
            📝 Postuler à cette offre
          </button>
        </div>
      </div>

      <!-- Missing CV Modal -->
      <div class="modal-overlay" *ngIf="showCvModal" (click)="closeCvModal()">
        <div class="modal-content cv-alert" (click)="$event.stopPropagation()">
          <h2>🚫 CV Manquant</h2>
          <p>Vous devez uploader votre CV (format PDF) avant de pouvoir postuler à une offre.</p>
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="closeCvModal()">Annuler</button>
            <button class="btn btn-primary" (click)="navigateToProfile()">📤 Uploader mon CV</button>
          </div>
        </div>
      </div>
      
      <!-- Success/Error Messages -->
      <div *ngIf="successMessage" class="toast success">{{ successMessage }}</div>
      <div *ngIf="errorMessage" class="toast error">{{ errorMessage }}</div>
    </div>
  `,
  styles: [`
    .offers-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    h1 { font-size: 2rem; margin-bottom: 2rem; color: #1e293b; }
    .loading, .no-offers { color: #64748b; font-style: italic; text-align: center; padding: 3rem; }
    .offers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; }
    .offer-card { background: #fff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.07); padding: 1.5rem; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
    .offer-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
    .offer-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 0.75rem; }
    .offer-header h3 { margin: 0; font-size: 1.25rem; color: #1e293b; }
    .contract-badge { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
    .contract-badge.cdi { background: #dcfce7; color: #166534; }
    .contract-badge.cdd { background: #fef3c7; color: #92400e; }
    .contract-badge.stage { background: #dbeafe; color: #1e40af; }
    .contract-badge.alternance { background: #f3e8ff; color: #7c3aed; }
    .company { font-weight: 600; color: #475569; margin: 0.5rem 0; }
    .location, .salary, .date { color: #64748b; margin: 0.25rem 0; font-size: 0.9rem; }
    .description { color: #475569; margin: 1rem 0; line-height: 1.5; font-size: 0.9rem; }
    .btn { padding: 0.75rem 1.5rem; border-radius: 8px; font-size: 1rem; cursor: pointer; border: none; transition: all 0.2s; }
    .btn-primary { background: #6366f1; color: #fff; }
    .btn-primary:hover { background: #5558e3; }
    .btn-secondary { background: #f1f5f9; color: #475569; }
    .btn-secondary:hover { background: #e2e8f0; }
    .btn-large { width: 100%; margin-top: 1.5rem; padding: 1rem; font-size: 1.1rem; }
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: #fff; border-radius: 16px; padding: 2rem; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; position: relative; }
    .modal-content.cv-alert { max-width: 500px; text-align: center; }
    .modal-content h2 { margin: 0 0 1rem; font-size: 1.5rem; color: #1e293b; }
    .modal-actions { display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem; }
    .close-btn { position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b; }
    .detail-row { display: flex; gap: 1rem; padding: 0.5rem 0; border-bottom: 1px solid #f1f5f9; }
    .detail-row .label { font-weight: 600; color: #475569; min-width: 100px; }
    .description-full { margin-top: 1.5rem; }
    .description-full h4 { margin: 0 0 0.75rem; color: #1e293b; }
    .description-full p { color: #475569; line-height: 1.6; white-space: pre-line; }
    .toast { position: fixed; bottom: 2rem; right: 2rem; padding: 1rem 2rem; border-radius: 8px; font-weight: 500; z-index: 9999; animation: slideIn 0.3s ease; }
    .toast.success { background: #22c55e; color: #fff; }
    .toast.error { background: #ef4444; color: #fff; }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  `]
})
export class OfferListComponent implements OnInit {
  offerService = inject(OfferService);
  candidateService = inject(CandidateService);
  router = inject(Router);

  offers: Offer[] = [];
  loading = true;
  selectedOffer: Offer | null = null;

  showCvModal = false;

  successMessage = '';
  errorMessage = '';

  ngOnInit() {
    this.loadOffers();
  }

  loadOffers() {
    this.loading = true;
    this.offerService.getOffers().subscribe({
      next: (data) => {
        // Filter out expired offers for candidates
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        this.offers = data.filter(offer => !offer.expirationDate || new Date(offer.expirationDate) >= now);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  selectOffer(offer: Offer) {
    this.selectedOffer = offer;
  }

  closeModal() {
    this.selectedOffer = null;
  }

  closeCvModal() {
    this.showCvModal = false;
  }

  navigateToProfile() {
    this.router.navigate(['/candidate/profile']);
  }

  checkProfileAndApply(offer: Offer, event: Event) {
    event.stopPropagation();

    // Check if user has a CV
    this.candidateService.getProfile().subscribe({
      next: (profile) => {
        if (profile.cvFileName || profile.cvUploadDate) {
          // Proceed with application
          this.applyToOffer(offer);
        } else {
          // Show missing CV modal
          this.showCvModal = true;
        }
      },
      error: (err) => {
        console.error('Failed to check profile', err);
        // Fallback or show general error
        this.errorMessage = 'Impossible de vérifier votre profil. Veuillez réessayer.';
        setTimeout(() => this.errorMessage = '', 4000);
      }
    });
  }

  // Changed to private as it's called internally now, 
  // but keeping it public in case valid event handling is needed (though checkProfileAndApply handles the event)
  applyToOffer(offer: Offer) {
    this.offerService.applyToOffer(offer.id).subscribe({
      next: () => {
        this.successMessage = `✅ Candidature envoyée pour "${offer.title}"`;
        this.closeModal(); // Close detail modal if open
        setTimeout(() => this.successMessage = '', 4000);
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Erreur lors de la candidature';
        setTimeout(() => this.errorMessage = '', 4000);
      }
    });
  }
}
