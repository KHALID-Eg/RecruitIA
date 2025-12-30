package org.keah.offerservice.repository;

import org.keah.offerservice.entity.Offer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OfferRepository extends JpaRepository<Offer, Long> {

    List<Offer> findByActiveTrue();

    List<Offer> findByRecruiterEmail(String recruiterEmail);
}
