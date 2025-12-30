package org.keah.offerservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keah.offerservice.dto.ApplicationResponse;
import org.keah.offerservice.dto.OfferRequest;
import org.keah.offerservice.dto.OfferResponse;
import org.keah.offerservice.dto.RecruiterStatsResponse;
import org.keah.offerservice.entity.Application;
import org.keah.offerservice.entity.Offer;
import org.keah.offerservice.repository.ApplicationRepository;
import org.keah.offerservice.repository.OfferRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OfferService {

    private final OfferRepository offerRepository;
    private final ApplicationRepository applicationRepository;

    // =============================
    // 📋 GET ALL ACTIVE OFFERS (for candidates)
    // =============================
    public List<OfferResponse> getAllActiveOffers() {
        return offerRepository.findByActiveTrue()
                .stream()
                .map(this::toOfferResponse)
                .collect(Collectors.toList());
    }

    // =============================
    // 📋 GET ALL OFFERS (for recruiters/admin)
    // =============================
    public List<OfferResponse> getAllOffers() {
        return offerRepository.findAll()
                .stream()
                .map(this::toOfferResponse)
                .collect(Collectors.toList());
    }

    // =============================
    // 📋 GET MY OFFERS (for recruiters)
    // =============================
    public List<OfferResponse> getOffersByRecruiter(String recruiterEmail) {
        return offerRepository.findByRecruiterEmail(recruiterEmail)
                .stream()
                .map(this::toOfferResponse)
                .collect(Collectors.toList());
    }

    // =============================
    // 🔍 GET OFFER BY ID
    // =============================
    public OfferResponse getOfferById(Long id) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offer not found with id: " + id));
        return toOfferResponse(offer);
    }

    // =============================
    // ➕ CREATE OFFER (for recruiters)
    // =============================
    @Transactional
    public OfferResponse createOffer(String recruiterEmail, OfferRequest request) {
        Offer offer = Offer.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .company(request.getCompany())
                .location(request.getLocation())
                .contractType(request.getContractType())
                .salary(request.getSalary())
                .publishedDate(LocalDate.now())
                .expirationDate(request.getExpirationDate())
                .active(true)
                .recruiterEmail(recruiterEmail)
                .domain(request.getDomain())
                .requiredSkills(request.getRequiredSkills())
                .build();

        Offer saved = offerRepository.save(offer);
        log.info("Offer created: {} by {}", saved.getTitle(), recruiterEmail);
        return toOfferResponse(saved);
    }

    // =============================
    // ✏️ UPDATE OFFER (for recruiters)
    // =============================
    @Transactional
    public OfferResponse updateOffer(String recruiterEmail, Long offerId, OfferRequest request) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offer not found with id: " + offerId));

        // Verify ownership
        if (!offer.getRecruiterEmail().equals(recruiterEmail)) {
            throw new RuntimeException("You are not authorized to modify this offer");
        }

        // Update fields
        if (request.getTitle() != null)
            offer.setTitle(request.getTitle());
        if (request.getDescription() != null)
            offer.setDescription(request.getDescription());
        if (request.getCompany() != null)
            offer.setCompany(request.getCompany());
        if (request.getLocation() != null)
            offer.setLocation(request.getLocation());
        if (request.getContractType() != null)
            offer.setContractType(request.getContractType());
        if (request.getSalary() != null)
            offer.setSalary(request.getSalary());
        if (request.getExpirationDate() != null)
            offer.setExpirationDate(request.getExpirationDate());
        if (request.getDomain() != null)
            offer.setDomain(request.getDomain());
        if (request.getRequiredSkills() != null)
            offer.setRequiredSkills(request.getRequiredSkills());

        Offer saved = offerRepository.save(offer);
        log.info("Offer updated: {} by {}", saved.getTitle(), recruiterEmail);
        return toOfferResponse(saved);
    }

    // =============================
    // 🗑️ DELETE OFFER (for recruiters)
    // =============================
    @Transactional
    public void deleteOffer(String recruiterEmail, Long offerId) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offer not found with id: " + offerId));

        // Verify ownership
        if (!offer.getRecruiterEmail().equals(recruiterEmail)) {
            throw new RuntimeException("You are not authorized to delete this offer");
        }

        // Delete related applications first to avoid FK constraint violation
        applicationRepository.deleteByOfferId(offerId);

        offerRepository.delete(offer);
        log.info("Offer deleted: {} by {}", offerId, recruiterEmail);
    }

    // =============================
    // 📝 APPLY TO OFFER (for candidates)
    // =============================
    @Transactional
    public ApplicationResponse applyToOffer(String candidateEmail, Long offerId) {
        // Check if offer exists and is active
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offer not found with id: " + offerId));

        if (!offer.isActive()) {
            throw new RuntimeException("This offer is no longer active");
        }

        // Check for duplicate application
        if (applicationRepository.existsByCandidateEmailAndOfferId(candidateEmail, offerId)) {
            throw new RuntimeException("You have already applied to this offer");
        }

        // Create application
        Application application = Application.builder()
                .candidateEmail(candidateEmail)
                .offer(offer)
                .applicationDate(LocalDateTime.now())
                .status("PENDING")
                .build();

        Application saved = applicationRepository.save(application);
        log.info("Application submitted: {} applied to offer {}", candidateEmail, offerId);

        return toApplicationResponse(saved);
    }

    // =============================
    // ✅ UPDATE APPLICATION STATUS (for recruiters)
    // =============================
    @Transactional
    public ApplicationResponse updateApplicationStatus(String recruiterEmail, Long applicationId, String status) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + applicationId));

        // Verify recruiter owns the offer
        if (!application.getOffer().getRecruiterEmail().equals(recruiterEmail)) {
            throw new RuntimeException("You are not authorized to update this application");
        }

        application.setStatus(status);
        Application saved = applicationRepository.save(application);
        log.info("Application {} status changed to {} by {}", applicationId, status, recruiterEmail);

        return toApplicationResponse(saved);
    }

    // =============================
    // 📋 GET MY APPLICATIONS (for candidates)
    // =============================
    public List<ApplicationResponse> getMyApplications(String candidateEmail) {
        return applicationRepository.findByCandidateEmail(candidateEmail)
                .stream()
                .map(this::toApplicationResponse)
                .collect(Collectors.toList());
    }

    // =============================
    // 📋 GET APPLICATIONS FOR OFFER (for recruiters)
    // =============================
    public List<ApplicationResponse> getApplicationsForOffer(Long offerId) {
        return applicationRepository.findByOfferId(offerId)
                .stream()
                .map(this::toApplicationResponse)
                .collect(Collectors.toList());
    }

    // =============================
    // 📊 GET RECRUITER STATS (for dashboard)
    // =============================
    public RecruiterStatsResponse getRecruiterStats(String recruiterEmail) {
        List<Offer> offers = offerRepository.findByRecruiterEmail(recruiterEmail);

        long totalApplications = applicationRepository.countByOfferRecruiterEmail(recruiterEmail);
        long pendingCount = applicationRepository.countByOfferRecruiterEmailAndStatus(recruiterEmail, "PENDING");
        long acceptedCount = applicationRepository.countByOfferRecruiterEmailAndStatus(recruiterEmail, "ACCEPTED");
        long rejectedCount = applicationRepository.countByOfferRecruiterEmailAndStatus(recruiterEmail, "REJECTED");

        // Applications by offer
        Map<String, Long> applicationsByOffer = new HashMap<>();
        for (Offer offer : offers) {
            long count = applicationRepository.findByOfferId(offer.getId()).size();
            applicationsByOffer.put(offer.getTitle(), count);
        }

        return RecruiterStatsResponse.builder()
                .totalOffers(offers.size())
                .totalApplications(totalApplications)
                .pendingCount(pendingCount)
                .acceptedCount(acceptedCount)
                .rejectedCount(rejectedCount)
                .applicationsByOffer(applicationsByOffer)
                .build();
    }

    // =============================
    // 🔧 MAPPERS
    // =============================
    private OfferResponse toOfferResponse(Offer offer) {
        return OfferResponse.builder()
                .id(offer.getId())
                .title(offer.getTitle())
                .description(offer.getDescription())
                .company(offer.getCompany())
                .location(offer.getLocation())
                .contractType(offer.getContractType())
                .salary(offer.getSalary())
                .publishedDate(offer.getPublishedDate())
                .expirationDate(offer.getExpirationDate())
                .active(offer.isActive())
                .domain(offer.getDomain())
                .requiredSkills(offer.getRequiredSkills())
                .build();
    }

    private ApplicationResponse toApplicationResponse(Application application) {
        return ApplicationResponse.builder()
                .id(application.getId())
                .offerId(application.getOffer().getId())
                .offerTitle(application.getOffer().getTitle())
                .company(application.getOffer().getCompany())
                .candidateEmail(application.getCandidateEmail())
                .applicationDate(application.getApplicationDate())
                .status(application.getStatus())
                .build();
    }
}
