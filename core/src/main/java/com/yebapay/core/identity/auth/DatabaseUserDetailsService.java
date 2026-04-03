package com.yebapay.core.identity.auth;

import com.yebapay.core.identity.RoleCode;
import com.yebapay.core.identity.User;
import com.yebapay.core.identity.UserRepository;
import com.yebapay.core.identity.UserRoleRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DatabaseUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByPhoneNumberAndDeletedAtIsNull(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return toPrincipal(user);
    }

    @Transactional(readOnly = true)
    public AuthenticatedUser loadByUserId(UUID userId) {
        User user = userRepository.findByIdAndDeletedAtIsNull(userId)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return toPrincipal(user);
    }

    @Transactional(readOnly = true)
    public List<RoleCode> loadRoleCodes(UUID userId) {
        return userRoleRepository.findRoleCodesByUserId(userId);
    }

    private AuthenticatedUser toPrincipal(User user) {
        return AuthenticatedUser.from(user, loadRoleCodes(user.getId()));
    }
}
