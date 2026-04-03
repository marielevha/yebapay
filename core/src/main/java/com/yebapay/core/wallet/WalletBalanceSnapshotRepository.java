package com.yebapay.core.wallet;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WalletBalanceSnapshotRepository extends JpaRepository<WalletBalanceSnapshot, UUID> {

    List<WalletBalanceSnapshot> findTop20ByWalletIdOrderByTakenAtDesc(UUID walletId);
}
