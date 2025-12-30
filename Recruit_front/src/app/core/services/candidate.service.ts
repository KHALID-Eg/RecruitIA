import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Candidate {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
    cvFileName?: string;
    cvUploadDate?: string;
    cvText?: string;
    skills?: string[];
    extractedCategory?: string;
}

export interface CandidateUpdateRequest {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
}

@Injectable({
    providedIn: 'root'
})
export class CandidateService {
    private apiUrl = 'http://localhost:8888/candidates';
    private http = inject(HttpClient);

    // Get current user's profile
    getProfile(): Observable<Candidate> {
        return this.http.get<Candidate>(`${this.apiUrl}/me`);
    }

    // Update current user's profile
    updateProfile(data: CandidateUpdateRequest): Observable<Candidate> {
        return this.http.put<Candidate>(`${this.apiUrl}/me`, data);
    }

    // Upload CV (PDF only)
    uploadCv(file: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post(`${this.apiUrl}/me/cv`, formData);
    }

    // Download CV
    downloadCv(): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/me/cv`, {
            responseType: 'blob'
        });
    }

    // Download CV (for Recruiter)
    downloadCandidateCv(email: string): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/${email}/cv`, {
            responseType: 'blob'
        });
    }

    // Get Candidate by email (for Recruiter)
    getCandidateByEmail(email: string): Observable<Candidate> {
        return this.http.get<Candidate>(`${this.apiUrl}/${email}`);
    }
}
