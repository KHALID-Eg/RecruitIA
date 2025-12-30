package org.keah.candidateservice.controller;

import lombok.RequiredArgsConstructor;
import org.keah.candidateservice.dto.CandidateRequest;
import org.keah.candidateservice.dto.CandidateUpdateRequest;
import org.keah.candidateservice.entity.Candidate;
import org.keah.candidateservice.service.CandidateService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/candidates")
@RequiredArgsConstructor
public class CandidateController {

    private final CandidateService candidateService;

    // =============================
    // 🔁 APPEL INTERNE AUTH-SERVICE
    // =============================
    @PostMapping("/internal")
    public Candidate createCandidate(@RequestBody CandidateRequest request) {
        return candidateService.createCandidate(request);
    }

    // =============================
    // 🔐 GET PROFILE CONNECTÉ
    // =============================
    @GetMapping("/me")
    public Candidate me() {
        String email = getConnectedEmail();
        return candidateService.getByEmail(email);
    }

    // =============================
    // 🆕 UPDATE PROFILE
    // =============================
    @PutMapping("/me")
    public ResponseEntity<Candidate> updateProfile(@RequestBody CandidateUpdateRequest request) {
        String email = getConnectedEmail();
        Candidate updated = candidateService.updateCandidate(email, request);
        return ResponseEntity.ok(updated);
    }

    // =============================
    // 🆕 UPLOAD CV (PDF only)
    // =============================
    @PostMapping("/me/cv")
    public ResponseEntity<?> uploadCv(@RequestParam("file") MultipartFile file) {
        String email = getConnectedEmail();

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }

        Candidate updated = candidateService.uploadCv(email, file);
        return ResponseEntity.ok(Map.of(
                "message", "CV uploaded successfully",
                "filename", updated.getCvFileName(),
                "uploadDate", updated.getCvUploadDate()));
    }

    // =============================
    // 🆕 DOWNLOAD CV
    // =============================
    @GetMapping("/me/cv")
    public ResponseEntity<Resource> downloadCv() {
        String email = getConnectedEmail();

        Resource resource = candidateService.getCvResource(email);
        String filename = candidateService.getCvFileName(email);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(resource);
    }

    // =============================
    // 🆕 DOWNLOAD CV (RECRUITER)
    // =============================
    @GetMapping("/{email}/cv")
    public ResponseEntity<Resource> downloadCvForRecruiter(@PathVariable String email) {
        // En pro, on vérifierait ici si le connectedUser est RECRUITER
        // Mais @PreAuthorize ou SecurityConfig le gère généralement

        Resource resource = candidateService.getCvResource(email);
        String filename = candidateService.getCvFileName(email);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(resource);
    }

    // =============================
    // 🔍 GET CANDIDATE BY EMAIL (RECRUITER)
    // =============================
    @GetMapping("/{email}")
    public Candidate getCandidateByEmail(@PathVariable String email) {
        // En pro: Verify caller is Recruiter
        Candidate candidate = candidateService.getByEmail(email);

        System.out.println("DEBUG: Fetching candidate: " + email);
        if (candidate.getCvText() != null) {
            System.out.println("DEBUG: CV Text found (" + candidate.getCvText().length() + " chars): " +
                    (candidate.getCvText().length() > 50 ? candidate.getCvText().substring(0, 50) + "..."
                            : candidate.getCvText()));
        } else {
            System.out.println("DEBUG: CV Text is NULL for " + email);
        }

        return candidate;
    }

    // =============================
    // 🔧 HELPER: Get connected user email
    // =============================
    private String getConnectedEmail() {
        return SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
    }

    @PostMapping("/admin/reprocess-cvs")
    public ResponseEntity<String> reprocessCvs() {
        String report = candidateService.reprocessAllMissingCvTexts();
        return ResponseEntity.ok(report);
    }
}
