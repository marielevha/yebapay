package com.yebapay.core.fee;

import com.yebapay.core.common.model.SoftDeletableEntity;
import com.yebapay.core.identity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
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
@Table(name = "fee_rules")
public class FeeRule extends SoftDeletableEntity {

    @Column(name = "rule_code", nullable = false, length = 50)
    private String ruleCode;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "operation_type", nullable = false, length = 50)
    private String operationType;

    @Column(name = "initiator_profile_type", length = 50)
    private String initiatorProfileType;

    @Column(name = "beneficiary_profile_type", length = 50)
    private String beneficiaryProfileType;

    @Column(name = "merchant_category_code", length = 50)
    private String merchantCategoryCode;

    @Column(name = "supported_by", nullable = false, length = 50)
    private String supportedBy;

    @Column(nullable = false)
    private Integer priority;

    @Column(nullable = false, length = 40)
    private String status;

    @Column(name = "is_promotional", nullable = false)
    private boolean promotional;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private User createdByUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by_user_id")
    private User updatedByUser;
}
