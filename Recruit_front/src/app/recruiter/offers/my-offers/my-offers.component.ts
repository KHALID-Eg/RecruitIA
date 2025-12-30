import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OfferService, Offer, OfferRequest } from '../../../core/services/offer.service';

@Component({
  selector: 'app-my-offers',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="offers-container">
      <div class="header">
        <h1>📋 Mes Offres</h1>
        <a routerLink="/recruiter/offers/create" class="btn btn-primary">➕ Nouvelle offre</a>
      </div>
      
      <div *ngIf="loading" class="loading">Chargement des offres...</div>
      
      <div *ngIf="!loading && offers.length === 0" class="no-offers">
        <p>Vous n'avez pas encore créé d'offres.</p>
        <a routerLink="/recruiter/offers/create" class="btn btn-primary">Créer ma première offre</a>
      </div>
      
      <div class="offers-table" *ngIf="!loading && offers.length > 0">
        <table>
          <thead>
            <tr>
              <th>Titre</th>
              <th>Entreprise</th>
              <th>Contrat</th>
              <th>Publié le</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let offer of offers">
              <td class="title-cell">{{ offer.title }}</td>
              <td>{{ offer.company }}</td>
              <td>{{ offer.contractType || '-' }}</td>
              <td>{{ offer.publishedDate | date:'dd/MM/yyyy' }}</td>
              <td>
                <span class="status-badge" [class.active]="isActive(offer)" [class.inactive]="!isActive(offer)">
                  {{ isActive(offer) ? 'Active' : 'Inactive' }}
                </span>
                <span *ngIf="!isActive(offer)" class="text-xs text-gray-400 block mt-1">
                    Expirée le {{ offer.expirationDate | date:'dd/MM/yyyy' }}
                </span>
              </td>
              <td class="actions-cell">
                <button (click)="toggleStatus(offer)" class="btn-icon" 
                        [title]="isActive(offer) ? 'Désactiver' : 'Activer'">
                    {{ isActive(offer) ? '🛑' : '✅' }}
                </button>
                <button (click)="viewApplications(offer)" class="btn-icon" title="Voir candidatures">📬</button>
                <button (click)="analyzeWithAi(offer)" class="btn-icon" title="Analyser avec IA">🧠</button>
                <button (click)="editOffer(offer)" class="btn-icon" title="Modifier">✏️</button>
                <button (click)="confirmDelete(offer)" class="btn-icon danger" title="Supprimer">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Edit Modal -->
      <div class="modal-overlay" *ngIf="editingOffer" (click)="cancelEdit()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>Modifier l'offre</h2>
          <form (ngSubmit)="saveOffer()">
            <div class="form-group">
              <label>Titre</label>
              <input type="text" [(ngModel)]="editForm.title" name="title" required />
            </div>
            <div class="form-group">
              <label>Entreprise</label>
              <input type="text" [(ngModel)]="editForm.company" name="company" required />
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea [(ngModel)]="editForm.description" name="description" rows="4"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Localisation</label>
                <input type="text" [(ngModel)]="editForm.location" name="location" />
              </div>
              <div class="form-group">
                <label>Type de contrat</label>
                <select [(ngModel)]="editForm.contractType" name="contractType">
                  <option value="">-- Sélectionner --</option>
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="STAGE">Stage</option>
                  <option value="ALTERNANCE">Alternance</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Salaire (€)</label>
                <input type="number" [(ngModel)]="editForm.salary" name="salary" />
              </div>
              <div class="form-group">
                <label>Date d'expiration</label>
                <input type="date" [(ngModel)]="editForm.expirationDate" name="expirationDate" />
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" (click)="cancelEdit()" class="btn btn-secondary">Annuler</button>
              <button type="submit" class="btn btn-primary" [disabled]="saving">
                {{ saving ? 'Sauvegarde...' : 'Sauvegarder' }}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Delete Confirmation -->
      <div class="modal-overlay" *ngIf="deletingOffer" (click)="cancelDelete()">
        <div class="modal-content confirm" (click)="$event.stopPropagation()">
          <h2>⚠️ Confirmer la suppression</h2>
          <p>Voulez-vous vraiment supprimer l'offre "{{ deletingOffer.title }}" ?</p>
          <div class="modal-actions">
            <button (click)="cancelDelete()" class="btn btn-secondary">Annuler</button>
            <button (click)="deleteOffer()" class="btn btn-danger" [disabled]="deleting">
              {{ deleting ? 'Suppression...' : 'Supprimer' }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- Toast Messages -->
      <div *ngIf="successMessage" class="toast success">{{ successMessage }}</div>
      <div *ngIf="errorMessage" class="toast error">{{ errorMessage }}</div>
    </div>
  `,
  styles: [`
    .offers-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    h1 { font-size: 2rem; color: #1e293b; margin: 0; }
    .loading, .no-offers { text-align: center; color: #64748b; padding: 3rem; background: #fff; border-radius: 12px; }
    .btn { padding: 0.75rem 1.5rem; border-radius: 8px; font-size: 1rem; cursor: pointer; border: none; text-decoration: none; transition: all 0.2s; display: inline-block; }
    .btn-primary { background: #6366f1; color: #fff; }
    .btn-primary:hover { background: #5558e3; }
    .btn-secondary { background: #f1f5f9; color: #475569; }
    .btn-danger { background: #ef4444; color: #fff; }
    .btn-danger:hover { background: #dc2626; }
    .offers-table { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 1rem; text-align: left; border-bottom: 1px solid #f1f5f9; }
    th { background: #f8fafc; font-weight: 600; color: #475569; }
    .title-cell { font-weight: 500; color: #1e293b; }
    .status-badge { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
    .status-badge.active { background: #dcfce7; color: #166534; }
    .status-badge.inactive { background: #fee2e2; color: #991b1b; }
    .actions-cell { display: flex; gap: 0.5rem; }
    .btn-icon { background: none; border: none; font-size: 1.25rem; cursor: pointer; padding: 0.25rem; opacity: 0.7; transition: opacity 0.2s; }
    .btn-icon:hover { opacity: 1; }
    .btn-icon.danger:hover { transform: scale(1.1); }
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: #fff; border-radius: 16px; padding: 2rem; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; }
    .modal-content.confirm { max-width: 400px; text-align: center; }
    .modal-content h2 { margin: 0 0 1.5rem; color: #1e293b; }
    .modal-content p { color: #64748b; margin-bottom: 1.5rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
    .form-group label { font-weight: 600; color: #475569; }
    .form-group input, .form-group textarea, .form-group select { padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 1rem; }
    .form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: #6366f1; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .modal-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem; }
    .toast { position: fixed; bottom: 2rem; right: 2rem; padding: 1rem 2rem; border-radius: 8px; font-weight: 500; z-index: 9999; animation: slideIn 0.3s ease; }
    .toast.success { background: #22c55e; color: #fff; }
    .toast.error { background: #ef4444; color: #fff; }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  `]
})
export class MyOffersComponent implements OnInit {
  offerService = inject(OfferService);
  offers: Offer[] = [];
  loading = true;

  editingOffer: Offer | null = null;
  editForm: OfferRequest = { title: '', company: '' };
  saving = false;

  deletingOffer: Offer | null = null;
  deleting = false;

  successMessage = '';
  errorMessage = '';

  ngOnInit() {
    this.loadOffers();
  }

  loadOffers() {
    this.loading = true;
    this.offerService.getMyOffers().subscribe({
      next: (data) => {
        this.offers = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load offers', err);
        this.loading = false;
      }
    });
  }

  viewApplications(offer: Offer) {
    window.location.href = `/recruiter/offers/${offer.id}/applications`;
  }

  analyzeWithAi(offer: Offer) {
    window.location.href = `/recruiter/ai-analysis/${offer.id}`;
  }

  editOffer(offer: Offer) {
    this.editingOffer = offer;
    this.editForm = {
      title: offer.title,
      description: offer.description,
      company: offer.company,
      location: offer.location,
      contractType: offer.contractType,
      salary: offer.salary,
      expirationDate: offer.expirationDate
    };
  }

  cancelEdit() {
    this.editingOffer = null;
    this.editForm = { title: '', company: '' };
  }

  isActive(offer: Offer): boolean {
    // Active if no expiration date OR expiration date is in the future
    if (!offer.expirationDate) return true;
    const exp = new Date(offer.expirationDate);
    const now = new Date();
    // Reset time for accurate date comparison
    now.setHours(0, 0, 0, 0);
    return exp >= now;
  }

  toggleStatus(offer: Offer) {
    const currentlyActive = this.isActive(offer);
    const today = new Date();

    let newDate: string | undefined;

    if (currentlyActive) {
      // Deactivate -> Set expiration to yesterday
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      newDate = yesterday.toISOString().split('T')[0];
    } else {
      // Activate -> Set expiration to null (indefinite) or +1 year
      // Attempting to set null first. If backend requires date, we set +1 year
      newDate = undefined;
    }

    const updatePayload: OfferRequest = {
      title: offer.title,
      company: offer.company,
      description: offer.description,
      location: offer.location,
      contractType: offer.contractType,
      salary: offer.salary,
      expirationDate: newDate
    };

    this.offerService.updateOffer(offer.id, updatePayload).subscribe({
      next: (updated) => {
        this.successMessage = `✅ Offre ${currentlyActive ? 'désactivée' : 'activée'} avec succès`;
        // Update local list
        const index = this.offers.findIndex(o => o.id === offer.id);
        if (index !== -1) {
          this.offers[index] = updated;
        }
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du changement de statut';
        console.error(err);
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  saveOffer() {
    if (!this.editingOffer) return;
    this.saving = true;

    this.offerService.updateOffer(this.editingOffer.id, this.editForm).subscribe({
      next: () => {
        this.successMessage = '✅ Offre modifiée avec succès';
        this.cancelEdit();
        this.loadOffers();
        this.saving = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Erreur lors de la modification';
        this.saving = false;
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  confirmDelete(offer: Offer) {
    this.deletingOffer = offer;
  }

  cancelDelete() {
    this.deletingOffer = null;
  }

  deleteOffer() {
    if (!this.deletingOffer) return;
    this.deleting = true;

    this.offerService.deleteOffer(this.deletingOffer.id).subscribe({
      next: () => {
        this.successMessage = '✅ Offre supprimée avec succès';
        this.cancelDelete();
        this.loadOffers();
        this.deleting = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Erreur lors de la suppression';
        this.deleting = false;
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }
}
