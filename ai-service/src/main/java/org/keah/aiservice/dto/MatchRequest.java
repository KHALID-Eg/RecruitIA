package org.keah.aiservice.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MatchRequest {
    @JsonProperty("cv_text")
    @JsonAlias("cvText")
    private String cvText;

    @JsonProperty("job_description")
    @JsonAlias("jobDescription")
    private String jobDescription;

    @JsonProperty("required_skills")
    @JsonAlias("requiredSkills")
    private java.util.List<String> requiredSkills;
}
