package org.keah.candidateservice.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateRequest {

    private String userId;     // ID venant de auth-service
    private String email;
    private String firstName;
    private String lastName;
}
