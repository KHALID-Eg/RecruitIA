import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { OfferService, Offer, Application } from '../../core/services/offer.service';
import { AiService } from '../../core/services/ai.service';
import { AiMatchResult } from '../../shared/models/ai-match.model';
import { CandidateService } from '../../core/services/candidate.service';

interface AnalyzedCandidate {
    application: Application;
    aiResult?: AiMatchResult;
    analyzing: boolean;
}

@Component({
    selector: 'app-ai-analysis',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './ai-analysis.component.html',
    styleUrls: ['./ai-analysis.component.css']
})
export class AiAnalysisComponent implements OnInit {
    offerService = inject(OfferService);
    aiService = inject(AiService);
    candidateService = inject(CandidateService);
    route = inject(ActivatedRoute);

    offer?: Offer;
    analyzedCandidates: AnalyzedCandidate[] = [];
    loading = false;

    ngOnInit() {
        const offerId = Number(this.route.snapshot.paramMap.get('offerId'));
        if (offerId) {
            this.loadData(offerId);
        }
    }

    loadData(offerId: number) {
        this.loading = true;

        // 1. Load Offer
        this.offerService.getOfferById(offerId).subscribe(offer => {
            this.offer = offer;

            // 2. Load Applications
            this.offerService.getApplicationsForOffer(offerId).subscribe(apps => {
                this.analyzedCandidates = apps.map(app => ({
                    application: app,
                    analyzing: false
                }));
                this.loading = false;

                // Optional: Auto-analyze all
                // this.analyzeAll();
            });
        });
    }

    analyzeSingleCandidate(item: AnalyzedCandidate) {
        if (!this.offer) return;

        item.analyzing = true;

        const email = item.application.candidateEmail;
        if (!email) {
            console.warn('No candidate email found for application', item.application.id);
            item.analyzing = false;
            return;
        }

        // Fetch full candidate profile including cvText
        this.candidateService.getCandidateByEmail(email).subscribe(candidate => {
            const cvText = candidate.cvText;

            if (!cvText) {
                console.warn(`No CV Text found for ${candidate.email}`);
            }

            // If we have requiredSkills in candidate (extracted), we could use them too?
            // But usually we match Offer.requiredSkills vs Candidate.cvText.

            this.aiService.analyzeCandidate(cvText || '', this.offer!.description, this.offer!.requiredSkills)
                .subscribe(result => {
                    if (result) {
                        item.aiResult = result;
                    }
                    item.analyzing = false;
                    this.sortCandidates();
                });
        }, error => {
            console.error('Failed to fetch candidate details', error);
            item.analyzing = false;
        });
    }

    acceptCandidate(appId: number) {
        this.offerService.updateApplicationStatus(appId, 'ACCEPTED').subscribe(() => {
            this.updateLocalStatus(appId, 'ACCEPTED');
        });
    }

    rejectCandidate(appId: number) {
        this.offerService.updateApplicationStatus(appId, 'REJECTED').subscribe(() => {
            this.updateLocalStatus(appId, 'REJECTED');
        });
    }

    private updateLocalStatus(appId: number, status: string) {
        const candidate = this.analyzedCandidates.find(c => c.application.id === appId);
        if (candidate) {
            candidate.application.status = status;
        }
    }

    getScoreClass(score: number): string {
        if (score >= 70) return 'high-match';
        if (score >= 40) return 'medium-match';
        return 'low-match';
    }

    private sortCandidates() {
        // Sort by score desc
        this.analyzedCandidates.sort((a, b) => {
            const scoreA = a.aiResult ? a.aiResult.matchScore : -1;
            const scoreB = b.aiResult ? b.aiResult.matchScore : -1;
            return scoreB - scoreA;
        });
    }
}
