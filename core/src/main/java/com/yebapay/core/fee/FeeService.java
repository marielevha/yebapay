package com.yebapay.core.fee;

import com.yebapay.core.merchant.MerchantProfile;
import com.yebapay.core.transaction.TransactionFeeBearer;
import com.yebapay.core.transaction.TransactionType;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FeeService {

    private final FeeRuleVersionRepository feeRuleVersionRepository;

    public FeeComputation compute(
        TransactionType operationType,
        BigDecimal amount,
        String currencyCode,
        String initiatorProfileType,
        String beneficiaryProfileType,
        MerchantProfile merchantProfile
    ) {
        Instant now = Instant.now();
        String normalizedCurrency = normalize(currencyCode);
        String merchantCategoryCode = merchantProfile == null ? null : merchantProfile.getMerchantCategoryCode();

        List<FeeRuleVersion> candidates = feeRuleVersionRepository.findActiveCandidates(
            operationType.name(),
            normalizedCurrency,
            initiatorProfileType,
            beneficiaryProfileType,
            merchantCategoryCode,
            now
        );

        if (candidates.isEmpty() && operationType == TransactionType.MONEY_REQUEST) {
            candidates = feeRuleVersionRepository.findActiveCandidates(
                TransactionType.P2P_TRANSFER.name(),
                normalizedCurrency,
                initiatorProfileType,
                beneficiaryProfileType,
                merchantCategoryCode,
                now
            );
        }

        if (candidates.isEmpty()) {
            return FeeComputation.zero(TransactionFeeBearer.PAYER);
        }

        FeeRuleVersion matchedVersion = candidates.stream()
            .filter(version -> isAmountInRange(version, amount))
            .findFirst()
            .orElse(candidates.get(0));

        BigDecimal feeAmount = calculateFee(matchedVersion, amount);
        TransactionFeeBearer feeBearer = TransactionFeeBearer.valueOf(
            matchedVersion.getFeeRule().getSupportedBy().toUpperCase(Locale.ROOT)
        );

        return new FeeComputation(
            matchedVersion,
            matchedVersion.getFeeRule().getRuleCode(),
            matchedVersion.getFeeRule().getName(),
            matchedVersion.getCalculationMode(),
            feeBearer,
            feeAmount
        );
    }

    private boolean isAmountInRange(FeeRuleVersion version, BigDecimal amount) {
        if (version.getMinTransactionAmount() != null && amount.compareTo(version.getMinTransactionAmount()) < 0) {
            return false;
        }
        return version.getMaxTransactionAmount() == null || amount.compareTo(version.getMaxTransactionAmount()) <= 0;
    }

    private BigDecimal calculateFee(FeeRuleVersion version, BigDecimal amount) {
        BigDecimal fixedAmount = version.getFixedAmount() == null ? BigDecimal.ZERO : version.getFixedAmount();
        BigDecimal percentageAmount = version.getPercentageRate() == null
            ? BigDecimal.ZERO
            : amount.multiply(version.getPercentageRate())
                .divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);

        BigDecimal feeAmount = switch (version.getCalculationMode().toUpperCase(Locale.ROOT)) {
            case "PERCENTAGE" -> percentageAmount;
            case "MIXED" -> fixedAmount.add(percentageAmount);
            default -> fixedAmount;
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
        return feeAmount.max(BigDecimal.ZERO).setScale(4, RoundingMode.HALF_UP);
    }

    private String normalize(String currencyCode) {
        return currencyCode == null ? null : currencyCode.trim().toUpperCase(Locale.ROOT);
    }
}
