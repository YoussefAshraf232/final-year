package com.john.inflow.service;

import com.john.inflow.dto.request.ChangePasswordRequest;
import com.john.inflow.dto.request.ProfileUpdateRequest;
import com.john.inflow.dto.response.UserResponse;
import com.john.inflow.entity.User;
import com.john.inflow.exception.DuplicateResourceException;
import com.john.inflow.exception.InvalidOperationException;
import com.john.inflow.mapper.UserMapper;
import com.john.inflow.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ProfileService {
    private final AuthService authService;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public ProfileService(
            AuthService authService,
            UserRepository userRepository,
            UserMapper userMapper,
            PasswordEncoder passwordEncoder
    ) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse get(Authentication authentication) {
        return userMapper.toResponse(authService.getCurrentUser(authentication));
    }

    @Transactional
    public UserResponse update(Authentication authentication, ProfileUpdateRequest request) {
        User user = authService.getCurrentUser(authentication);
        if (request.email() != null) {
            userRepository.findByEmail(request.email()).ifPresent(existing -> {
                if (!existing.getId().equals(user.getId())) {
                    throw new DuplicateResourceException("User", "email", request.email());
                }
            });
            user.setEmail(request.email());
        }
        if (request.firstName() != null) {
            user.setFirstName(request.firstName());
        }
        if (request.lastName() != null) {
            user.setLastName(request.lastName());
        }
        if (request.phoneNumber() != null) {
            user.setPhoneNumber(request.phoneNumber());
        }
        return userMapper.toResponse(userRepository.save(user));
    }

    @Transactional
    public void changePassword(Authentication authentication, ChangePasswordRequest request) {
        User user = authService.getCurrentUser(authentication);
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())
                && !request.currentPassword().equals(user.getPasswordHash())) {
            throw new InvalidOperationException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }
}
