import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CandidateService, Candidate, CandidateUpdateRequest } from '../../core/services/candidate.service';

@Component({
  selector: 'app-candidate-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-container">
      <h1>Mon Profil</h1>
      
      <div *ngIf="loading" class="loading">Chargement du profil...</div>
      
      <div *ngIf="profile && !loading" class="profile-card">
        <!-- Profile Header -->
        <div class="profile-header">
          <div class="avatar">{{ profile.firstName[0] }}{{ profile.lastName[0] }}</div>
          <div class="profile-info">
            <h2>{{ profile.firstName }} {{ profile.lastName }}</h2>
            <p class="email">{{ profile.email }}</p>
          </div>
          <button *ngIf="!editMode" (click)="toggleEditMode()" class="btn btn-secondary">
            ✏️ Modifier
          </button>
        </div>
        
        <!-- View Mode -->
        <div *ngIf="!editMode" class="profile-details">
          <div class="detail-row">
            <span class="label">Téléphone:</span>
            <span class="value">{{ profile.phone || 'Non renseigné' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Adresse:</span>
            <span class="value">{{ profile.address || 'Non renseignée' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">CV:</span>
            <span class="value" *ngIf="profile.cvFileName">
              {{ profile.cvFileName }}
              <button (click)="downloadCv()" class="btn-link">📥 Télécharger</button>
            </span>
            <span class="value" *ngIf="!profile.cvFileName">Aucun CV uploadé</span>
          </div>
        </div>
        
        <!-- Edit Mode -->
        <div *ngIf="editMode" class="profile-edit">
          <div class="form-group">
            <label>Prénom</label>
            <input type="text" [(ngModel)]="editData.firstName" />
          </div>
          <div class="form-group">
            <label>Nom</label>
            <input type="text" [(ngModel)]="editData.lastName" />
          </div>
          <div class="form-group">
            <label>Téléphone</label>
            <input type="text" [(ngModel)]="editData.phone" placeholder="+33 6 12 34 56 78" />
          </div>
          <div class="form-group">
            <label>Adresse</label>
            <input type="text" [(ngModel)]="editData.address" placeholder="Paris, France" />
          </div>
          
          <div class="button-group">
            <button (click)="saveProfile()" class="btn btn-primary" [disabled]="saving">
              {{ saving ? 'Sauvegarde...' : '💾 Sauvegarder' }}
            </button>
            <button (click)="cancelEdit()" class="btn btn-secondary">Annuler</button>
          </div>
        </div>
        
        <!-- CV Upload Section -->
        <div class="cv-section">
          <h3>📄 Curriculum Vitae</h3>
          <div class="cv-upload">
            <input type="file" #cvInput accept=".pdf" (change)="onCvSelected($event)" style="display:none" />
            <button (click)="cvInput.click()" class="btn btn-primary" [disabled]="uploading">
              {{ uploading ? 'Upload en cours...' : '📤 Uploader un CV (PDF)' }}
            </button>
            <span class="cv-info" *ngIf="profile.cvFileName">
              Dernier CV: {{ profile.cvFileName }} ({{ profile.cvUploadDate | date:'dd/MM/yyyy HH:mm' }})
            </span>
          </div>
          <div *ngIf="uploadSuccess" class="success-message">✅ CV uploadé avec succès!</div>
          <div *ngIf="uploadError" class="error-message">❌ {{ uploadError }}</div>
        </div>
      </div>
      
      <div *ngIf="error" class="error-message">{{ error }}</div>
    </div>
  `,
  styles: [`
    .profile-container { padding: 2rem; max-width: 800px; margin: 0 auto; }
    h1 { font-size: 2rem; margin-bottom: 1.5rem; color: #1e293b; }
    .loading { color: #64748b; font-style: italic; }
    .profile-card { background: #fff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 2rem; }
    .profile-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid #e2e8f0; }
    .avatar { width: 80px; height: 80px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.5rem; font-weight: bold; }
    .profile-info { flex: 1; }
    .profile-info h2 { margin: 0; font-size: 1.5rem; color: #1e293b; }
    .profile-info .email { color: #64748b; margin: 0.25rem 0 0; }
    .profile-details { margin-bottom: 2rem; }
    .detail-row { display: flex; padding: 0.75rem 0; border-bottom: 1px solid #f1f5f9; }
    .detail-row .label { width: 120px; font-weight: 600; color: #475569; }
    .detail-row .value { flex: 1; color: #1e293b; }
    .profile-edit { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .form-group label { font-weight: 600; color: #475569; }
    .form-group input { padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 1rem; }
    .form-group input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
    .button-group { display: flex; gap: 1rem; margin-top: 1rem; }
    .btn { padding: 0.75rem 1.5rem; border-radius: 8px; font-size: 1rem; cursor: pointer; border: none; transition: all 0.2s; }
    .btn-primary { background: #6366f1; color: #fff; }
    .btn-primary:hover { background: #5558e3; }
    .btn-primary:disabled { background: #a5b4fc; cursor: not-allowed; }
    .btn-secondary { background: #f1f5f9; color: #475569; }
    .btn-secondary:hover { background: #e2e8f0; }
    .btn-link { background: none; border: none; color: #6366f1; cursor: pointer; text-decoration: underline; margin-left: 0.5rem; }
    .cv-section { background: #f8fafc; padding: 1.5rem; border-radius: 8px; margin-top: 1.5rem; }
    .cv-section h3 { margin: 0 0 1rem; color: #1e293b; }
    .cv-upload { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .cv-info { color: #64748b; font-size: 0.9rem; }
    .success-message { color: #22c55e; margin-top: 1rem; }
    .error-message { color: #ef4444; margin-top: 1rem; }
  `]
})
export class CandidateProfileComponent implements OnInit {
  candidateService = inject(CandidateService);
  profile: Candidate | null = null;
  loading = true;
  error = '';

  editMode = false;
  editData: CandidateUpdateRequest = {};
  saving = false;

  uploading = false;
  uploadSuccess = false;
  uploadError = '';

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.loading = true;
    this.candidateService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.error = 'Erreur lors du chargement du profil';
      }
    });
  }

  toggleEditMode() {
    this.editMode = true;
    this.editData = {
      firstName: this.profile?.firstName,
      lastName: this.profile?.lastName,
      phone: this.profile?.phone,
      address: this.profile?.address
    };
  }

  cancelEdit() {
    this.editMode = false;
    this.editData = {};
  }

  saveProfile() {
    this.saving = true;
    this.candidateService.updateProfile(this.editData).subscribe({
      next: (updated) => {
        this.profile = updated;
        this.editMode = false;
        this.saving = false;
      },
      error: (err) => {
        console.error(err);
        this.saving = false;
        this.error = 'Erreur lors de la mise à jour';
      }
    });
  }

  onCvSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      this.uploadError = 'Seuls les fichiers PDF sont acceptés';
      return;
    }

    this.uploading = true;
    this.uploadSuccess = false;
    this.uploadError = '';

    this.candidateService.uploadCv(file).subscribe({
      next: (res) => {
        this.uploading = false;
        this.uploadSuccess = true;
        this.loadProfile(); // Reload to get updated CV info
      },
      error: (err) => {
        console.error(err);
        this.uploading = false;
        this.uploadError = err.error?.error || 'Erreur lors de l\'upload';
      }
    });
  }

  downloadCv() {
    this.candidateService.downloadCv().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.profile?.cvFileName || 'cv.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error(err);
        this.error = 'Erreur lors du téléchargement';
      }
    });
  }
}
