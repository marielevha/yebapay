package com.yebapay.core.identity.auth;

import com.yebapay.core.identity.RoleCode;
import com.yebapay.core.identity.User;
import com.yebapay.core.identity.UserStatus;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Getter
public class AuthenticatedUser implements UserDetails {

    private final UUID userId;
    private final String publicId;
    private final String phoneNumber;
    private final String passwordHash;
    private final UserStatus status;
    private final List<RoleCode> roleCodes;
    private final List<SimpleGrantedAuthority> authorities;

    private AuthenticatedUser(
        UUID userId,
        String publicId,
        String phoneNumber,
        String passwordHash,
        UserStatus status,
        List<RoleCode> roleCodes,
        List<SimpleGrantedAuthority> authorities
    ) {
        this.userId = userId;
        this.publicId = publicId;
        this.phoneNumber = phoneNumber;
        this.passwordHash = passwordHash;
        this.status = status;
        this.roleCodes = roleCodes;
        this.authorities = authorities;
    }

    public static AuthenticatedUser from(User user, List<RoleCode> roleCodes) {
        List<SimpleGrantedAuthority> authorities = roleCodes.stream()
            .map(roleCode -> new SimpleGrantedAuthority("ROLE_" + roleCode.name()))
            .toList();

        return new AuthenticatedUser(
            user.getId(),
            user.getPublicId(),
            user.getPhoneNumber(),
            user.getPasswordHash(),
            user.getStatus(),
            roleCodes,
            authorities
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return phoneNumber;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return status != UserStatus.LOCKED;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return status == UserStatus.ACTIVE;
    }
}
