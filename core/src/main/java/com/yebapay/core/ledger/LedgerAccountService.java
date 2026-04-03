package com.yebapay.core.ledger;

import com.yebapay.core.transaction.Transaction;
import com.yebapay.core.transaction.TransactionFeeBearer;
import com.yebapay.core.wallet.Wallet;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LedgerAccountService {

    private final LedgerAccountRepository ledgerAccountRepository;
    private final LedgerEntryRepository ledgerEntryRepository;

    @Transactional
    public LedgerAccount getOrCreateWalletMainAccount(Wallet wallet) {
        return ledgerAccountRepository.findByWallet_IdAndAccountPurpose(wallet.getId(), LedgerAccountPurpose.WALLET_MAIN)
            .orElseGet(() -> createWalletMainAccount(wallet));
    }

    @Transactional
    public LedgerAccount getOrCreateLockedWalletMainAccount(Wallet wallet) {
        return ledgerAccountRepository.findLockedByWalletIdAndAccountPurpose(wallet.getId(), LedgerAccountPurpose.WALLET_MAIN)
            .orElseGet(() -> createWalletMainAccount(wallet));
    }

    @Transactional
    public LedgerAccount getOrCreateSystemAccount(LedgerAccountPurpose accountPurpose, String currencyCode) {
        return ledgerAccountRepository.findByAccountPurposeAndCurrencyCodeAndOwnerType(
                accountPurpose,
                currencyCode,
                LedgerAccountOwnerType.SYSTEM
            )
            .orElseGet(() -> createSystemAccount(accountPurpose, currencyCode));
    }

    @Transactional
    public LedgerAccount getOrCreateLockedSystemAccount(LedgerAccountPurpose accountPurpose, String currencyCode) {
        return ledgerAccountRepository.findLockedByPurposeAndCurrencyCodeAndOwnerType(
                accountPurpose,
                currencyCode,
                LedgerAccountOwnerType.SYSTEM
            )
            .orElseGet(() -> createSystemAccount(accountPurpose, currencyCode));
    }

    @Transactional
    public void postWalletToWalletTransfer(
        Transaction transaction,
        LedgerAccount sourceAccount,
        LedgerAccount destinationAccount,
        LedgerAccount feeRevenueAccount,
        BigDecimal amount,
        BigDecimal feeAmount,
        TransactionFeeBearer feeBearer,
        String description
    ) {
        Instant now = Instant.now();
        LocalDate valueDate = LocalDate.now();
        BigDecimal sourceDebit = feeBearer == TransactionFeeBearer.PAYER
            ? amount.add(feeAmount)
            : amount;
        BigDecimal destinationCredit = (feeBearer == TransactionFeeBearer.PAYEE || feeBearer == TransactionFeeBearer.MERCHANT)
            ? amount.subtract(feeAmount)
            : amount;

        sourceAccount.setCurrentBalance(applyEntry(sourceAccount, LedgerEntryDirection.DEBIT, sourceDebit));
        destinationAccount.setCurrentBalance(applyEntry(destinationAccount, LedgerEntryDirection.CREDIT, destinationCredit));
        ledgerAccountRepository.save(sourceAccount);
        ledgerAccountRepository.save(destinationAccount);
        if (feeAmount.compareTo(BigDecimal.ZERO) > 0 && feeRevenueAccount != null) {
            feeRevenueAccount.setCurrentBalance(applyEntry(feeRevenueAccount, LedgerEntryDirection.CREDIT, feeAmount));
            ledgerAccountRepository.save(feeRevenueAccount);
        }

        ledgerEntryRepository.save(LedgerEntry.builder()
            .transaction(transaction)
            .ledgerAccount(sourceAccount)
            .entryRef(transaction.getTransactionRef() + "-1")
            .entryDirection(LedgerEntryDirection.DEBIT)
            .amount(sourceDebit)
            .currencyCode(transaction.getCurrencyCode())
            .sequenceNumber(1)
            .description(description)
            .valueDate(valueDate)
            .postedAt(now)
            .metadata(new LinkedHashMap<>())
            .build());

        ledgerEntryRepository.save(LedgerEntry.builder()
            .transaction(transaction)
            .ledgerAccount(destinationAccount)
            .entryRef(transaction.getTransactionRef() + "-2")
            .entryDirection(LedgerEntryDirection.CREDIT)
            .amount(destinationCredit)
            .currencyCode(transaction.getCurrencyCode())
            .sequenceNumber(2)
            .description(description)
            .valueDate(valueDate)
            .postedAt(now)
            .metadata(new LinkedHashMap<>())
            .build());

        if (feeAmount.compareTo(BigDecimal.ZERO) > 0 && feeRevenueAccount != null) {
            ledgerEntryRepository.save(LedgerEntry.builder()
                .transaction(transaction)
                .ledgerAccount(feeRevenueAccount)
                .entryRef(transaction.getTransactionRef() + "-3")
                .entryDirection(LedgerEntryDirection.CREDIT)
                .amount(feeAmount)
                .currencyCode(transaction.getCurrencyCode())
                .sequenceNumber(3)
                .description("Fee revenue for " + description)
                .valueDate(valueDate)
                .postedAt(now)
                .metadata(new LinkedHashMap<>())
                .build());
        }
    }

    @Transactional
    public void postCashIn(
        Transaction transaction,
        LedgerAccount clearingAccount,
        LedgerAccount destinationAccount,
        BigDecimal amount,
        String description
    ) {
        Instant now = Instant.now();
        LocalDate valueDate = LocalDate.now();

        clearingAccount.setCurrentBalance(applyEntry(clearingAccount, LedgerEntryDirection.DEBIT, amount));
        destinationAccount.setCurrentBalance(applyEntry(destinationAccount, LedgerEntryDirection.CREDIT, amount));
        ledgerAccountRepository.save(clearingAccount);
        ledgerAccountRepository.save(destinationAccount);

        ledgerEntryRepository.save(LedgerEntry.builder()
            .transaction(transaction)
            .ledgerAccount(clearingAccount)
            .entryRef(transaction.getTransactionRef() + "-1")
            .entryDirection(LedgerEntryDirection.DEBIT)
            .amount(amount)
            .currencyCode(transaction.getCurrencyCode())
            .sequenceNumber(1)
            .description(description)
            .valueDate(valueDate)
            .postedAt(now)
            .metadata(new LinkedHashMap<>())
            .build());

        ledgerEntryRepository.save(LedgerEntry.builder()
            .transaction(transaction)
            .ledgerAccount(destinationAccount)
            .entryRef(transaction.getTransactionRef() + "-2")
            .entryDirection(LedgerEntryDirection.CREDIT)
            .amount(amount)
            .currencyCode(transaction.getCurrencyCode())
            .sequenceNumber(2)
            .description(description)
            .valueDate(valueDate)
            .postedAt(now)
            .metadata(new LinkedHashMap<>())
            .build());
    }

    private LedgerAccount createWalletMainAccount(Wallet wallet) {
        try {
            return ledgerAccountRepository.save(LedgerAccount.builder()
                .accountCode("LGA-" + wallet.getWalletNumber())
                .accountName(wallet.getName() + " Main Ledger")
                .accountType(LedgerAccountType.LIABILITY)
                .accountPurpose(LedgerAccountPurpose.WALLET_MAIN)
                .ownerType(LedgerAccountOwnerType.USER)
                .ownerUser(wallet.getOwnerUser())
                .wallet(wallet)
                .currencyCode(wallet.getCurrencyCode())
                .status(LedgerAccountStatus.ACTIVE)
                .allowNegativeBalance(false)
                .currentBalance(wallet.getLedgerBalance())
                .metadata(new LinkedHashMap<>())
                .build());
        } catch (DataIntegrityViolationException exception) {
            return ledgerAccountRepository.findByWallet_IdAndAccountPurpose(wallet.getId(), LedgerAccountPurpose.WALLET_MAIN)
                .orElseThrow(() -> exception);
        }
    }

    private LedgerAccount createSystemAccount(LedgerAccountPurpose accountPurpose, String currencyCode) {
        try {
            return ledgerAccountRepository.save(LedgerAccount.builder()
                .accountCode("SYS-" + accountPurpose.name() + "-" + currencyCode)
                .accountName(switch (accountPurpose) {
                    case PLATFORM_FEE_REVENUE -> "Platform Fee Revenue " + currencyCode;
                    case PLATFORM_CASH_IN_CLEARING -> "Platform Cash In Clearing " + currencyCode;
                    case WALLET_MAIN -> "System Wallet Main " + currencyCode;
                })
                .accountType(switch (accountPurpose) {
                    case PLATFORM_FEE_REVENUE -> LedgerAccountType.REVENUE;
                    case PLATFORM_CASH_IN_CLEARING -> LedgerAccountType.ASSET;
                    case WALLET_MAIN -> LedgerAccountType.LIABILITY;
                })
                .accountPurpose(accountPurpose)
                .ownerType(LedgerAccountOwnerType.SYSTEM)
                .currencyCode(currencyCode)
                .status(LedgerAccountStatus.ACTIVE)
                .allowNegativeBalance(false)
                .currentBalance(BigDecimal.ZERO)
                .metadata(new LinkedHashMap<>())
                .build());
        } catch (DataIntegrityViolationException exception) {
            return ledgerAccountRepository.findByAccountPurposeAndCurrencyCodeAndOwnerType(
                    accountPurpose,
                    currencyCode,
                    LedgerAccountOwnerType.SYSTEM
                )
                .orElseThrow(() -> exception);
        }
    }

    private BigDecimal applyEntry(LedgerAccount ledgerAccount, LedgerEntryDirection entryDirection, BigDecimal amount) {
        return switch (ledgerAccount.getAccountType()) {
            case ASSET, EXPENSE -> entryDirection == LedgerEntryDirection.DEBIT
                ? ledgerAccount.getCurrentBalance().add(amount)
                : ledgerAccount.getCurrentBalance().subtract(amount);
            case LIABILITY, REVENUE, EQUITY -> entryDirection == LedgerEntryDirection.CREDIT
                ? ledgerAccount.getCurrentBalance().add(amount)
                : ledgerAccount.getCurrentBalance().subtract(amount);
        };
    }
}
