package com.yebapay.core.identity;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KycRecordRepository extends JpaRepository<KycRecord, UUID> {

    List<KycRecord> findByUser_IdOrderByCreatedAtDesc(UUID userId);
}
