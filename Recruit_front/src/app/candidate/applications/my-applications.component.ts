import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfferService, Application } from '../../core/services/offer.service';

@Component({
    selector: 'app-my-applications',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="applications-container">
      <h1>📋 Mes Candidatures</h1>
      
      <div *ngIf="loading" class="loading">Chargement de vos candidatures...</div>
      
      <div *ngIf="!loading && applications.length === 0" class="no-applications">
        <div class="empty-icon">📭</div>
        <p>Vous n'avez pas encore postulé à des offres.</p>
        <a routerLink="/candidate/offers" class="btn btn-primary">
          Découvrir les offres
        </a>
      </div>
      
      <div class="applications-list" *ngIf="!loading && applications.length > 0">
        <div class="application-card" *ngFor="let app of applications">
          <div class="application-header">
            <div class="status-badge" [class]="app.status.toLowerCase()">
              {{ getStatusLabel(app.status) }}
            </div>
            <span class="date">{{ app.applicationDate | date:'dd/MM/yyyy à HH:mm' }}</span>
          </div>
          <h3>{{ app.offerTitle }}</h3>
          <p class="company">🏢 {{ app.company }}</p>
          <div class="application-footer">
            <span class="app-id">Réf: #{{ app.id }}</span>
          </div>
        </div>
      </div>
      
      <div class="stats" *ngIf="!loading && applications.length > 0">
        <div class="stat-card">
          <span class="stat-value">{{ applications.length }}</span>
          <span class="stat-label">Total candidatures</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ getCountByStatus('PENDING') }}</span>
          <span class="stat-label">En attente</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ getCountByStatus('ACCEPTED') }}</span>
          <span class="stat-label">Acceptées</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ getCountByStatus('REJECTED') }}</span>
          <span class="stat-label">Refusées</span>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .applications-container { padding: 2rem; max-width: 1000px; margin: 0 auto; }
    h1 { font-size: 2rem; margin-bottom: 2rem; color: #1e293b; }
    .loading { color: #64748b; font-style: italic; text-align: center; padding: 3rem; }
    .no-applications { text-align: center; padding: 4rem 2rem; background: #f8fafc; border-radius: 12px; }
    .empty-icon { font-size: 4rem; margin-bottom: 1rem; }
    .no-applications p { color: #64748b; margin-bottom: 1.5rem; font-size: 1.1rem; }
    .btn { display: inline-block; padding: 0.75rem 1.5rem; border-radius: 8px; font-size: 1rem; cursor: pointer; border: none; text-decoration: none; transition: all 0.2s; }
    .btn-primary { background: #6366f1; color: #fff; }
    .btn-primary:hover { background: #5558e3; }
    .applications-list { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
    .application-card { background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 1.5rem; transition: box-shadow 0.2s; }
    .application-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .application-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
    .status-badge { padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
    .status-badge.pending { background: #fef3c7; color: #92400e; }
    .status-badge.accepted { background: #dcfce7; color: #166534; }
    .status-badge.rejected { background: #fee2e2; color: #991b1b; }
    .status-badge.withdrawn { background: #e2e8f0; color: #475569; }
    .date { color: #94a3b8; font-size: 0.85rem; }
    .application-card h3 { margin: 0 0 0.5rem; font-size: 1.2rem; color: #1e293b; }
    .company { color: #64748b; margin: 0; }
    .application-footer { margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid #f1f5f9; }
    .app-id { color: #94a3b8; font-size: 0.8rem; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-top: 2rem; }
    .stat-card { background: #fff; border-radius: 12px; padding: 1.5rem; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .stat-value { display: block; font-size: 2rem; font-weight: 700; color: #6366f1; }
    .stat-label { color: #64748b; font-size: 0.9rem; }
  `]
})
export class MyApplicationsComponent implements OnInit {
    offerService = inject(OfferService);
    applications: Application[] = [];
    loading = true;

    ngOnInit() {
        this.loadApplications();
    }

    loadApplications() {
        this.loading = true;
        this.offerService.getMyApplications().subscribe({
            next: (data) => {
                this.applications = data;
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
            }
        });
    }

    getStatusLabel(status: string): string {
        const labels: { [key: string]: string } = {
            'PENDING': '⏳ En attente',
            'ACCEPTED': '✅ Acceptée',
            'REJECTED': '❌ Refusée',
            'WITHDRAWN': '↩️ Retirée'
        };
        return labels[status] || status;
    }

    getCountByStatus(status: string): number {
        return this.applications.filter(a => a.status === status).length;
    }
}
