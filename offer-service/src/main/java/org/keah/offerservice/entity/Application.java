package org.keah.offerservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "applications", uniqueConstraints = @UniqueConstraint(columnNames = { "candidateEmail",
        "offer_id" }, name = "uk_candidate_offer"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String candidateEmail; // From JWT - links to candidate

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offer_id", nullable = false)
    private Offer offer;

    @Builder.Default
    private LocalDateTime applicationDate = LocalDateTime.now();

    @Builder.Default
    private String status = "PENDING"; // PENDING, ACCEPTED, REJECTED, WITHDRAWN
}
