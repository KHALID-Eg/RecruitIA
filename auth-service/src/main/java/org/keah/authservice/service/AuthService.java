package org.keah.authservice.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.keah.authservice.DTOs.AuthResponse;
import org.keah.authservice.DTOs.CandidatRequest;
import org.keah.authservice.DTOs.LoginRequest;
import org.keah.authservice.DTOs.RegisterRequest;
import org.keah.authservice.Repository.UserRepository;
import org.keah.authservice.entity.Role;
import org.keah.authservice.entity.User;
import org.keah.authservice.security.JwtGenerator;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtGenerator jwtGenerator;
        private final RestTemplate restTemplate;

        // ================= REGISTER CANDIDATE =================
        @Transactional
        public AuthResponse registerEmployee(RegisterRequest request) {

                if (userRepository.existsByEmail(request.getEmail())) {
                        return null;
                }

                // 1️⃣ Création User (AUTH)
                User user = new User();
                user.setEmail(request.getEmail());
                user.setPassword(passwordEncoder.encode(request.getPassword()));
                user.setFirstName(request.getFirstName());
                user.setLastName(request.getLastName());
                user.setRole(Role.CANDIDATE);

                userRepository.save(user);

                // 2️⃣ Synchronisation avec Candidate-Service
                CandidatRequest candidatRequest = CandidatRequest.builder()
                                .userId(user.getId())
                                .email(user.getEmail())
                                .firstName(user.getFirstName())
                                .lastName(user.getLastName())
                                .build();

                restTemplate.postForEntity(
                                "http://CANDIDATE-SERVICE/candidates/internal",
                                candidatRequest,
                                Void.class);

                // 3️⃣ Génération JWT
                String token = jwtGenerator.generateToken(
                                user.getEmail(),
                                user.getRole().name());

                return new AuthResponse(
                                token,
                                user.getEmail(),
                                user.getRole().name());
        }

        // ================= REGISTER RECRUITER =================
        @Transactional
        public AuthResponse registerRecruiter(RegisterRequest request) {
                log.info("[AUTH] Registering RECRUITER: {}", request.getEmail());

                if (userRepository.existsByEmail(request.getEmail())) {
                        log.warn("[AUTH] User already exists: {}", request.getEmail());
                        return null;
                }

                // Création User avec rôle RECRUITER
                User user = new User();
                user.setEmail(request.getEmail());
                user.setPassword(passwordEncoder.encode(request.getPassword()));
                user.setFirstName(request.getFirstName());
                user.setLastName(request.getLastName());
                user.setRole(Role.RECRUITER);

                userRepository.save(user);
                log.info("[AUTH] RECRUITER saved with encoded password: {}", request.getEmail());

                // Génération JWT
                String token = jwtGenerator.generateToken(
                                user.getEmail(),
                                user.getRole().name());

                return new AuthResponse(
                                token,
                                user.getEmail(),
                                user.getRole().name());
        }

        // ================= LOGIN =================
        public AuthResponse login(LoginRequest request) {
                log.debug("[AUTH] Login attempt for: {}", request.getEmail());

                User user = userRepository
                                .findByEmail(request.getEmail())
                                .orElse(null);

                if (user == null) {
                        log.warn("[AUTH] User not found: {}", request.getEmail());
                        return null;
                }

                log.debug("[AUTH] User found: {} with role: {}", user.getEmail(), user.getRole());

                if (!passwordEncoder.matches(
                                request.getPassword(),
                                user.getPassword())) {
                        log.warn("[AUTH] Password mismatch for: {}", request.getEmail());
                        return null;
                }

                String token = jwtGenerator.generateToken(
                                user.getEmail(),
                                user.getRole().name());

                log.info("[AUTH] Login successful for: {} with role: {}", user.getEmail(), user.getRole());

                return new AuthResponse(
                                token,
                                user.getEmail(),
                                user.getRole().name());
        }
}
