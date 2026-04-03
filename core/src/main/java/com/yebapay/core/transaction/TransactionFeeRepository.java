package com.yebapay.core.transaction;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionFeeRepository extends JpaRepository<TransactionFee, UUID> {

    List<TransactionFee> findByTransaction_Id(UUID transactionId);
}
