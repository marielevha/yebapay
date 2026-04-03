package com.yebapay.core.identity.auth;

import com.yebapay.core.identity.auth.dto.AuthResponse;
import com.yebapay.core.identity.auth.dto.AuthActionResponse;
import com.yebapay.core.identity.auth.dto.CurrentUserResponse;
import com.yebapay.core.identity.auth.dto.ForgotPasswordRequest;
import com.yebapay.core.identity.auth.dto.LoginRequest;
import com.yebapay.core.identity.auth.dto.PasswordResetVerificationResponse;
import com.yebapay.core.identity.auth.dto.RefreshTokenRequest;
import com.yebapay.core.identity.auth.dto.RegisterRequest;
import com.yebapay.core.identity.auth.dto.ResetPasswordRequest;
import com.yebapay.core.identity.auth.dto.SetupTransactionPinRequest;
import com.yebapay.core.identity.auth.dto.VerifyPasswordResetOtpRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request, HttpServletRequest httpServletRequest) {
        return authService.register(request, ClientRequestDetails.from(httpServletRequest));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpServletRequest) {
        return authService.login(request, ClientRequestDetails.from(httpServletRequest));
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@Valid @RequestBody RefreshTokenRequest request, HttpServletRequest httpServletRequest) {
        return authService.refresh(request, ClientRequestDetails.from(httpServletRequest));
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@Valid @RequestBody RefreshTokenRequest request) {
        authService.logout(request);
    }

    @PostMapping("/transaction-pin")
    public AuthActionResponse setupTransactionPin(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @Valid @RequestBody SetupTransactionPinRequest request
    ) {
        return authService.setupTransactionPin(principal, request);
    }

    @PostMapping("/forgot-password/request-otp")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public AuthActionResponse requestPasswordReset(@Valid @RequestBody ForgotPasswordRequest request) {
        return passwordResetService.requestPasswordReset(request);
    }

    @PostMapping("/forgot-password/verify-otp")
    public PasswordResetVerificationResponse verifyPasswordResetOtp(@Valid @RequestBody VerifyPasswordResetOtpRequest request) {
        PasswordResetVerificationResult result = passwordResetService.verifyPasswordResetOtp(request);
        return new PasswordResetVerificationResponse(
            result.resetToken(),
            result.expiresInSeconds(),
            "OTP verified successfully."
        );
    }

    @PostMapping("/forgot-password/reset")
    public AuthActionResponse resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return passwordResetService.resetPassword(request);
    }

    @GetMapping("/me")
    public CurrentUserResponse me(@AuthenticationPrincipal AuthenticatedUser principal) {
        return authService.currentUser(principal);
    }
}
