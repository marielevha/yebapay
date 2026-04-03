package com.yebapay.core.merchant;

import com.yebapay.core.identity.Role;
import com.yebapay.core.identity.RoleCode;
import com.yebapay.core.identity.RoleRepository;
import com.yebapay.core.identity.User;
import com.yebapay.core.identity.UserRepository;
import com.yebapay.core.identity.UserRole;
import com.yebapay.core.identity.UserRoleId;
import com.yebapay.core.identity.UserRoleRepository;
import com.yebapay.core.identity.UserStatus;
import com.yebapay.core.merchant.dto.CreateMerchantProfileRequest;
import com.yebapay.core.merchant.dto.MerchantProfileResponse;
import com.yebapay.core.qr.QrService;
import com.yebapay.core.qr.dto.QrTokenResponse;
import com.yebapay.core.wallet.Wallet;
import com.yebapay.core.wallet.WalletService;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class MerchantService {

    private final MerchantProfileRepository merchantProfileRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final WalletService walletService;
    private final QrService qrService;

    @Transactional
    public MerchantProfileResponse createOrUpdateCurrentUserMerchantProfile(UUID userId, CreateMerchantProfileRequest request) {
        User user = userRepository.findByIdAndDeletedAtIsNull(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User account is not active");
        }

        Wallet merchantWallet = walletService.createMerchantWalletForUser(user, request.businessName());
        MerchantProfile profile = merchantProfileRepository.findByUser_IdAndDeletedAtIsNull(userId)
            .orElseGet(() -> MerchantProfile.builder()
                .user(user)
                .merchantCode(generateMerchantCode())
                .settlementMode(SettlementMode.INSTANT)
                .status(MerchantStatus.ACTIVE)
                .metadata(new LinkedHashMap<>())
                .build());

        profile.setBusinessName(request.businessName().trim());
        profile.setDisplayName(normalize(request.displayName()));
        profile.setMerchantCategoryCode(normalize(request.merchantCategoryCode()));
        profile.setAddressLine1(normalize(request.addressLine1()));
        profile.setCity(normalize(request.city()));
        profile.setSettlementWallet(merchantWallet);
        profile.setStatus(MerchantStatus.ACTIVE);

        MerchantProfile savedProfile = merchantProfileRepository.save(profile);
        ensureMerchantRole(user);
        return toResponse(savedProfile);
    }

    @Transactional(readOnly = true)
    public MerchantProfileResponse currentUserMerchantProfile(UUID userId) {
        return toResponse(getActiveMerchantProfileForUser(userId));
    }

    @Transactional(readOnly = true)
    public MerchantProfile getActiveMerchantProfileForUser(UUID userId) {
        MerchantProfile profile = merchantProfileRepository.findByUser_IdAndDeletedAtIsNull(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Merchant profile not found"));
        if (profile.getStatus() != MerchantStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Merchant profile is not active");
        }
        return profile;
    }

    @Transactional
    public QrTokenResponse generateStaticQrForCurrentMerchant(UUID userId) {
        MerchantProfile profile = getActiveMerchantProfileForUser(userId);
        Wallet merchantWallet = walletService.getActiveMerchantWalletForUser(userId);
        return qrService.generateMerchantStaticQr(profile, merchantWallet);
    }

    public MerchantProfileResponse toResponse(MerchantProfile profile) {
        return new MerchantProfileResponse(
            profile.getId(),
            profile.getMerchantCode(),
            profile.getBusinessName(),
            profile.getDisplayName(),
            profile.getMerchantCategoryCode(),
            profile.getStatus().name(),
            profile.getSettlementMode().name(),
            profile.getSettlementWallet() == null ? null : profile.getSettlementWallet().getId(),
            profile.getSettlementWallet() == null ? null : profile.getSettlementWallet().getWalletNumber()
        );
    }

    private void ensureMerchantRole(User user) {
        boolean alreadyMerchant = userRoleRepository.findRoleCodesByUserId(user.getId()).contains(RoleCode.MERCHANT);
        if (alreadyMerchant) {
            return;
        }

        Role merchantRole = roleRepository.findByRoleCode(RoleCode.MERCHANT)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Merchant role is missing"));

        userRoleRepository.save(UserRole.builder()
            .id(new UserRoleId(user.getId(), merchantRole.getId()))
            .user(user)
            .role(merchantRole)
            .assignedAt(Instant.now())
            .build());
    }

    private String generateMerchantCode() {
        return "MRC-" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
