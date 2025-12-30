package org.keah.aiservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonAlias;

public record MatchResponse(
    @JsonProperty("extractedSkills") @JsonAlias("skills") List<String> extractedSkills,
    @JsonProperty("matchScore") @JsonAlias("score") Double matchScore,
    @JsonProperty("category") String category,

    @JsonProperty("requiredSkills") @JsonAlias("required_skills") List<String> requiredSkills,
    @JsonProperty("matchedSkills") @JsonAlias("matching_skills") List<String> matchedSkills,
    @JsonProperty("missingSkills") @JsonAlias("missing_skills") List<String> missingSkills
) {}
