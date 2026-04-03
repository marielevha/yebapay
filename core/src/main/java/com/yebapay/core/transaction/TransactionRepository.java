package com.yebapay.core.transaction;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.math.BigDecimal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    Optional<Transaction> findByTransactionRef(String transactionRef);

    Optional<Transaction> findByIdempotencyKey(String idempotencyKey);

    List<Transaction> findTop50ByPayerUser_IdOrderByInitiatedAtDesc(UUID payerUserId);

    @Query("""
        select tx
        from Transaction tx
        where tx.payerUser.id = :userId
           or tx.payeeUser.id = :userId
        order by tx.initiatedAt desc
        """)
    List<Transaction> findRecentForUser(@Param("userId") UUID userId, Pageable pageable);

    @Query("""
        select coalesce(
            sum(
                tx.amount +
                case
                    when tx.feeBearer = com.yebapay.core.transaction.TransactionFeeBearer.PAYER then tx.feeAmount
                    else 0
                end
            ),
            0
        )
        from Transaction tx
        where tx.sourceWallet.id = :walletId
          and tx.status = com.yebapay.core.transaction.TransactionStatus.COMPLETED
          and tx.completedAt >= :fromInclusive
          and tx.completedAt < :toExclusive
        """)
    BigDecimal sumCompletedOutgoingAmountBySourceWalletBetween(
        @Param("walletId") UUID walletId,
        @Param("fromInclusive") java.time.Instant fromInclusive,
        @Param("toExclusive") java.time.Instant toExclusive
    );
}
