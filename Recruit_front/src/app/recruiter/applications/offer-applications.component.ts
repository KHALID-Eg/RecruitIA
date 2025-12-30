import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OfferService, Application, Offer } from '../../core/services/offer.service';
import { CandidateService } from '../../core/services/candidate.service';

@Component({
  selector: 'app-offer-applications',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="applications-container">
      <div class="header">
        <a routerLink="/recruiter/my-offers" class="back-link">← Retour aux offres</a>
        <h1 *ngIf="offer">📬 Candidatures pour "{{ offer.title }}"</h1>
      </div>
      
      <div *ngIf="loading" class="loading">Chargement des candidatures...</div>
      
      <div *ngIf="!loading && applications.length === 0" class="no-applications">
        <p>Aucune candidature reçue pour cette offre.</p>
      </div>
      
      <div class="applications-list" *ngIf="!loading && applications.length > 0">
        <div class="application-card" *ngFor="let app of applications">
          <div class="app-header">
            <div class="candidate-info">
              <div class="avatar">{{ getInitials(app.candidateEmail) }}</div>
              <div>
                <h3>{{ app.candidateEmail }}</h3>
                <span class="date">Postulé le {{ app.applicationDate | date:'dd/MM/yyyy à HH:mm' }}</span>
                <button (click)="viewCv(app.candidateEmail)" class="text-sm text-indigo-600 hover:text-indigo-800 ml-2 font-medium">
                  📄 Voir CV
                </button>
              </div>
            </div>
            <span class="status-badge" [class]="app.status.toLowerCase()">
              {{ getStatusLabel(app.status) }}
            </span>
          </div>
          
          <div class="app-actions" *ngIf="app.status === 'PENDING'">
            <button (click)="updateStatus(app, 'ACCEPTED')" class="btn btn-success" [disabled]="processing === app.id">
              ✅ Accepter
            </button>
            <button (click)="updateStatus(app, 'REJECTED')" class="btn btn-danger" [disabled]="processing === app.id">
              ❌ Refuser
            </button>
          </div>
          
          <div class="status-message" *ngIf="app.status !== 'PENDING'">
            <span *ngIf="app.status === 'ACCEPTED'">✅ Candidature acceptée</span>
            <span *ngIf="app.status === 'REJECTED'">❌ Candidature refusée</span>
          </div>
        </div>
      </div>
      
      <!-- Stats Summary -->
      <div class="stats-summary" *ngIf="!loading && applications.length > 0">
        <div class="stat">
          <span class="value">{{ applications.length }}</span>
          <span class="label">Total</span>
        </div>
        <div class="stat pending">
          <span class="value">{{ getCountByStatus('PENDING') }}</span>
          <span class="label">En attente</span>
        </div>
        <div class="stat accepted">
          <span class="value">{{ getCountByStatus('ACCEPTED') }}</span>
          <span class="label">Acceptées</span>
        </div>
        <div class="stat rejected">
          <span class="value">{{ getCountByStatus('REJECTED') }}</span>
          <span class="label">Refusées</span>
        </div>
      </div>
      
      <!-- Toast Messages -->
      <div *ngIf="successMessage" class="toast success">{{ successMessage }}</div>
      <div *ngIf="errorMessage" class="toast error">{{ errorMessage }}</div>
    </div>
  `,
  styles: [`
    .applications-container { padding: 2rem; max-width: 900px; margin: 0 auto; }
    .header { margin-bottom: 2rem; }
    .back-link { color: #6366f1; text-decoration: none; display: inline-block; margin-bottom: 1rem; }
    .back-link:hover { text-decoration: underline; }
    h1 { font-size: 1.75rem; color: #1e293b; margin: 0; }
    .loading, .no-applications { text-align: center; color: #64748b; padding: 3rem; background: #fff; border-radius: 12px; }
    .applications-list { display: flex; flex-direction: column; gap: 1rem; }
    .application-card { background: #fff; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .app-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
    .candidate-info { display: flex; align-items: center; gap: 1rem; }
    .avatar { width: 48px; height: 48px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 600; font-size: 1rem; }
    .candidate-info h3 { margin: 0 0 0.25rem; color: #1e293b; font-size: 1rem; }
    .date { color: #94a3b8; font-size: 0.85rem; }
    .status-badge { padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
    .status-badge.pending { background: #fef3c7; color: #92400e; }
    .status-badge.accepted { background: #dcfce7; color: #166534; }
    .status-badge.rejected { background: #fee2e2; color: #991b1b; }
    .app-actions { display: flex; gap: 1rem; padding-top: 1rem; border-top: 1px solid #f1f5f9; }
    .btn { padding: 0.75rem 1.5rem; border-radius: 8px; font-size: 0.9rem; cursor: pointer; border: none; transition: all 0.2s; }
    .btn-success { background: #22c55e; color: #fff; }
    .btn-success:hover { background: #16a34a; }
    .btn-danger { background: #ef4444; color: #fff; }
    .btn-danger:hover { background: #dc2626; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .status-message { padding-top: 1rem; border-top: 1px solid #f1f5f9; color: #64748b; font-size: 0.9rem; }
    .stats-summary { display: flex; gap: 1rem; margin-top: 2rem; background: #fff; padding: 1.5rem; border-radius: 12px; justify-content: center; }
    .stat { text-align: center; padding: 0 1.5rem; }
    .stat .value { display: block; font-size: 1.5rem; font-weight: 700; color: #1e293b; }
    .stat .label { font-size: 0.85rem; color: #64748b; }
    .stat.pending .value { color: #f59e0b; }
    .stat.accepted .value { color: #22c55e; }
    .stat.rejected .value { color: #ef4444; }
    .toast { position: fixed; bottom: 2rem; right: 2rem; padding: 1rem 2rem; border-radius: 8px; font-weight: 500; z-index: 9999; }
    .toast.success { background: #22c55e; color: #fff; }
    .toast.error { background: #ef4444; color: #fff; }
  `]
})
export class OfferApplicationsComponent implements OnInit {
  route = inject(ActivatedRoute);
  offerService = inject(OfferService);
  candidateService = inject(CandidateService); // Inject CandidateService

  offerId: number = 0;
  offer: Offer | null = null;
  applications: Application[] = [];
  loading = true;
  processing: number | null = null;

  successMessage = '';
  errorMessage = '';

  ngOnInit() {
    this.offerId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData();
  }

  loadData() {
    this.loading = true;

    // Load offer details
    this.offerService.getOfferById(this.offerId).subscribe({
      next: (offer) => this.offer = offer,
      error: (err) => console.error('Failed to load offer', err)
    });

    // Load applications
    this.offerService.getApplicationsForOffer(this.offerId).subscribe({
      next: (data) => {
        this.applications = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load applications', err);
        this.loading = false;
      }
    });
  }

  viewCv(email: string | undefined) {
    if (!email) return;
    this.candidateService.downloadCandidateCv(email).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: () => alert('CV non disponible ou erreur de téléchargement')
    });
  }

  getInitials(email: string | undefined): string {
    if (!email) return '?';
    return email.substring(0, 2).toUpperCase();
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'PENDING': '⏳ En attente',
      'ACCEPTED': '✅ Acceptée',
      'REJECTED': '❌ Refusée'
    };
    return labels[status] || status;
  }

  getCountByStatus(status: string): number {
    return this.applications.filter(a => a.status === status).length;
  }

  updateStatus(app: Application, status: 'ACCEPTED' | 'REJECTED') {
    this.processing = app.id;

    this.offerService.updateApplicationStatus(app.id, status).subscribe({
      next: (updated) => {
        app.status = updated.status;
        this.successMessage = status === 'ACCEPTED' ? '✅ Candidature acceptée' : '❌ Candidature refusée';
        this.processing = null;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Erreur lors de la mise à jour';
        this.processing = null;
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }
}
