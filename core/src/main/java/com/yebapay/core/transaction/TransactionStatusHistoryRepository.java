package com.yebapay.core.transaction;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionStatusHistoryRepository extends JpaRepository<TransactionStatusHistory, UUID> {

    List<TransactionStatusHistory> findByTransaction_IdOrderByChangedAtDesc(UUID transactionId);
}
