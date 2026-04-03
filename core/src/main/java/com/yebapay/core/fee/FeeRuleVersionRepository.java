package com.yebapay.core.fee;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FeeRuleVersionRepository extends JpaRepository<FeeRuleVersion, UUID> {

    List<FeeRuleVersion> findByFeeRuleIdOrderByVersionNumberDesc(UUID feeRuleId);

    @Query("""
        select version
        from FeeRuleVersion version
        join fetch version.feeRule rule
        where rule.deletedAt is null
          and rule.operationType = :operationType
          and rule.status = 'ACTIVE'
          and version.status = 'ACTIVE'
          and version.currencyCode = :currencyCode
          and version.validFrom <= :at
          and (version.validTo is null or version.validTo >= :at)
          and (rule.initiatorProfileType is null or rule.initiatorProfileType = :initiatorProfileType)
          and (rule.beneficiaryProfileType is null or rule.beneficiaryProfileType = :beneficiaryProfileType)
          and (rule.merchantCategoryCode is null or rule.merchantCategoryCode = :merchantCategoryCode)
        order by rule.priority asc, version.versionNumber desc
        """)
    List<FeeRuleVersion> findActiveCandidates(
        @Param("operationType") String operationType,
        @Param("currencyCode") String currencyCode,
        @Param("initiatorProfileType") String initiatorProfileType,
        @Param("beneficiaryProfileType") String beneficiaryProfileType,
        @Param("merchantCategoryCode") String merchantCategoryCode,
        @Param("at") Instant at
    );
}
