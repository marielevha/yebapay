package com.yebapay.core.ledger;

import java.util.Optional;
import java.util.UUID;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LedgerAccountRepository extends JpaRepository<LedgerAccount, UUID> {

    Optional<LedgerAccount> findByAccountCode(String accountCode);

    Optional<LedgerAccount> findByWallet_IdAndAccountPurpose(UUID walletId, LedgerAccountPurpose accountPurpose);

    Optional<LedgerAccount> findByAccountPurposeAndCurrencyCodeAndOwnerType(
        LedgerAccountPurpose accountPurpose,
        String currencyCode,
        LedgerAccountOwnerType ownerType
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select ledgerAccount
        from LedgerAccount ledgerAccount
        where ledgerAccount.wallet.id = :walletId
          and ledgerAccount.accountPurpose = :accountPurpose
        """)
    Optional<LedgerAccount> findLockedByWalletIdAndAccountPurpose(
        @Param("walletId") UUID walletId,
        @Param("accountPurpose") LedgerAccountPurpose accountPurpose
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select ledgerAccount
        from LedgerAccount ledgerAccount
        where ledgerAccount.accountPurpose = :accountPurpose
          and ledgerAccount.currencyCode = :currencyCode
          and ledgerAccount.ownerType = :ownerType
        """)
    Optional<LedgerAccount> findLockedByPurposeAndCurrencyCodeAndOwnerType(
        @Param("accountPurpose") LedgerAccountPurpose accountPurpose,
        @Param("currencyCode") String currencyCode,
        @Param("ownerType") LedgerAccountOwnerType ownerType
    );
}
