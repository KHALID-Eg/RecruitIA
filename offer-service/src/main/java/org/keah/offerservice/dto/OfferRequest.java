package org.keah.offerservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfferRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Company is required")
    private String company;

    private String location;
    private String contractType;
    private Double salary;
    private LocalDate expirationDate;

    private String domain;
    private List<String> requiredSkills;
}
