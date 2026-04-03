package com.yebapay.core.transaction;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MoneyRequestRepository extends JpaRepository<MoneyRequest, UUID> {

    Optional<MoneyRequest> findByRequestRef(String requestRef);

    @Query("""
        select request
        from MoneyRequest request
        where request.requesterUser.id = :userId
           or request.payerUser.id = :userId
        order by request.createdAt desc
        """)
    List<MoneyRequest> findRecentForUser(@Param("userId") UUID userId);
}
