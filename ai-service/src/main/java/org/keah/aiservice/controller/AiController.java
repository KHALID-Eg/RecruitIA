package org.keah.aiservice.controller;

import lombok.RequiredArgsConstructor;
import org.keah.aiservice.dto.MatchRequest;
import org.keah.aiservice.dto.MatchResponse;
import org.keah.aiservice.service.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/match")
    public ResponseEntity<MatchResponse> matchCv(@RequestBody MatchRequest request) {
        System.out.println("AI Controller Received Match Request");
        System.out.println("CV Text Length: " + (request.getCvText() != null ? request.getCvText().length() : "NULL"));
        
        // The DTOs handle JSON mapping (camel <-> snake) automatically via Jackson annotations
        return ResponseEntity.ok(aiService.matchCvToJob(request));
    }

    @PostMapping(value = "/match-file", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MatchResponse> matchCvFile(
        @org.springframework.web.bind.annotation.RequestParam("file") org.springframework.web.multipart.MultipartFile file,
        @org.springframework.web.bind.annotation.RequestParam("job_description") String jobDescription,
        @org.springframework.web.bind.annotation.RequestParam(value = "required_skills", required = false) java.util.List<String> requiredSkills
    ) {
        return ResponseEntity.ok(aiService.matchCvFile(file, jobDescription, requiredSkills));
    }

    @PostMapping(value = "/extract", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<org.keah.aiservice.dto.ExtractResponse> extractCv(
        @org.springframework.web.bind.annotation.RequestParam("file") org.springframework.web.multipart.MultipartFile file
    ) {
        return ResponseEntity.ok(aiService.extractCv(file));
    }
}
