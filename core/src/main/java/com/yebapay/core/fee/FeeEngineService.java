package com.yebapay.core.fee;

import com.yebapay.core.ledger.LedgerAccount;
import com.yebapay.core.transaction.Transaction;
import com.yebapay.core.transaction.TransactionFee;
import com.yebapay.core.transaction.TransactionFeeBearer;
import com.yebapay.core.transaction.TransactionFeeRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
@RequiredArgsConstructor
public class FeeEngineService {

    private static final String ACTIVE_STATUS = "ACTIVE";

    private final FeeRuleVersionRepository feeRuleVersionRepository;
    private final TransactionFeeRepository transactionFeeRepository;

    @Transactional(readOnly = true)
    public FeeQuote quote(
        String operationType,
        String currencyCode,
        String initiatorProfileType,
        String beneficiaryProfileType,
        String merchantCategoryCode,
        BigDecimal amount
    ) {
        List<FeeRuleVersion> candidates = feeRuleVersionRepository.findActiveCandidates(
            operationType,
            currencyCode,
            normalizeCriterion(initiatorProfileType),
            normalizeCriterion(beneficiaryProfileType),
            normalizeCriterion(merchantCategoryCode),
            Instant.now()
        );

        for (FeeRuleVersion candidate : candidates) {
            if (!ACTIVE_STATUS.equals(candidate.getStatus())) {
                continue;
            }
            if (!matchesAmountRange(candidate, amount)) {
                continue;
            }
            return buildQuote(candidate, amount);
        }

        return FeeQuote.zero(amount);
    }

    @Transactional
    public void persistAppliedFee(Transaction transaction, FeeQuote feeQuote, LedgerAccount recipientLedgerAccount) {
        if (feeQuote.feeAmount().compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        transactionFeeRepository.save(TransactionFee.builder()
            .transaction(transaction)
            .feeRuleVersion(feeQuote.feeRuleVersion())
            .recipientLedgerAccount(recipientLedgerAccount)
            .feeCode(feeQuote.feeCode())
            .feeLabel(feeQuote.feeLabel())
            .feeType(feeQuote.feeType())
            .calculationMode(feeQuote.calculationMode())
            .supportedBy(feeQuote.supportedBy())
            .amount(feeQuote.feeAmount())
            .currencyCode(transaction.getCurrencyCode())
            .metadata(new LinkedHashMap<>())
            .build());
    }

    private FeeQuote buildQuote(FeeRuleVersion version, BigDecimal amount) {
        BigDecimal feeAmount = computeFeeAmount(version, amount);
        TransactionFeeBearer feeBearer = parseFeeBearer(version.getFeeRule().getSupportedBy());
        BigDecimal totalDebit = feeBearer == TransactionFeeBearer.PAYER
            ? amount.add(feeAmount)
            : amount;
        BigDecimal netAmount = (feeBearer == TransactionFeeBearer.PAYEE || feeBearer == TransactionFeeBearer.MERCHANT)
            ? amount.subtract(feeAmount)
            : amount;

        if (netAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Net amount must remain positive after fees");
        }

        return new FeeQuote(
            version,
            version.getFeeRule().getRuleCode(),
            version.getFeeRule().getName(),
            "SERVICE_FEE",
            version.getCalculationMode(),
            version.getFeeRule().getSupportedBy(),
            feeBearer,
            feeAmount,
            totalDebit,
            netAmount
        );
    }

    private BigDecimal computeFeeAmount(FeeRuleVersion version, BigDecimal amount) {
        BigDecimal feeAmount = switch (version.getCalculationMode()) {
            case "FIXED" -> safe(version.getFixedAmount());
            case "PERCENTAGE" -> percentageAmount(amount, version.getPercentageRate());
            case "MIXED" -> safe(version.getFixedAmount()).add(percentageAmount(amount, version.getPercentageRate()));
            default -> throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unsupported fee calculation mode");
        };

        if (version.getMinimumFeeAmount() != null && feeAmount.compareTo(version.getMinimumFeeAmount()) < 0) {
            feeAmount = version.getMinimumFeeAmount();
        }
        if (version.getMaximumFeeAmount() != null && feeAmount.compareTo(version.getMaximumFeeAmount()) > 0) {
            feeAmount = version.getMaximumFeeAmount();
        }
        if (version.getFeeCapAmount() != null && feeAmount.compareTo(version.getFeeCapAmount()) > 0) {
            feeAmount = version.getFeeCapAmount();
        }

        return feeAmount.setScale(4, RoundingMode.HALF_UP);
    }

    private BigDecimal percentageAmount(BigDecimal amount, BigDecimal percentageRate) {
        if (percentageRate == null || percentageRate.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return amount.multiply(percentageRate)
            .divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
    }

    private boolean matchesAmountRange(FeeRuleVersion version, BigDecimal amount) {
        if (version.getMinTransactionAmount() != null && amount.compareTo(version.getMinTransactionAmount()) < 0) {
            return false;
        }
        if (version.getMaxTransactionAmount() != null && amount.compareTo(version.getMaxTransactionAmount()) > 0) {
            return false;
        }
        return true;
    }

    private BigDecimal safe(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private String normalizeCriterion(String value) {
        return value == null ? "" : value.trim();
    }

    private TransactionFeeBearer parseFeeBearer(String supportedBy) {
        if (supportedBy == null || supportedBy.isBlank()) {
            return TransactionFeeBearer.PLATFORM;
        }
        return TransactionFeeBearer.valueOf(supportedBy.trim().toUpperCase());
    }
}
