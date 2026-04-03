package com.yebapay.core.fee;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeeRuleRepository extends JpaRepository<FeeRule, UUID> {

    Optional<FeeRule> findByRuleCodeAndDeletedAtIsNull(String ruleCode);
}
