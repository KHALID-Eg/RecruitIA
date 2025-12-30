package org.keah.aiservice.service;

import lombok.RequiredArgsConstructor;
import org.keah.aiservice.dto.ExtractResponse;
import org.keah.aiservice.dto.MatchRequest;
import org.keah.aiservice.dto.MatchResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class AiService {

    private final RestTemplate restTemplate;

    @Value("${ai.python.base-url:http://localhost:8000}")
    private String pythonBaseUrl;

    public MatchResponse matchCvToJob(MatchRequest request) {
        String url = pythonBaseUrl + "/ai/match";
        try {
            System.out.println("AI Service Sending to Python: " + url);
            System.out.println("Payload CV Text Length: " + (request.getCvText() != null ? request.getCvText().length() : "NULL"));
            
            return restTemplate.postForObject(url, request, MatchResponse.class);
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            System.err.println("AI Service Client Error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            throw e;
        } catch (Exception e) {
            System.err.println("AI Service Error: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("AI Service failed: " + e.getMessage());
        }
    }

    public MatchResponse matchCvFile(org.springframework.web.multipart.MultipartFile file, String jobDescription, java.util.List<String> requiredSkills) {
        String url = pythonBaseUrl + "/ai/match-file";
        try {
            org.springframework.util.MultiValueMap<String, Object> body = new org.springframework.util.LinkedMultiValueMap<>();
            body.add("cv_file", file.getResource());
            body.add("job_description", jobDescription);
            if (requiredSkills != null) {
                for (String skill : requiredSkills) {
                    body.add("required_skills", skill);
                }
            }

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.MULTIPART_FORM_DATA);

            org.springframework.http.HttpEntity<org.springframework.util.MultiValueMap<String, Object>> requestEntity = new org.springframework.http.HttpEntity<>(body, headers);

            return restTemplate.postForObject(url, requestEntity, MatchResponse.class);

        } catch (org.springframework.web.client.HttpClientErrorException e) {
            System.err.println("AI Service Client Error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            throw e;
        } catch (Exception e) {
            System.err.println("AI Service Error: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("AI Service failed: " + e.getMessage());
        }
    }

    public ExtractResponse extractCv(org.springframework.web.multipart.MultipartFile file) {
        String url = pythonBaseUrl + "/ai/extract";
        try {
            org.springframework.util.MultiValueMap<String, Object> body = new org.springframework.util.LinkedMultiValueMap<>();
            body.add("cv_file", file.getResource());

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.MULTIPART_FORM_DATA);

            org.springframework.http.HttpEntity<org.springframework.util.MultiValueMap<String, Object>> requestEntity = new org.springframework.http.HttpEntity<>(body, headers);
            
            return restTemplate.postForObject(url, requestEntity, ExtractResponse.class);

        } catch (Exception e) {
            System.err.println("AI Extraction Failed: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("AI Extraction failed: " + e.getMessage());
        }
    }
}
