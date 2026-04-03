package com.yebapay.core.admin;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DisputeRepository extends JpaRepository<Dispute, UUID> {

    Optional<Dispute> findByDisputeRef(String disputeRef);
}
