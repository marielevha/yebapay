package com.yebapay.core.agent;

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
@Table(name = "agent_profiles")
public class AgentProfile extends SoftDeletableEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "agent_code", nullable = false, length = 50)
    private String agentCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cash_point_id")
    private CashPoint cashPoint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supervisor_user_id")
    private User supervisorUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "settlement_wallet_id")
    private Wallet settlementWallet;

    @Column(name = "commission_scheme_code", length = 50)
    private String commissionSchemeCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private AgentStatus status;

    @lombok.Builder.Default
    @Column(name = "can_cash_in", nullable = false)
    private boolean canCashIn = true;

    @lombok.Builder.Default
    @Column(name = "can_cash_out", nullable = false)
    private boolean canCashOut = true;

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
