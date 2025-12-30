package org.keah.aiservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record ExtractResponse(
    @JsonProperty("cv_text") String cvText,
    @JsonProperty("skills") List<String> skills,
    @JsonProperty("category") String category,
    @JsonProperty("cleaned_text") String cleanedText
) {}
