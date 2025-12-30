package org.keah.offerservice.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.keah.offerservice.dto.ApplicationResponse;
import org.keah.offerservice.dto.ApplicationStatusRequest;
import org.keah.offerservice.dto.OfferRequest;
import org.keah.offerservice.dto.OfferResponse;
import org.keah.offerservice.dto.RecruiterStatsResponse;
import org.keah.offerservice.service.OfferService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/offers")
@RequiredArgsConstructor
public class OfferController {

    private final OfferService offerService;

    // =============================
    // 📋 LIST ALL ACTIVE OFFERS (for candidates)
    // =============================
    @GetMapping
    public ResponseEntity<List<OfferResponse>> getAllOffers() {
        List<OfferResponse> offers = offerService.getAllActiveOffers();
        return ResponseEntity.ok(offers);
    }

    // =============================
    // 🔍 GET OFFER BY ID
    // =============================
    @GetMapping("/{id}")
    public ResponseEntity<OfferResponse> getOfferById(@PathVariable Long id) {
        OfferResponse offer = offerService.getOfferById(id);
        return ResponseEntity.ok(offer);
    }

    // =============================
    // 📋 GET MY OFFERS (for recruiters)
    // =============================
    @GetMapping("/my-offers")
    public ResponseEntity<List<OfferResponse>> getMyOffers() {
        String email = getConnectedEmail();
        List<OfferResponse> offers = offerService.getOffersByRecruiter(email);
        return ResponseEntity.ok(offers);
    }

    // =============================
    // ➕ CREATE OFFER (for recruiters)
    // =============================
    @PostMapping
    public ResponseEntity<OfferResponse> createOffer(@Valid @RequestBody OfferRequest request) {
        String email = getConnectedEmail();
        OfferResponse created = offerService.createOffer(email, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // =============================
    // ✏️ UPDATE OFFER (for recruiters)
    // =============================
    @PutMapping("/{id}")
    public ResponseEntity<?> updateOffer(@PathVariable Long id, @Valid @RequestBody OfferRequest request) {
        String email = getConnectedEmail();
        try {
            OfferResponse updated = offerService.updateOffer(email, id, request);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    // =============================
    // 🗑️ DELETE OFFER (for recruiters)
    // =============================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOffer(@PathVariable Long id) {
        String email = getConnectedEmail();
        try {
            offerService.deleteOffer(email, id);
            return ResponseEntity.ok(Map.of("message", "Offer deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    // =============================
    // 📝 APPLY TO OFFER (for candidates)
    // =============================
    @PostMapping("/{id}/apply")
    public ResponseEntity<?> applyToOffer(@PathVariable Long id) {
        String email = getConnectedEmail();

        try {
            ApplicationResponse application = offerService.applyToOffer(email, id);
            return ResponseEntity.status(HttpStatus.CREATED).body(application);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage(),
                    "offerId", id));
        }
    }

    // =============================
    // 📋 GET MY APPLICATIONS (for candidates)
    // =============================
    @GetMapping("/my-applications")
    public ResponseEntity<List<ApplicationResponse>> getMyApplications() {
        String email = getConnectedEmail();
        List<ApplicationResponse> applications = offerService.getMyApplications(email);
        return ResponseEntity.ok(applications);
    }

    // =============================
    // 📋 GET APPLICATIONS FOR OFFER (for recruiters)
    // =============================
    @GetMapping("/{id}/applications")
    public ResponseEntity<List<ApplicationResponse>> getApplicationsForOffer(@PathVariable Long id) {
        List<ApplicationResponse> applications = offerService.getApplicationsForOffer(id);
        return ResponseEntity.ok(applications);
    }

    // =============================
    // ✅ UPDATE APPLICATION STATUS (for recruiters)
    // =============================
    @PutMapping("/applications/{id}/status")
    public ResponseEntity<?> updateApplicationStatus(
            @PathVariable Long id,
            @Valid @RequestBody ApplicationStatusRequest request) {
        String email = getConnectedEmail();
        try {
            ApplicationResponse updated = offerService.updateApplicationStatus(email, id, request.getStatus());
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    // =============================
    // 📊 GET RECRUITER STATS (for dashboard)
    // =============================
    @GetMapping("/recruiter/stats")
    public ResponseEntity<RecruiterStatsResponse> getRecruiterStats() {
        String email = getConnectedEmail();
        RecruiterStatsResponse stats = offerService.getRecruiterStats(email);
        return ResponseEntity.ok(stats);
    }

    // =============================
    // 🔧 HELPER: Get connected user email
    // =============================
    private String getConnectedEmail() {
        return SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
    }
}
