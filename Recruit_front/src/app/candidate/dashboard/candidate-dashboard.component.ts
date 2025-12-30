import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CandidateService, Candidate } from '../../core/services/candidate.service';
import { OfferService, Offer, Application } from '../../core/services/offer.service';

@Component({
  selector: 'app-candidate-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <div class="welcome-section">
        <h1>👋 Bienvenue{{ profile?.firstName ? ', ' + profile?.firstName : '' }} !</h1>
        <p>Gérez votre profil et trouvez votre prochain emploi</p>
      </div>
      
      <!-- Quick Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-icon">📋</span>
          <span class="stat-value">{{ offersCount }}</span>
          <span class="stat-label">Offres disponibles</span>
        </div>
        <div class="stat-card">
          <span class="stat-icon">📝</span>
          <span class="stat-value">{{ applicationsCount }}</span>
          <span class="stat-label">Mes candidatures</span>
        </div>
        <div class="stat-card" [class.warning]="!profile?.cvFileName">
          <span class="stat-icon">📄</span>
          <span class="stat-value">{{ profile?.cvFileName ? '✓' : '✗' }}</span>
          <span class="stat-label">CV {{ profile?.cvFileName ? 'uploadé' : 'manquant' }}</span>
        </div>
      </div>
      
      <!-- Navigation Cards -->
      <div class="nav-grid">
        <a routerLink="/candidate/profile" class="nav-card">
          <div class="nav-icon">👤</div>
          <div class="nav-content">
            <h3>Mon Profil</h3>
            <p>Modifier mes informations et uploader mon CV</p>
          </div>
          <span class="nav-arrow">→</span>
        </a>
        
        <a routerLink="/candidate/offers" class="nav-card">
          <div class="nav-icon">💼</div>
          <div class="nav-content">
            <h3>Offres d'emploi</h3>
            <p>Parcourir et postuler aux offres disponibles</p>
          </div>
          <span class="nav-arrow">→</span>
        </a>
        
        <a routerLink="/candidate/applications" class="nav-card">
          <div class="nav-icon">📋</div>
          <div class="nav-content">
            <h3>Mes Candidatures</h3>
            <p>Suivre l'état de mes candidatures</p>
          </div>
          <span class="nav-arrow">→</span>
        </a>
      </div>
      
      <!-- Recent Offers Preview -->
      <div class="recent-section" *ngIf="recentOffers.length > 0">
        <h2>🔥 Offres récentes</h2>
        <div class="offers-preview">
          <div class="offer-mini" *ngFor="let offer of recentOffers">
            <h4>{{ offer.title }}</h4>
            <p>{{ offer.company }} · {{ offer.location || 'Remote' }}</p>
          </div>
        </div>
        <a routerLink="/candidate/offers" class="see-all">Voir toutes les offres →</a>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .welcome-section { margin-bottom: 2rem; }
    .welcome-section h1 { font-size: 2rem; color: #1e293b; margin: 0 0 0.5rem; }
    .welcome-section p { color: #64748b; font-size: 1.1rem; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .stat-card { background: #fff; border-radius: 12px; padding: 1.5rem; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .stat-card.warning { border: 2px solid #fbbf24; }
    .stat-icon { font-size: 2rem; display: block; margin-bottom: 0.5rem; }
    .stat-value { display: block; font-size: 2rem; font-weight: 700; color: #6366f1; }
    .stat-label { color: #64748b; font-size: 0.9rem; }
    .nav-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .nav-card { display: flex; align-items: center; background: #fff; border-radius: 12px; padding: 1.5rem; text-decoration: none; box-shadow: 0 2px 8px rgba(0,0,0,0.06); transition: all 0.2s; }
    .nav-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
    .nav-icon { font-size: 2.5rem; margin-right: 1rem; }
    .nav-content { flex: 1; }
    .nav-content h3 { margin: 0 0 0.25rem; color: #1e293b; font-size: 1.1rem; }
    .nav-content p { margin: 0; color: #64748b; font-size: 0.9rem; }
    .nav-arrow { font-size: 1.5rem; color: #6366f1; }
    .recent-section { background: #fff; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .recent-section h2 { margin: 0 0 1rem; font-size: 1.25rem; color: #1e293b; }
    .offers-preview { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem; }
    .offer-mini { padding: 0.75rem; background: #f8fafc; border-radius: 8px; }
    .offer-mini h4 { margin: 0 0 0.25rem; color: #1e293b; font-size: 1rem; }
    .offer-mini p { margin: 0; color: #64748b; font-size: 0.85rem; }
    .see-all { color: #6366f1; text-decoration: none; font-weight: 500; }
    .see-all:hover { text-decoration: underline; }
  `]
})
export class CandidateDashboardComponent implements OnInit {
  candidateService = inject(CandidateService);
  offerService = inject(OfferService);

  profile: Candidate | null = null;
  recentOffers: Offer[] = [];
  offersCount = 0;
  applicationsCount = 0;

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    // Load profile
    this.candidateService.getProfile().subscribe({
      next: (data) => this.profile = data,
      error: (err) => console.error('Failed to load profile', err)
    });

    // Load offers
    this.offerService.getOffers().subscribe({
      next: (data) => {
        this.offersCount = data.length;
        this.recentOffers = data.slice(0, 3);
      },
      error: (err) => console.error('Failed to load offers', err)
    });

    // Load applications count
    this.offerService.getMyApplications().subscribe({
      next: (data) => this.applicationsCount = data.length,
      error: (err) => console.error('Failed to load applications', err)
    });
  }
}
