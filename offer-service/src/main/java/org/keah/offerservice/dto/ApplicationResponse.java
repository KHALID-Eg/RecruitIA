package org.keah.offerservice.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationResponse {
    private Long id;
    private Long offerId;
    private String offerTitle;
    private String company;
    private String candidateEmail; // For recruiters to see applicant
    private LocalDateTime applicationDate;
    private String status;
}
