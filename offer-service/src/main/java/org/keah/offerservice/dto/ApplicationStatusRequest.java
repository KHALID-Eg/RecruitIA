package org.keah.offerservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationStatusRequest {

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "^(ACCEPTED|REJECTED)$", message = "Status must be ACCEPTED or REJECTED")
    private String status;
}
