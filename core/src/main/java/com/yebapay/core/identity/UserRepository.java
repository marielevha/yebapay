package com.yebapay.core.identity;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, UUID> {

    boolean existsByPhoneNumberAndDeletedAtIsNull(String phoneNumber);

    boolean existsByEmailIgnoreCaseAndDeletedAtIsNull(String email);

    Optional<User> findByIdAndDeletedAtIsNull(UUID id);

    Optional<User> findByPhoneNumberAndDeletedAtIsNull(String phoneNumber);
}
