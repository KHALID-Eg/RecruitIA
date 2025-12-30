import { Routes } from '@angular/router';
import { authGuard, candidateGuard, recruiterGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './shared/main-layout.component';

export const routes: Routes = [
    // Redirect root to login
    { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

    // Auth Routes (No Layout)
    {
        path: 'auth',
        children: [
            { path: 'login', loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) },
            { path: 'register-candidate', loadComponent: () => import('./auth/register-candidate/register-candidate.component').then(m => m.RegisterCandidateComponent) }
        ]
    },

    // Candidate Routes (Protected, with Layout)
    {
        path: 'candidate',
        component: MainLayoutComponent,
        canActivate: [candidateGuard],
        children: [
            { path: 'dashboard', loadComponent: () => import('./candidate/dashboard/candidate-dashboard.component').then(m => m.CandidateDashboardComponent) },
            { path: 'profile', loadComponent: () => import('./candidate/profile/candidate-profile.component').then(m => m.CandidateProfileComponent) },
            { path: 'offers', loadComponent: () => import('./candidate/offers/offer-list.component').then(m => m.OfferListComponent) },
            { path: 'applications', loadComponent: () => import('./candidate/applications/my-applications.component').then(m => m.MyApplicationsComponent) },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },

    // Recruiter Routes (Protected, with Layout)
    {
        path: 'recruiter',
        component: MainLayoutComponent,
        canActivate: [recruiterGuard],
        children: [
            { path: 'dashboard', loadComponent: () => import('./recruiter/dashboard/recruiter-dashboard.component').then(m => m.RecruiterDashboardComponent) },
            { path: 'my-offers', loadComponent: () => import('./recruiter/offers/my-offers/my-offers.component').then(m => m.MyOffersComponent) },
            { path: 'offers/create', loadComponent: () => import('./recruiter/offers/offer-create/offer-create.component').then(m => m.OfferCreateComponent) },
            { path: 'offers/:id/applications', loadComponent: () => import('./recruiter/applications/offer-applications.component').then(m => m.OfferApplicationsComponent) },
            { path: 'ai-analysis/:offerId', loadComponent: () => import('./recruiter/ai-analysis/ai-analysis.component').then(m => m.AiAnalysisComponent) },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },

    // Wildcard
    { path: '**', redirectTo: 'auth/login' }
];
