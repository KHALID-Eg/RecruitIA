package org.keah.authservice.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.keah.authservice.DTOs.AuthResponse;
import org.keah.authservice.DTOs.LoginRequest;
import org.keah.authservice.DTOs.RegisterRequest;
import org.keah.authservice.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register-candidate")
    public ResponseEntity<?> registerCandidate(@Valid @RequestBody RegisterRequest req) {
        AuthResponse res = authService.registerEmployee(req);
        if (res == null)
            return ResponseEntity.badRequest().body("User already exists!");
        return ResponseEntity.ok(res);
    }

    // ============ REGISTER RECRUITER ============
    @PostMapping("/register-recruiter")
    public ResponseEntity<?> registerRecruiter(@Valid @RequestBody RegisterRequest req) {
        log.info("[AUTH] Register Recruiter request for email: {}", req.getEmail());
        AuthResponse res = authService.registerRecruiter(req);
        if (res == null)
            return ResponseEntity.badRequest().body("User already exists!");
        return ResponseEntity.ok(res);
    }

    // ============ LOGIN ============
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        log.info("[AUTH] Login attempt for email: {}", req.getEmail());
        AuthResponse res = authService.login(req);
        if (res == null) {
            log.warn("[AUTH] Login FAILED for email: {}", req.getEmail());
            return ResponseEntity.badRequest().body("Invalid credentials");
        }
        log.info("[AUTH] Login SUCCESS for email: {} with role: {}", req.getEmail(), res.getRole());
        return ResponseEntity.ok(res);
    }
}
