package com.yebapay.core.transaction;

import com.yebapay.core.common.model.BaseEntity;
import com.yebapay.core.fee.FeeRuleVersion;
import com.yebapay.core.ledger.LedgerAccount;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
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
@Table(name = "transaction_fees")
public class TransactionFee extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "transaction_id", nullable = false)
    private Transaction transaction;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fee_rule_version_id")
    private FeeRuleVersion feeRuleVersion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_ledger_account_id")
    private LedgerAccount recipientLedgerAccount;

    @Column(name = "fee_code", nullable = false, length = 50)
    private String feeCode;

    @Column(name = "fee_label", length = 150)
    private String feeLabel;

    @Column(name = "fee_type", nullable = false, length = 40)
    private String feeType;

    @Column(name = "calculation_mode", nullable = false, length = 40)
    private String calculationMode;

    @Column(name = "supported_by", nullable = false, length = 50)
    private String supportedBy;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(name = "currency_code", nullable = false, length = 3)
    private String currencyCode;

    @lombok.Builder.Default
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> metadata = new LinkedHashMap<>();
}
