package org.keah.candidateservice.repository;

import org.keah.candidateservice.entity.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CandidateRepository extends JpaRepository<Candidate, Long> {

    Optional<Candidate> findByEmail(String email);

    boolean existsByEmail(String email);

    java.util.List<Candidate> findByCvTextIsNull();

    java.util.List<Candidate> findByCvStoragePathIsNotNullAndCvTextIsNull();
}
