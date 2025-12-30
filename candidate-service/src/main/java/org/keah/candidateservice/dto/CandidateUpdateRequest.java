package org.keah.candidateservice.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateUpdateRequest {
    private String firstName;
    private String lastName;
    private String phone;
    private String address;
}
