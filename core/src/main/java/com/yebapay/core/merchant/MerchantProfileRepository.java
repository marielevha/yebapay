package com.yebapay.core.merchant;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MerchantProfileRepository extends JpaRepository<MerchantProfile, UUID> {

    Optional<MerchantProfile> findByUser_IdAndDeletedAtIsNull(UUID userId);

    Optional<MerchantProfile> findByMerchantCodeAndDeletedAtIsNull(String merchantCode);
}
