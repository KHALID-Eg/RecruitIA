package org.keah.offerservice.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfferResponse {
    private Long id;
    private String title;
    private String description;
    private String company;
    private String location;
    private String contractType;
    private Double salary;
    private LocalDate publishedDate;
    private LocalDate expirationDate;
    private boolean active;
    private String domain;
    private List<String> requiredSkills;
}
