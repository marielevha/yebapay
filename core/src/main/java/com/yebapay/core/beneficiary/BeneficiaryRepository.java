package com.yebapay.core.beneficiary;

import com.yebapay.core.beneficiary.dto.BeneficiaryResponse;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BeneficiaryRepository extends JpaRepository<Beneficiary, UUID> {

    Optional<Beneficiary> findByOwnerUserIdAndWalletNumberAndDeletedAtIsNull(UUID ownerUserId, String walletNumber);

    @Query("""
        select new com.yebapay.core.beneficiary.dto.BeneficiaryResponse(
            b.id,
            b.displayName,
            b.walletNumber,
            beneficiaryUser.id,
            beneficiaryUser.displayName,
            b.lastUsedAt
        )
        from Beneficiary b
        left join b.beneficiaryUser beneficiaryUser
        where b.ownerUser.id = :ownerUserId
          and b.deletedAt is null
        order by
          case when b.lastUsedAt is null then 1 else 0 end,
          b.lastUsedAt desc,
          b.updatedAt desc
        """)
    List<BeneficiaryResponse> findCurrentUserBeneficiaries(
        @Param("ownerUserId") UUID ownerUserId,
        Pageable pageable
    );

    @Query("""
        select new com.yebapay.core.beneficiary.dto.BeneficiaryResponse(
            b.id,
            b.displayName,
            b.walletNumber,
            beneficiaryUser.id,
            beneficiaryUser.displayName,
            b.lastUsedAt
        )
        from Beneficiary b
        left join b.beneficiaryUser beneficiaryUser
        where b.ownerUser.id = :ownerUserId
          and b.deletedAt is null
          and (
            lower(b.displayName) like :likeQuery
            or lower(b.walletNumber) like :likeQuery
          )
        order by
          case when b.lastUsedAt is null then 1 else 0 end,
          b.lastUsedAt desc,
          b.updatedAt desc
        """)
    List<BeneficiaryResponse> searchCurrentUserBeneficiaries(
        @Param("ownerUserId") UUID ownerUserId,
        @Param("likeQuery") String likeQuery,
        Pageable pageable
    );
}
