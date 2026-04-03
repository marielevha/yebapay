package com.yebapay.core.wallet;

import com.yebapay.core.transaction.TransactionRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class WalletLimitService {

    private final TransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public void assertCanDebit(Wallet wallet, BigDecimal totalDebit) {
        if (totalDebit == null || totalDebit.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debit amount must be positive");
        }

        if (wallet.getDailyLimit() != null) {
            Instant from = LocalDate.now(ZoneOffset.UTC).atStartOfDay().toInstant(ZoneOffset.UTC);
            Instant to = from.plusSeconds(24 * 60 * 60);
            BigDecimal spentToday = transactionRepository.sumCompletedOutgoingAmountBySourceWalletBetween(wallet.getId(), from, to);
            if (spentToday.add(totalDebit).compareTo(wallet.getDailyLimit()) > 0) {
                throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Daily wallet limit exceeded");
            }
        }

        if (wallet.getMonthlyLimit() != null) {
            LocalDate now = LocalDate.now(ZoneOffset.UTC);
            Instant from = now.withDayOfMonth(1).atStartOfDay().toInstant(ZoneOffset.UTC);
            Instant to = now.plusMonths(1).withDayOfMonth(1).atStartOfDay().toInstant(ZoneOffset.UTC);
            BigDecimal spentThisMonth = transactionRepository.sumCompletedOutgoingAmountBySourceWalletBetween(wallet.getId(), from, to);
            if (spentThisMonth.add(totalDebit).compareTo(wallet.getMonthlyLimit()) > 0) {
                throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Monthly wallet limit exceeded");
            }
        }
    }
}
