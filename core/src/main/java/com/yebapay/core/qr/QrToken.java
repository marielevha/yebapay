package com.yebapay.core.qr;

import com.yebapay.core.common.model.BaseEntity;
import com.yebapay.core.identity.User;
import com.yebapay.core.transaction.MoneyRequest;
import com.yebapay.core.wallet.Wallet;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "qr_tokens")
public class QrToken extends BaseEntity {

    @Column(name = "qr_ref", nullable = false, length = 50)
    private String qrRef;

    @Enumerated(EnumType.STRING)
    @Column(name = "qr_type", nullable = false, length = 50)
    private QrType qrType;

    @Column(name = "issuer_type", nullable = false, length = 50)
    private String issuerType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issuer_user_id")
    private User issuerUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "beneficiary_user_id")
    private User beneficiaryUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_wallet_id")
    private Wallet targetWallet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "money_request_id")
    private MoneyRequest moneyRequest;

    @lombok.Builder.Default
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> payload = new LinkedHashMap<>();

    @Column(name = "signed_payload", columnDefinition = "text")
    private String signedPayload;

    @Column(precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(name = "currency_code", length = 3)
    private String currencyCode;

    @Column(nullable = false, length = 100)
    private String nonce;

    @Column(length = 512)
    private String signature;

    @Column(name = "single_use", nullable = false)
    private boolean singleUse;

    @Column(name = "scan_limit", nullable = false)
    private Integer scanLimit;

    @Column(name = "usage_count", nullable = false)
    private Integer usageCount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private QrStatus status;

    @Column(name = "issued_at", nullable = false)
    private Instant issuedAt;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "first_scanned_at")
    private Instant firstScannedAt;

    @Column(name = "last_scanned_at")
    private Instant lastScannedAt;

    @Column(name = "used_at")
    private Instant usedAt;

    @Column(name = "invalidated_at")
    private Instant invalidatedAt;

    @Column(name = "invalidation_reason", columnDefinition = "text")
    private String invalidationReason;

    @lombok.Builder.Default
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> metadata = new LinkedHashMap<>();
}
