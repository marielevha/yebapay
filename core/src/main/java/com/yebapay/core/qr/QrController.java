package com.yebapay.core.qr;

import com.yebapay.core.identity.auth.AuthenticatedUser;
import com.yebapay.core.qr.dto.DecodeQrRequest;
import com.yebapay.core.qr.dto.DecodedQrResponse;
import com.yebapay.core.qr.dto.QrTokenResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/qr")
@RequiredArgsConstructor
public class QrController {

    private final QrService qrService;

    @PostMapping("/decode")
    public DecodedQrResponse decode(@Valid @RequestBody DecodeQrRequest request) {
        return qrService.decode(request.qrData());
    }

    @GetMapping("/me/personal")
    public QrTokenResponse personalQr(@AuthenticationPrincipal AuthenticatedUser principal) {
        return qrService.generatePersonalQr(principal.getUserId());
    }
}
