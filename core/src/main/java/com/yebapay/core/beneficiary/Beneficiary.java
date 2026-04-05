package com.yebapay.core.beneficiary;

import com.yebapay.core.common.model.SoftDeletableEntity;
import com.yebapay.core.identity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "beneficiaries")
public class Beneficiary extends SoftDeletableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_user_id", nullable = false)
    private User ownerUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "beneficiary_user_id")
    private User beneficiaryUser;

    @Column(name = "display_name", nullable = false, length = 150)
    private String displayName;

    @Column(name = "wallet_number", nullable = false, length = 50)
    private String walletNumber;

    @Column(name = "last_used_at")
    private Instant lastUsedAt;
}
