package com.yebapay.core.merchant;

import com.yebapay.core.common.model.SoftDeletableEntity;
import com.yebapay.core.identity.User;
import com.yebapay.core.wallet.Wallet;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
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
@Table(name = "merchant_profiles")
public class MerchantProfile extends SoftDeletableEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "merchant_code", nullable = false, length = 50)
    private String merchantCode;

    @Column(name = "business_name", nullable = false, length = 150)
    private String businessName;

    @Column(name = "display_name", length = 150)
    private String displayName;

    @Column(name = "merchant_category_code", length = 50)
    private String merchantCategoryCode;

    @Column(name = "business_registration_number", length = 100)
    private String businessRegistrationNumber;

    @Column(name = "tax_number", length = 100)
    private String taxNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "settlement_mode", nullable = false, length = 40)
    private SettlementMode settlementMode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "settlement_wallet_id")
    private Wallet settlementWallet;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private MerchantStatus status;

    @Column(name = "country_code", length = 2)
    private String countryCode;

    @Column(length = 100)
    private String city;

    @Column(name = "address_line_1", length = 255)
    private String addressLine1;

    @Column(name = "address_line_2", length = 255)
    private String addressLine2;

    @Column(name = "website_url", length = 255)
    private String websiteUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_user_id")
    private User approvedByUser;

    @Column(name = "approved_at")
    private Instant approvedAt;

    @lombok.Builder.Default
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> metadata = new LinkedHashMap<>();
}
