package com.yebapay.core.identity;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> {

    @Query("""
        select ur.role.roleCode
        from UserRole ur
        where ur.user.id = :userId
        """)
    List<RoleCode> findRoleCodesByUserId(UUID userId);

    List<UserRole> findByUser_Id(UUID userId);
}
