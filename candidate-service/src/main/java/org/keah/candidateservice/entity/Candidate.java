package org.keah.candidateservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "candidates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String userId; // lien avec auth-service

    @Column(nullable = false, unique = true)
    private String email;

    private String firstName;
    private String lastName;

    // Profile additional fields
    private String phone;
    private String address;

    // CV fields
    private String cvFileName; // Original filename uploaded
    private String cvStoragePath; // Path on filesystem
    private LocalDateTime cvUploadDate;

    // Extracted Data
    @Column(columnDefinition = "TEXT")
    private String cvText;

    @ElementCollection
    private java.util.List<String> skills;

    private String extractedCategory;
}
