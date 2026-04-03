package com.yebapay.core.agent;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AgentProfileRepository extends JpaRepository<AgentProfile, UUID> {

    Optional<AgentProfile> findByUser_IdAndDeletedAtIsNull(UUID userId);

    Optional<AgentProfile> findByAgentCodeAndDeletedAtIsNull(String agentCode);
}
