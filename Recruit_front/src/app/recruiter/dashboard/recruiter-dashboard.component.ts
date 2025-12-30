import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OfferService, RecruiterStats } from '../../core/services/offer.service';

@Component({
   selector: 'app-recruiter-dashboard',
   standalone: true,
   imports: [CommonModule, RouterModule],
   template: `
    <div class="dashboard-container">
      <h1>📊 Tableau de bord Recruteur</h1>
      
      <div *ngIf="loading" class="loading">Chargement des statistiques...</div>
      
      <div *ngIf="!loading && stats" class="dashboard-content">
        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card primary">
            <span class="stat-value">{{ stats.totalOffers }}</span>
            <span class="stat-label">💼 Offres publiées</span>
          </div>
          <div class="stat-card info">
            <span class="stat-value">{{ stats.totalApplications }}</span>
            <span class="stat-label">📋 Candidatures reçues</span>
          </div>
          <div class="stat-card warning">
            <span class="stat-value">{{ stats.pendingCount }}</span>
            <span class="stat-label">⏳ En attente</span>
          </div>
          <div class="stat-card success">
            <span class="stat-value">{{ stats.acceptedCount }}</span>
            <span class="stat-label">✅ Acceptées</span>
          </div>
          <div class="stat-card danger">
            <span class="stat-value">{{ stats.rejectedCount }}</span>
            <span class="stat-label">❌ Refusées</span>
          </div>
        </div>
        
        <!-- Charts Section -->
        <div class="charts-section">
          <!-- Pie Chart: Status Distribution -->
          <div class="chart-card">
            <h3>📈 Répartition des statuts</h3>
            <div class="pie-chart-container">
              <svg viewBox="0 0 200 200" class="pie-chart">
                <circle cx="100" cy="100" [attr.r]="pieRadius" fill="transparent"
                  [attr.stroke]="'#fbbf24'" [attr.stroke-width]="pieStroke"
                  [attr.stroke-dasharray]="getPieSegment('pending')"
                  [attr.stroke-dashoffset]="getPieOffset('pending')"
                  transform="rotate(-90 100 100)"/>
                <circle cx="100" cy="100" [attr.r]="pieRadius" fill="transparent"
                  [attr.stroke]="'#22c55e'" [attr.stroke-width]="pieStroke"
                  [attr.stroke-dasharray]="getPieSegment('accepted')"
                  [attr.stroke-dashoffset]="getPieOffset('accepted')"
                  transform="rotate(-90 100 100)"/>
                <circle cx="100" cy="100" [attr.r]="pieRadius" fill="transparent"
                  [attr.stroke]="'#ef4444'" [attr.stroke-width]="pieStroke"
                  [attr.stroke-dasharray]="getPieSegment('rejected')"
                  [attr.stroke-dashoffset]="getPieOffset('rejected')"
                  transform="rotate(-90 100 100)"/>
              </svg>
              <div class="pie-legend">
                <div class="legend-item"><span class="dot pending"></span> En attente ({{ stats.pendingCount }})</div>
                <div class="legend-item"><span class="dot accepted"></span> Acceptées ({{ stats.acceptedCount }})</div>
                <div class="legend-item"><span class="dot rejected"></span> Refusées ({{ stats.rejectedCount }})</div>
              </div>
            </div>
          </div>
          
          <!-- Bar Chart: Applications by Offer -->
          <div class="chart-card">
            <h3>📊 Candidatures par offre</h3>
            <div class="bar-chart">
              <div class="bar-row" *ngFor="let entry of applicationsByOfferEntries">
                <span class="bar-label">{{ entry.title | slice:0:20 }}{{ entry.title.length > 20 ? '...' : '' }}</span>
                <div class="bar-wrapper">
                  <div class="bar" [style.width.%]="getBarWidth(entry.count)">
                    <span class="bar-value">{{ entry.count }}</span>
                  </div>
                </div>
              </div>
              <div *ngIf="applicationsByOfferEntries.length === 0" class="no-data">
                Aucune offre publiée
              </div>
            </div>
          </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="quick-actions">
          <a routerLink="/recruiter/my-offers" class="action-card">
            <span class="action-icon">📋</span>
            <span>Gérer mes offres</span>
          </a>
          <a routerLink="/recruiter/offers/create" class="action-card">
            <span class="action-icon">➕</span>
            <span>Créer une offre</span>
          </a>
        </div>
      </div>
    </div>
  `,
   styles: [`
    .dashboard-container { padding: 2rem; max-width: 1400px; margin: 0 auto; }
    h1 { font-size: 2rem; margin-bottom: 2rem; color: #1e293b; }
    .loading { text-align: center; color: #64748b; padding: 3rem; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .stat-card { background: #fff; border-radius: 12px; padding: 1.5rem; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border-left: 4px solid; }
    .stat-card.primary { border-color: #6366f1; }
    .stat-card.info { border-color: #3b82f6; }
    .stat-card.warning { border-color: #fbbf24; }
    .stat-card.success { border-color: #22c55e; }
    .stat-card.danger { border-color: #ef4444; }
    .stat-value { display: block; font-size: 2.5rem; font-weight: 700; color: #1e293b; }
    .stat-label { color: #64748b; font-size: 0.9rem; }
    .charts-section { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .chart-card { background: #fff; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .chart-card h3 { margin: 0 0 1.5rem; color: #1e293b; font-size: 1.1rem; }
    .pie-chart-container { display: flex; align-items: center; gap: 2rem; flex-wrap: wrap; justify-content: center; }
    .pie-chart { width: 150px; height: 150px; }
    .pie-legend { display: flex; flex-direction: column; gap: 0.5rem; }
    .legend-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: #475569; }
    .dot { width: 12px; height: 12px; border-radius: 50%; }
    .dot.pending { background: #fbbf24; }
    .dot.accepted { background: #22c55e; }
    .dot.rejected { background: #ef4444; }
    .bar-chart { display: flex; flex-direction: column; gap: 0.75rem; }
    .bar-row { display: flex; align-items: center; gap: 1rem; }
    .bar-label { width: 120px; font-size: 0.85rem; color: #475569; text-align: right; flex-shrink: 0; }
    .bar-wrapper { flex: 1; background: #f1f5f9; border-radius: 4px; height: 24px; overflow: hidden; }
    .bar { background: linear-gradient(90deg, #6366f1, #8b5cf6); height: 100%; border-radius: 4px; display: flex; align-items: center; justify-content: flex-end; padding-right: 8px; min-width: 30px; transition: width 0.5s ease; }
    .bar-value { color: #fff; font-size: 0.75rem; font-weight: 600; }
    .no-data { color: #94a3b8; text-align: center; padding: 1rem; }
    .quick-actions { display: flex; gap: 1rem; flex-wrap: wrap; }
    .action-card { display: flex; align-items: center; gap: 0.75rem; background: #fff; padding: 1rem 1.5rem; border-radius: 12px; text-decoration: none; color: #1e293b; box-shadow: 0 2px 8px rgba(0,0,0,0.06); transition: all 0.2s; }
    .action-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .action-icon { font-size: 1.5rem; }
  `]
})
export class RecruiterDashboardComponent implements OnInit {
   offerService = inject(OfferService);
   stats: RecruiterStats | null = null;
   loading = true;

   pieRadius = 70;
   pieStroke = 40;
   pieCircumference = 2 * Math.PI * this.pieRadius;

   applicationsByOfferEntries: { title: string; count: number }[] = [];
   maxApplications = 1;

   ngOnInit() {
      this.loadStats();
   }

   loadStats() {
      this.loading = true;
      this.offerService.getRecruiterStats().subscribe({
         next: (data) => {
            this.stats = data;
            this.processApplicationsByOffer();
            this.loading = false;
         },
         error: (err) => {
            console.error('Failed to load stats', err);
            this.loading = false;
         }
      });
   }

   processApplicationsByOffer() {
      if (!this.stats?.applicationsByOffer) return;
      this.applicationsByOfferEntries = Object.entries(this.stats.applicationsByOffer)
         .map(([title, count]) => ({ title, count }))
         .sort((a, b) => b.count - a.count);
      this.maxApplications = Math.max(...this.applicationsByOfferEntries.map(e => e.count), 1);
   }

   getBarWidth(count: number): number {
      return (count / this.maxApplications) * 100;
   }

   getPieSegment(type: 'pending' | 'accepted' | 'rejected'): string {
      if (!this.stats) return `0 ${this.pieCircumference}`;
      const total = this.stats.totalApplications || 1;
      const value = type === 'pending' ? this.stats.pendingCount :
         type === 'accepted' ? this.stats.acceptedCount :
            this.stats.rejectedCount;
      const segment = (value / total) * this.pieCircumference;
      return `${segment} ${this.pieCircumference}`;
   }

   getPieOffset(type: 'pending' | 'accepted' | 'rejected'): number {
      if (!this.stats) return 0;
      const total = this.stats.totalApplications || 1;
      let offset = 0;
      if (type === 'accepted') {
         offset = (this.stats.pendingCount / total) * this.pieCircumference;
      } else if (type === 'rejected') {
         offset = ((this.stats.pendingCount + this.stats.acceptedCount) / total) * this.pieCircumference;
      }
      return -offset;
   }
}
