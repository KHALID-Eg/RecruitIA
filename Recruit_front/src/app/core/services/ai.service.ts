import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { AiMatchResult } from '../../shared/models/ai-match.model';

@Injectable({
    providedIn: 'root'
})
export class AiService {
    private apiUrl = 'http://localhost:8888/ai';
    private http = inject(HttpClient);

    analyzeCandidate(cvInput: string | File, jobDescription: string, requiredSkills: string[] = []): Observable<AiMatchResult | null> {
        let obs: Observable<AiMatchResult>;

        if (cvInput instanceof File) {
            const formData = new FormData();
            formData.append('file', cvInput);
            formData.append('job_description', jobDescription);
            if (requiredSkills && requiredSkills.length > 0) {
                // Append each skill individually for List<String> binding in Spring
                requiredSkills.forEach(skill => formData.append('required_skills', skill));
            }
            obs = this.http.post<AiMatchResult>(`${this.apiUrl}/match-file`, formData);
        } else {
            const payload = {
                cvText: cvInput,
                jobDescription,
                requiredSkills
            };
            obs = this.http.post<AiMatchResult>(`${this.apiUrl}/match`, payload);
        }

        return obs.pipe(
            catchError(error => {
                console.error('AI Service Error:', error);
                return of(null);
            })
        );
    }
}
