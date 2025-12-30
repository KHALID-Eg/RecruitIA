package org.keah.offerservice.repository;

import org.keah.offerservice.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    boolean existsByCandidateEmailAndOfferId(String candidateEmail, Long offerId);

    void deleteByOfferId(Long offerId);

    List<Application> findByCandidateEmail(String candidateEmail);

    List<Application> findByOfferId(Long offerId);

    Optional<Application> findByCandidateEmailAndOfferId(String candidateEmail, Long offerId);

    // ========== RECRUITER STATS ==========
    @Query("SELECT COUNT(a) FROM Application a WHERE a.offer.recruiterEmail = :email")
    long countByOfferRecruiterEmail(@Param("email") String email);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.offer.recruiterEmail = :email AND a.status = :status")
    long countByOfferRecruiterEmailAndStatus(@Param("email") String email, @Param("status") String status);

    @Query("SELECT a FROM Application a WHERE a.offer.recruiterEmail = :email")
    List<Application> findByOfferRecruiterEmail(@Param("email") String email);
}
