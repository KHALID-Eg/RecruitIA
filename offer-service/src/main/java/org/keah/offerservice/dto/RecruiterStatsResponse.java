package org.keah.offerservice.dto;

import lombok.*;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecruiterStatsResponse {
    private int totalOffers;
    private long totalApplications;
    private long pendingCount;
    private long acceptedCount;
    private long rejectedCount;
    private Map<String, Long> applicationsByOffer; // offerTitle -> count
}
