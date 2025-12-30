package org.keah.candidateservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keah.candidateservice.config.FileStorageConfig;
import org.keah.candidateservice.dto.CandidateRequest;
import org.keah.candidateservice.dto.CandidateUpdateRequest;
import org.keah.candidateservice.entity.Candidate;
import org.keah.candidateservice.repository.CandidateRepository;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CandidateService {

    private final CandidateRepository candidateRepository;
    private final FileStorageConfig fileStorageConfig;
    private final org.springframework.web.client.RestTemplate restTemplate;

    @org.springframework.beans.factory.annotation.Value("${ai.service.url:http://localhost:8888/ai}")
    private String aiServiceUrl;

    // =============================
    // 🔁 EXISTING: Create from Auth-Service
    // =============================
    public Candidate createCandidate(CandidateRequest request) {
        if (candidateRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Candidate already exists");
        }

        Candidate candidate = Candidate.builder()
                .userId(request.getUserId())
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .build();

        return candidateRepository.save(candidate);
    }

    // =============================
    // 🔐 EXISTING: Get by email
    // =============================
    public Candidate getByEmail(String email) {
        return candidateRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));
    }

    // =============================
    // 🆕 NEW: Update profile
    // =============================
    public Candidate updateCandidate(String email, CandidateUpdateRequest request) {
        Candidate candidate = getByEmail(email);

        if (request.getFirstName() != null) {
            candidate.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            candidate.setLastName(request.getLastName());
        }
        if (request.getPhone() != null) {
            candidate.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            candidate.setAddress(request.getAddress());
        }

        log.info("Updated profile for candidate: {}", email);
        return candidateRepository.save(candidate);
    }

    // =============================
    // 🆕 NEW: Upload CV
    // =============================
    public Candidate uploadCv(String email, MultipartFile file) {
        Candidate candidate = getByEmail(email);

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("application/pdf")) {
            throw new RuntimeException("Only PDF files are allowed");
        }

        try {
            // Generate unique filename to avoid collisions
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".pdf";
            String storedFilename = UUID.randomUUID().toString() + extension;

            // Save file to disk
            Path uploadPath = Paths.get(fileStorageConfig.getUploadDir());
            Path filePath = uploadPath.resolve(storedFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Delete old CV if exists
            if (candidate.getCvStoragePath() != null) {
                try {
                    Files.deleteIfExists(Paths.get(candidate.getCvStoragePath()));
                } catch (IOException e) {
                    log.warn("Could not delete old CV: {}", e.getMessage());
                }
            }

            // Update candidate record
            candidate.setCvFileName(originalFilename);
            candidate.setCvStoragePath(filePath.toString());
            candidate.setCvUploadDate(LocalDateTime.now());

            log.info("CV uploaded for candidate: {} - File: {}", email, storedFilename);
            log.info("CV uploaded for candidate: {} - File: {}", email, storedFilename);

            // Call AI Extraction
            try {
                String extractUrl = aiServiceUrl + "/extract";
                org.springframework.util.MultiValueMap<String, Object> body = new org.springframework.util.LinkedMultiValueMap<>();
                body.add("file", new org.springframework.core.io.FileSystemResource(filePath.toFile()));

                org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
                headers.setContentType(org.springframework.http.MediaType.MULTIPART_FORM_DATA);

                org.springframework.http.HttpEntity<org.springframework.util.MultiValueMap<String, Object>> requestEntity = new org.springframework.http.HttpEntity<>(
                        body, headers);

                // We need a DTO for response or use Map. Let's use a simple Map or internal DTO
                // if not shared.
                // Or simply assume the structure.
                // Since I cannot access MatchResponse from ai-service, I'll map to a Map or
                // create a local DTO.
                // Map is safer for loose coupling here without shared lib.
                java.util.Map response = restTemplate.postForObject(extractUrl, requestEntity, java.util.Map.class);

                System.out.println("=== CV UPLOAD DEBUG ===");
                System.out.println("File size: " + file.getSize());
                if (response != null) {
                    System.out.println("AI Response keys: " + response.keySet());
                    System.out.println("AI Response FULL: " + response);
                } else {
                    System.out.println("AI Response is NULL");
                }

                if (response != null) {
                    if (response.containsKey("skills")) {
                        candidate.setSkills((java.util.List<String>) response.get("skills"));
                    }
                    if (response.containsKey("category")) {
                        candidate.setExtractedCategory((String) response.get("category"));
                    }
                    // Attempt to get cv_text or text
                    if (response.containsKey("cv_text")) {
                        candidate.setCvText((String) response.get("cv_text"));
                    } else if (response.containsKey("text")) {
                        candidate.setCvText((String) response.get("text"));
                    } else if (response.containsKey("extracted_text")) {
                        candidate.setCvText((String) response.get("extracted_text"));
                    } else if (response.containsKey("content")) {
                        candidate.setCvText((String) response.get("content"));
                    }

                    String extractedText = candidate.getCvText();
                    if (extractedText != null) {
                        System.out.println("Extracted text length: " + extractedText.length());
                        System.out.println("First 200 chars: "
                                + extractedText.substring(0, Math.min(200, extractedText.length())));
                    } else {
                        System.out.println("Extracted text is NULL after checks");
                    }
                }
            } catch (Exception e) {
                log.error("AI Extraction failed but file saved: {}", e.getMessage());
                // Don't fail theupload, just log.
            }

            return candidateRepository.save(candidate);

        } catch (IOException e) {
            log.error("Failed to upload CV for candidate {}: {}", email, e.getMessage());
            throw new RuntimeException("Failed to upload CV: " + e.getMessage());
        }
    }

    // =============================
    // 🆕 NEW: Get CV Resource for download
    // =============================
    public Resource getCvResource(String email) {
        Candidate candidate = getByEmail(email);

        if (candidate.getCvStoragePath() == null) {
            throw new RuntimeException("No CV uploaded for this candidate");
        }

        try {
            Path filePath = Paths.get(candidate.getCvStoragePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("CV file not found or not readable");
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("CV file path is invalid");
        }
    }

    public String getCvFileName(String email) {
        Candidate candidate = getByEmail(email);
        return candidate.getCvFileName();
    }

    // =============================
    // 🔧 ADMIN: Batch Process Missing CVs
    // =============================
    public String reprocessAllMissingCvTexts() {
        java.util.List<Candidate> candidates = candidateRepository.findByCvStoragePathIsNotNullAndCvTextIsNull();
        log.info("Found {} candidates with missing CV text", candidates.size());

        int processed = 0;
        int failed = 0;
        int skipped = 0;
        StringBuilder report = new StringBuilder();
        report.append("=== CV Reprocessing Report ===\n");
        report.append("Total candidates found: ").append(candidates.size()).append("\n\n");

        for (Candidate candidate : candidates) {
            try {
                if (candidate.getCvStoragePath() == null) {
                    log.warn("Candidate {} has no stored CV file, skipping.", candidate.getEmail());
                    report.append("SKIPPED: ").append(candidate.getEmail()).append(" - No CV file path\n");
                    skipped++;
                    continue;
                }

                Path filePath = Paths.get(candidate.getCvStoragePath());
                if (!Files.exists(filePath)) {
                    log.warn("CV file for {} not found at {}, skipping.", candidate.getEmail(), filePath);
                    report.append("SKIPPED: ").append(candidate.getEmail()).append(" - File not found at ")
                            .append(filePath).append("\n");
                    skipped++;
                    continue;
                }

                // AI Extraction Logic (duplicated from uploadCv but localized for loop)
                String extractUrl = aiServiceUrl + "/extract";
                org.springframework.util.MultiValueMap<String, Object> body = new org.springframework.util.LinkedMultiValueMap<>();
                body.add("file", new org.springframework.core.io.FileSystemResource(filePath.toFile()));

                org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
                headers.setContentType(org.springframework.http.MediaType.MULTIPART_FORM_DATA);

                org.springframework.http.HttpEntity<org.springframework.util.MultiValueMap<String, Object>> requestEntity = new org.springframework.http.HttpEntity<>(
                        body, headers);

                java.util.Map response = restTemplate.postForObject(extractUrl, requestEntity, java.util.Map.class);

                if (response != null) {
                    if (response.containsKey("cv_text")) {
                        candidate.setCvText((String) response.get("cv_text"));
                    } else if (response.containsKey("text")) {
                        candidate.setCvText((String) response.get("text"));
                    } else if (response.containsKey("extracted_text")) {
                        candidate.setCvText((String) response.get("extracted_text"));
                    } else if (response.containsKey("content")) {
                        candidate.setCvText((String) response.get("content"));
                    }

                    if (response.containsKey("skills")) {
                        candidate.setSkills((java.util.List<String>) response.get("skills"));
                    }
                    if (response.containsKey("category")) {
                        candidate.setExtractedCategory((String) response.get("category"));
                    }

                    if (candidate.getCvText() != null) {
                        candidateRepository.save(candidate);
                        log.info("Successfully re-extracted CV text for {}", candidate.getEmail());
                        report.append("SUCCESS: ").append(candidate.getEmail()).append(" - Extracted ")
                                .append(candidate.getCvText().length()).append(" chars\n");
                        processed++;
                    } else {
                        report.append("FAILED: ").append(candidate.getEmail())
                                .append(" - No text extracted from AI response\n");
                        failed++;
                    }
                }

            } catch (Exception e) {
                log.error("Failed to reprocess CV for {}: {}", candidate.getEmail(), e.getMessage());
                report.append("ERROR: ").append(candidate.getEmail()).append(" - ").append(e.getMessage()).append("\n");
                failed++;
            }
        }

        report.append("\n=== Summary ===\n");
        report.append("Processed: ").append(processed).append("\n");
        report.append("Failed: ").append(failed).append("\n");
        report.append("Skipped: ").append(skipped).append("\n");

        return report.toString();
    }
}
