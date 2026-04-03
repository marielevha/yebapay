package com.yebapay.core.fee;

import com.yebapay.core.common.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "fee_rule_versions")
public class FeeRuleVersion extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fee_rule_id", nullable = false)
    private FeeRule feeRule;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;

    @Column(nullable = false, length = 40)
    private String status;

    @Column(name = "calculation_mode", nullable = false, length = 40)
    private String calculationMode;

    @Column(name = "currency_code", nullable = false, length = 3)
    private String currencyCode;

    @Column(name = "min_transaction_amount", precision = 19, scale = 4)
    private BigDecimal minTransactionAmount;

    @Column(name = "max_transaction_amount", precision = 19, scale = 4)
    private BigDecimal maxTransactionAmount;

    @Column(name = "fixed_amount", precision = 19, scale = 4)
    private BigDecimal fixedAmount;

    @Column(name = "percentage_rate", precision = 7, scale = 4)
    private BigDecimal percentageRate;

    @Column(name = "minimum_fee_amount", precision = 19, scale = 4)
    private BigDecimal minimumFeeAmount;

    @Column(name = "maximum_fee_amount", precision = 19, scale = 4)
    private BigDecimal maximumFeeAmount;

    @Column(name = "fee_cap_amount", precision = 19, scale = 4)
    private BigDecimal feeCapAmount;

    @Column(name = "valid_from", nullable = false)
    private Instant validFrom;

    @Column(name = "valid_to")
    private Instant validTo;

    @lombok.Builder.Default
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> metadata = new LinkedHashMap<>();
}
