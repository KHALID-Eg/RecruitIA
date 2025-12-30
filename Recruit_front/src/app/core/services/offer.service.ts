import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Offer {
    id: number;
    title: string;
    description: string;
    company: string;
    location?: string;
    contractType?: string;
    salary?: number;
    publishedDate?: string;
    expirationDate?: string;
    active: boolean;
    domain?: string;
    requiredSkills?: string[];
}

export interface Application {
    id: number;
    offerId: number;
    offerTitle: string;
    company: string;
    candidateEmail?: string; // For recruiters
    applicationDate: string;
    status: string;
}

export interface OfferRequest {
    title: string;
    description?: string;
    company: string;
    location?: string;
    contractType?: string;
    salary?: number;
    expirationDate?: string;
    domain?: string;
    requiredSkills?: string[];
}

export interface RecruiterStats {
    totalOffers: number;
    totalApplications: number;
    pendingCount: number;
    acceptedCount: number;
    rejectedCount: number;
    applicationsByOffer: { [offerTitle: string]: number };
}

@Injectable({
    providedIn: 'root'
})
export class OfferService {
    private apiUrl = 'http://localhost:8888/offers';
    private http = inject(HttpClient);

    // ======== CANDIDATE METHODS ========

    // Get all active offers
    getOffers(): Observable<Offer[]> {
        return this.http.get<Offer[]>(this.apiUrl);
    }

    // Get offer by ID
    getOfferById(id: number): Observable<Offer> {
        return this.http.get<Offer>(`${this.apiUrl}/${id}`);
    }

    // Apply to an offer (for candidates)
    applyToOffer(offerId: number): Observable<Application> {
        return this.http.post<Application>(`${this.apiUrl}/${offerId}/apply`, {});
    }

    // Get my applications (for candidates)
    getMyApplications(): Observable<Application[]> {
        return this.http.get<Application[]>(`${this.apiUrl}/my-applications`);
    }

    // ======== RECRUITER METHODS ========

    // Get my offers (for recruiters)
    getMyOffers(): Observable<Offer[]> {
        return this.http.get<Offer[]>(`${this.apiUrl}/my-offers`);
    }

    // Create new offer (for recruiters)
    createOffer(offer: OfferRequest): Observable<Offer> {
        return this.http.post<Offer>(this.apiUrl, offer);
    }

    // Update offer (for recruiters)
    updateOffer(id: number, offer: OfferRequest): Observable<Offer> {
        return this.http.put<Offer>(`${this.apiUrl}/${id}`, offer);
    }

    // Delete offer (for recruiters)
    deleteOffer(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

    // Get applications for an offer (for recruiters)
    getApplicationsForOffer(offerId: number): Observable<Application[]> {
        return this.http.get<Application[]>(`${this.apiUrl}/${offerId}/applications`);
    }

    // Update application status (for recruiters)
    updateApplicationStatus(applicationId: number, status: 'ACCEPTED' | 'REJECTED'): Observable<Application> {
        return this.http.put<Application>(`${this.apiUrl}/applications/${applicationId}/status`, { status });
    }

    // Get recruiter stats (for dashboard)
    getRecruiterStats(): Observable<RecruiterStats> {
        return this.http.get<RecruiterStats>(`${this.apiUrl}/recruiter/stats`);
    }
}

