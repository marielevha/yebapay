package com.yebapay.core.identity.auth;

import com.yebapay.core.agent.AgentProfileRepository;
import com.yebapay.core.common.currency.CurrencyMetadata;
import com.yebapay.core.common.currency.CurrencyMetadataResolver;
import com.yebapay.core.identity.KycLevel;
import com.yebapay.core.identity.Role;
import com.yebapay.core.identity.RoleCode;
import com.yebapay.core.identity.RoleRepository;
import com.yebapay.core.identity.User;
import com.yebapay.core.identity.UserRepository;
import com.yebapay.core.identity.UserRole;
import com.yebapay.core.identity.UserRoleId;
import com.yebapay.core.identity.UserRoleRepository;
import com.yebapay.core.identity.UserStatus;
import com.yebapay.core.identity.auth.dto.AuthActionResponse;
import com.yebapay.core.identity.auth.dto.AuthResponse;
import com.yebapay.core.identity.auth.dto.CurrentUserResponse;
import com.yebapay.core.identity.auth.dto.LoginRequest;
import com.yebapay.core.identity.auth.dto.RefreshTokenRequest;
import com.yebapay.core.identity.auth.dto.RegisterRequest;
import com.yebapay.core.identity.auth.dto.SetupTransactionPinRequest;
import com.yebapay.core.merchant.MerchantProfileRepository;
import com.yebapay.core.transaction.TransactionPinService;
import com.yebapay.core.wallet.WalletRepository;
import com.yebapay.core.wallet.WalletService;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final WalletRepository walletRepository;
    private final WalletService walletService;
    private final MerchantProfileRepository merchantProfileRepository;
    private final AgentProfileRepository agentProfileRepository;
    private final CurrencyMetadataResolver currencyMetadataResolver;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final TransactionPinService transactionPinService;

    @Transactional
    public AuthResponse register(RegisterRequest request, ClientRequestDetails requestDetails) {
        String phoneNumber = normalizePhoneNumber(request.phoneNumber());
        String normalizedPin = normalizePin(request.pin());

        if (userRepository.existsByPhoneNumberAndDeletedAtIsNull(phoneNumber)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Phone number already registered");
        }

        String normalizedEmail = normalizeEmail(request.email());
        if (normalizedEmail != null && userRepository.existsByEmailIgnoreCaseAndDeletedAtIsNull(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        Role customerRole = roleRepository.findByRoleCode(RoleCode.CUSTOMER)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Default customer role is missing"));

        User user = User.builder()
            .publicId(generatePublicId())
            .phoneNumber(phoneNumber)
            .email(normalizedEmail)
            .firstName(normalizeName(request.firstName()))
            .lastName(normalizeName(request.lastName()))
            .displayName(buildDisplayName(request.firstName(), request.lastName(), phoneNumber))
            .passwordHash(passwordEncoder.encode(request.password()))
            .pinHash(normalizedPin == null ? null : passwordEncoder.encode(normalizedPin))
            .status(UserStatus.ACTIVE)
            .kycLevel(KycLevel.NONE)
            .failedPinAttempts(0)
            .failedPasswordAttempts(0)
            .metadata(new LinkedHashMap<>())
            .build();

        User savedUser = userRepository.save(user);

        userRoleRepository.save(UserRole.builder()
            .id(new UserRoleId(savedUser.getId(), customerRole.getId()))
            .user(savedUser)
            .role(customerRole)
            .assignedAt(Instant.now())
            .build());

        walletService.createPersonalWalletForUser(savedUser);

        AuthenticatedUser principal = AuthenticatedUser.from(savedUser, List.of(RoleCode.CUSTOMER));
        return buildAuthResponse(principal, refreshTokenService.issueForNewSession(savedUser, requestDetails));
    }

    @Transactional
    public AuthResponse login(LoginRequest request, ClientRequestDetails requestDetails) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(normalizePhoneNumber(request.phoneNumber()), request.password())
        );

        AuthenticatedUser principal = (AuthenticatedUser) authentication.getPrincipal();

        User user = userRepository.findByIdAndDeletedAtIsNull(principal.getUserId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        return buildAuthResponse(
            AuthenticatedUser.from(user, principal.getRoleCodes()),
            refreshTokenService.issueForNewSession(user, requestDetails)
        );
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request, ClientRequestDetails requestDetails) {
        IssuedRefreshToken issuedRefreshToken = refreshTokenService.rotate(request.refreshToken(), requestDetails);
        AuthenticatedUser principal = AuthenticatedUser.from(
            issuedRefreshToken.entity().getUser(),
            userRoleRepository.findRoleCodesByUserId(issuedRefreshToken.entity().getUser().getId())
        );
        return buildAuthResponse(principal, issuedRefreshToken);
    }

    @Transactional
    public void logout(RefreshTokenRequest request) {
        refreshTokenService.revokeFamilyByRawToken(request.refreshToken(), "User logout");
    }

    @Transactional
    public AuthActionResponse setupTransactionPin(AuthenticatedUser principal, SetupTransactionPinRequest request) {
        transactionPinService.setupInitialPin(principal.getUserId(), request.pin());
        return new AuthActionResponse("Transaction PIN configured successfully.");
    }

    @Transactional(readOnly = true)
    public CurrentUserResponse currentUser(AuthenticatedUser principal) {
        User user = userRepository.findByIdAndDeletedAtIsNull(principal.getUserId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        return buildCurrentUserResponse(user, userRoleRepository.findRoleCodesByUserId(user.getId()));
    }

    private AuthResponse buildAuthResponse(AuthenticatedUser principal, IssuedRefreshToken issuedRefreshToken) {
        User user = userRepository.findByIdAndDeletedAtIsNull(principal.getUserId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User account is not active");
        }
        List<RoleCode> roleCodes = userRoleRepository.findRoleCodesByUserId(user.getId());
        AuthenticatedUser refreshedPrincipal = AuthenticatedUser.from(user, roleCodes);

        return new AuthResponse(
            jwtService.generateAccessToken(refreshedPrincipal),
            issuedRefreshToken.rawToken(),
            "Bearer",
            jwtService.getAccessTokenTtlSeconds(),
            issuedRefreshToken.expiresInSeconds(),
            buildCurrentUserResponse(user, roleCodes)
        );
    }

    private CurrentUserResponse buildCurrentUserResponse(User user, List<RoleCode> roleCodes) {
        List<CurrentUserResponse.WalletSummary> wallets = walletRepository
            .findByOwnerUser_IdAndDeletedAtIsNull(user.getId())
            .stream()
            .map(wallet -> {
                CurrencyMetadata currency = currencyMetadataResolver.resolve(wallet.getCurrencyCode());
                return new CurrentUserResponse.WalletSummary(
                    wallet.getId(),
                    wallet.getWalletNumber(),
                    wallet.getWalletType(),
                    wallet.getStatus(),
                    wallet.getCurrencyCode(),
                    currency.displayCode(),
                    currency.displayName()
                );
            })
            .toList();

        return new CurrentUserResponse(
            user.getId(),
            user.getPublicId(),
            user.getPhoneNumber(),
            user.getEmail(),
            user.getDisplayName(),
            user.getStatus(),
            user.getKycLevel(),
            roleCodes,
            merchantProfileRepository.findByUser_IdAndDeletedAtIsNull(user.getId()).map(profile -> profile.getId()).orElse(null),
            agentProfileRepository.findByUser_IdAndDeletedAtIsNull(user.getId()).map(profile -> profile.getId()).orElse(null),
            wallets
        );
    }

    private String normalizePhoneNumber(String phoneNumber) {
        return phoneNumber == null ? null : phoneNumber.trim();
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            return null;
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeName(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private String normalizePin(String pin) {
        if (pin == null || pin.isBlank()) {
            return null;
        }
        return pin.trim();
    }

    private String buildDisplayName(String firstName, String lastName, String fallbackPhoneNumber) {
        String normalizedFirstName = normalizeName(firstName);
        String normalizedLastName = normalizeName(lastName);

        if (normalizedFirstName == null && normalizedLastName == null) {
            return fallbackPhoneNumber;
        }

        return ((normalizedFirstName == null ? "" : normalizedFirstName) + " " +
            (normalizedLastName == null ? "" : normalizedLastName)).trim();
    }

    private String generatePublicId() {
        return "USR-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase(Locale.ROOT);
    }
}
