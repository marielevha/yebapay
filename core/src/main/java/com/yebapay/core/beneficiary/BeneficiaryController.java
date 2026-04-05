package com.yebapay.core.beneficiary;

import com.yebapay.core.beneficiary.dto.BeneficiaryResponse;
import com.yebapay.core.beneficiary.dto.UpsertBeneficiaryRequest;
import com.yebapay.core.identity.auth.AuthenticatedUser;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/beneficiaries")
@RequiredArgsConstructor
public class BeneficiaryController {

    private final BeneficiaryService beneficiaryService;

    @GetMapping("/me")
    public List<BeneficiaryResponse> currentUserBeneficiaries(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @RequestParam(required = false) String q,
        @RequestParam(defaultValue = "50") int limit
    ) {
        return beneficiaryService.listCurrentUserBeneficiaries(principal.getUserId(), q, limit);
    }

    @PostMapping("/me")
    public BeneficiaryResponse createOrUpdateCurrentUserBeneficiary(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @Valid @RequestBody UpsertBeneficiaryRequest request
    ) {
        return beneficiaryService.createOrUpdateCurrentUserBeneficiary(principal.getUserId(), request);
    }
}
