package com.yebapay.core.wallet;

import com.yebapay.core.common.currency.CurrencyMetadata;
import com.yebapay.core.common.currency.CurrencyMetadataResolver;
import com.yebapay.core.identity.User;
import com.yebapay.core.identity.UserRepository;
import com.yebapay.core.identity.UserStatus;
import com.yebapay.core.ledger.LedgerAccountService;
import com.yebapay.core.wallet.dto.WalletDetailsResponse;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;
    private final WalletBalanceSnapshotRepository walletBalanceSnapshotRepository;
    private final WalletProperties walletProperties;
    private final UserRepository userRepository;
    private final LedgerAccountService ledgerAccountService;
    private final CurrencyMetadataResolver currencyMetadataResolver;

    @Transactional
    public Wallet createPersonalWalletForUser(User user) {
        return walletRepository.findByOwnerUser_IdAndWalletTypeAndDeletedAtIsNull(user.getId(), WalletType.PERSONAL)
            .orElseGet(() -> {
                Wallet wallet = walletRepository.save(buildWallet(
                    user,
                    WalletType.PERSONAL,
                    walletProperties.getPersonalWalletName()
                ));
                ledgerAccountService.getOrCreateWalletMainAccount(wallet);
                snapshot(wallet, WalletBalanceSnapshotType.ADJUSTMENT);
                return wallet;
            });
    }

    @Transactional
    public Wallet createMerchantWalletForUser(User user, String walletName) {
        return walletRepository.findByOwnerUser_IdAndWalletTypeAndDeletedAtIsNull(user.getId(), WalletType.MERCHANT)
            .orElseGet(() -> {
                Wallet wallet = walletRepository.save(buildWallet(
                    user,
                    WalletType.MERCHANT,
                    walletName == null || walletName.isBlank() ? walletProperties.getMerchantWalletName() : walletName
                ));
                ledgerAccountService.getOrCreateWalletMainAccount(wallet);
                snapshot(wallet, WalletBalanceSnapshotType.ADJUSTMENT);
                return wallet;
            });
    }

    @Transactional(readOnly = true)
    public List<WalletDetailsResponse> getCurrentUserWallets(UUID userId) {
        return walletRepository.findByOwnerUser_IdAndDeletedAtIsNull(userId).stream()
            .map(this::toWalletDetailsResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public Wallet getActivePersonalWalletForUser(UUID userId) {
        return getActiveWalletForUser(userId, WalletType.PERSONAL, "Personal wallet not found");
    }

    @Transactional(readOnly = true)
    public Wallet getActiveMerchantWalletForUser(UUID userId) {
        return getActiveWalletForUser(userId, WalletType.MERCHANT, "Merchant wallet not found");
    }

    @Transactional(readOnly = true)
    public Wallet getActivePersonalWalletByWalletNumber(String walletNumber) {
        String normalizedWalletNumber = normalizeWalletNumber(walletNumber);
        Wallet wallet = walletRepository.findByWalletNumberAndDeletedAtIsNull(normalizedWalletNumber)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipient wallet not found"));

        if (wallet.getWalletType() != WalletType.PERSONAL
            || wallet.getOwnerType() != WalletOwnerType.USER
            || wallet.getOwnerUser() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipient wallet not found");
        }
        if (wallet.getOwnerUser().getStatus() != UserStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Recipient account is not active");
        }
        if (wallet.getStatus() != WalletStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Recipient wallet is not active");
        }

        return wallet;
    }

    @Transactional
    public Wallet lockWallet(UUID walletId) {
        return walletRepository.findLockedByIdAndDeletedAtIsNull(walletId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Wallet not found"));
    }

    @Transactional
    public void snapshot(Wallet wallet, WalletBalanceSnapshotType snapshotType) {
        walletBalanceSnapshotRepository.save(WalletBalanceSnapshot.builder()
            .wallet(wallet)
            .snapshotType(snapshotType)
            .availableBalance(wallet.getAvailableBalance())
            .pendingBalance(wallet.getPendingBalance())
            .ledgerBalance(wallet.getLedgerBalance())
            .currencyCode(wallet.getCurrencyCode())
            .takenAt(Instant.now())
            .metadata(new LinkedHashMap<>())
            .build());
    }

    public WalletDetailsResponse toWalletDetailsResponse(Wallet wallet) {
        CurrencyMetadata currency = currencyMetadataResolver.resolve(wallet.getCurrencyCode());

        return new WalletDetailsResponse(
            wallet.getId(),
            wallet.getWalletNumber(),
            wallet.getWalletType(),
            wallet.getStatus(),
            wallet.getCurrencyCode(),
            currency.displayCode(),
            currency.displayName(),
            wallet.getAvailableBalance(),
            wallet.getPendingBalance(),
            wallet.getLedgerBalance(),
            wallet.getDailyLimit(),
            wallet.getMonthlyLimit(),
            wallet.getLastActivityAt()
        );
    }

    private String generateWalletNumber() {
        return "WAL-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
    }

    private String normalizeWalletNumber(String walletNumber) {
        if (walletNumber == null || walletNumber.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Wallet number is required");
        }

        return walletNumber.trim().toUpperCase();
    }

    private Wallet getActiveWalletForUser(UUID userId, WalletType walletType, String notFoundMessage) {
        User user = userRepository.findByIdAndDeletedAtIsNull(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User account is not active");
        }

        Wallet wallet = walletRepository.findByOwnerUser_IdAndWalletTypeAndDeletedAtIsNull(userId, walletType)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, notFoundMessage));

        if (wallet.getStatus() != WalletStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Wallet is not active");
        }

        return wallet;
    }

    private Wallet buildWallet(User user, WalletType walletType, String walletName) {
        BigDecimal dailyLimit = walletType == WalletType.MERCHANT
            ? walletProperties.getMerchantDailyLimit()
            : walletProperties.getPersonalDailyLimit();
        BigDecimal monthlyLimit = walletType == WalletType.MERCHANT
            ? walletProperties.getMerchantMonthlyLimit()
            : walletProperties.getPersonalMonthlyLimit();

        return Wallet.builder()
            .walletNumber(generateWalletNumber())
            .ownerType(WalletOwnerType.USER)
            .ownerUser(user)
            .walletType(walletType)
            .name(walletName)
            .status(WalletStatus.ACTIVE)
            .currencyCode(walletProperties.getDefaultCurrency())
            .availableBalance(BigDecimal.ZERO)
            .pendingBalance(BigDecimal.ZERO)
            .ledgerBalance(BigDecimal.ZERO)
            .dailyLimit(dailyLimit)
            .monthlyLimit(monthlyLimit)
            .metadata(new LinkedHashMap<>())
            .build();
    }
}
