package com.yebapay.core.agent;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CashPointRepository extends JpaRepository<CashPoint, UUID> {

    Optional<CashPoint> findByCashPointCodeAndDeletedAtIsNull(String cashPointCode);
}
