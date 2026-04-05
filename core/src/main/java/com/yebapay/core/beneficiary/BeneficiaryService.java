package com.yebapay.core.beneficiary;

import com.yebapay.core.beneficiary.dto.BeneficiaryResponse;
import com.yebapay.core.beneficiary.dto.UpsertBeneficiaryRequest;
import com.yebapay.core.identity.User;
import com.yebapay.core.identity.UserRepository;
import com.yebapay.core.identity.UserStatus;
import com.yebapay.core.wallet.Wallet;
import com.yebapay.core.wallet.WalletService;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class BeneficiaryService {

    private final BeneficiaryRepository beneficiaryRepository;
    private final UserRepository userRepository;
    private final WalletService walletService;

    @Transactional(readOnly = true)
    public List<BeneficiaryResponse> listCurrentUserBeneficiaries(UUID currentUserId, String query, int limit) {
        User owner = requireActiveUser(currentUserId, HttpStatus.UNAUTHORIZED, "User not found");
        int normalizedLimit = Math.min(Math.max(limit, 1), 100);
        String normalizedQuery = normalizeOptionalQuery(query);
        PageRequest pageRequest = PageRequest.of(0, normalizedLimit);

        if (normalizedQuery == null) {
            return beneficiaryRepository.findCurrentUserBeneficiaries(owner.getId(), pageRequest);
        }

        return beneficiaryRepository.searchCurrentUserBeneficiaries(
            owner.getId(),
            "%" + normalizedQuery + "%",
            pageRequest
        );
    }

    @Transactional
    public BeneficiaryResponse createOrUpdateCurrentUserBeneficiary(UUID currentUserId, UpsertBeneficiaryRequest request) {
        User owner = requireActiveUser(currentUserId, HttpStatus.UNAUTHORIZED, "User not found");
        Wallet beneficiaryWallet = resolveTargetBeneficiaryWallet(owner, request.walletNumber());
        User beneficiaryUser = beneficiaryWallet.getOwnerUser();
        String normalizedWalletNumber = beneficiaryWallet.getWalletNumber();
        String normalizedDisplayName = normalizeRequiredValue(request.displayName(), "Display name is required");

        Beneficiary beneficiary = beneficiaryRepository
            .findByOwnerUserIdAndWalletNumberAndDeletedAtIsNull(owner.getId(), normalizedWalletNumber)
            .orElseGet(() -> Beneficiary.builder()
                .ownerUser(owner)
                .walletNumber(normalizedWalletNumber)
                .build());

        beneficiary.setBeneficiaryUser(beneficiaryUser);
        beneficiary.setWalletNumber(normalizedWalletNumber);
        beneficiary.setDisplayName(normalizedDisplayName);

        return toResponse(beneficiaryRepository.save(beneficiary));
    }

    @Transactional
    public void recordSuccessfulTransfer(UUID currentUserId, Wallet beneficiaryWallet) {
        User owner = requireActiveUser(currentUserId, HttpStatus.UNAUTHORIZED, "User not found");
        User beneficiaryUser = beneficiaryWallet == null ? null : beneficiaryWallet.getOwnerUser();

        if (beneficiaryWallet == null || beneficiaryUser == null || beneficiaryUser.getDeletedAt() != null) {
            return;
        }
        if (owner.getId().equals(beneficiaryUser.getId())) {
            return;
        }

        Beneficiary beneficiary = beneficiaryRepository
            .findByOwnerUserIdAndWalletNumberAndDeletedAtIsNull(owner.getId(), beneficiaryWallet.getWalletNumber())
            .orElseGet(() -> Beneficiary.builder()
                .ownerUser(owner)
                .beneficiaryUser(beneficiaryUser)
                .walletNumber(beneficiaryWallet.getWalletNumber())
                .displayName(beneficiaryUser.getDisplayName())
                .build());

        beneficiary.setBeneficiaryUser(beneficiaryUser);
        beneficiary.setWalletNumber(beneficiaryWallet.getWalletNumber());
        beneficiary.setDisplayName(
            beneficiary.getDisplayName() == null || beneficiary.getDisplayName().isBlank()
                ? beneficiaryUser.getDisplayName()
                : beneficiary.getDisplayName().trim()
        );
        beneficiary.setLastUsedAt(Instant.now());
        beneficiaryRepository.save(beneficiary);
    }

    private Wallet resolveTargetBeneficiaryWallet(User owner, String walletNumber) {
        Wallet beneficiaryWallet = walletService.getActivePersonalWalletByWalletNumber(normalizeWalletNumber(walletNumber));
        User beneficiaryUser = beneficiaryWallet.getOwnerUser();

        if (owner.getId().equals(beneficiaryUser.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot add your own account as beneficiary");
        }

        return beneficiaryWallet;
    }

    private User requireActiveUser(UUID userId, HttpStatus notFoundStatus, String notFoundMessage) {
        User user = userRepository.findByIdAndDeletedAtIsNull(userId)
            .orElseThrow(() -> new ResponseStatusException(notFoundStatus, notFoundMessage));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User account is not active");
        }

        return user;
    }

    private BeneficiaryResponse toResponse(Beneficiary beneficiary) {
        return new BeneficiaryResponse(
            beneficiary.getId(),
            beneficiary.getDisplayName(),
            beneficiary.getWalletNumber(),
            beneficiary.getBeneficiaryUser() == null ? null : beneficiary.getBeneficiaryUser().getId(),
            beneficiary.getBeneficiaryUser() == null ? null : beneficiary.getBeneficiaryUser().getDisplayName(),
            beneficiary.getLastUsedAt()
        );
    }

    private String normalizeWalletNumber(String walletNumber) {
        return normalizeRequiredValue(walletNumber, "Wallet number is required").toUpperCase();
    }

    private String normalizeOptionalQuery(String query) {
        if (query == null || query.isBlank()) {
            return null;
        }

        return query.trim().toLowerCase();
    }

    private String normalizeRequiredValue(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }

        return value.trim();
    }
}
