package org.keah.authservice.DTOs;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidatRequest {

    private String userId;
    private String email;
    private String firstName;
    private String lastName;
}
