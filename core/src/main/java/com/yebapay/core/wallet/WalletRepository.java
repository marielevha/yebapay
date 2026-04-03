package com.yebapay.core.wallet;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WalletRepository extends JpaRepository<Wallet, UUID> {

    List<Wallet> findByOwnerUser_IdAndDeletedAtIsNull(UUID ownerUserId);

    Optional<Wallet> findByWalletNumberAndDeletedAtIsNull(String walletNumber);

    Optional<Wallet> findByOwnerUser_IdAndWalletTypeAndDeletedAtIsNull(UUID ownerUserId, WalletType walletType);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select wallet
        from Wallet wallet
        where wallet.id = :walletId
          and wallet.deletedAt is null
        """)
    Optional<Wallet> findLockedByIdAndDeletedAtIsNull(@Param("walletId") UUID walletId);
}
