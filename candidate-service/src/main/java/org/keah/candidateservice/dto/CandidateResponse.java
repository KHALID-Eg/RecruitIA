package org.keah.candidateservice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CandidateResponse {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
}
