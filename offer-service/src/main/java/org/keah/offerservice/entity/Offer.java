package org.keah.offerservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "offers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Offer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String company;

    private String location;

    private String contractType; // CDI, CDD, Stage, Alternance

    private Double salary;

    private LocalDate publishedDate;

    private LocalDate expirationDate;

    @Builder.Default
    private boolean active = true;

    // Optional: recruiter email who created the offer
    private String recruiterEmail;

    private String domain;

    @ElementCollection
    private List<String> requiredSkills;
}
