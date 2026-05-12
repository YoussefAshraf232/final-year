package com.john.inflow.service;

import com.john.inflow.dto.request.LoginRequest;
import com.john.inflow.dto.request.RegisterRequest;
import com.john.inflow.dto.response.AuthResponse;
import com.john.inflow.dto.response.UserResponse;
import com.john.inflow.entity.Role;
import com.john.inflow.entity.User;
import com.john.inflow.exception.DuplicateResourceException;
import com.john.inflow.exception.InvalidOperationException;
import com.john.inflow.exception.ResourceNotFoundException;
import com.john.inflow.mapper.UserMapper;
import com.john.inflow.repository.RoleRepository;
import com.john.inflow.repository.UserRepository;
import com.john.inflow.security.JwtService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AuthService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuditLogService auditLogService;

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            UserMapper userMapper,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuditLogService auditLogService
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String identifier = request.email() != null && !request.email().isBlank()
                ? request.email()
                : request.username();
        if (identifier == null || identifier.isBlank()) {
            throw new BadCredentialsException("Email or username is required");
        }

        User user = userRepository.findByEmail(identifier)
                .or(() -> userRepository.findByUsername(identifier))
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!passwordMatches(request.password(), user)) {
            throw new BadCredentialsException("Invalid credentials");
        }

        auditLogService.log(user, "LOGIN", "AUTH", user.getId(), null);
        return new AuthResponse(jwtService.generateToken(user), userMapper.toResponse(user));
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByUsername(request.username()).isPresent()) {
            throw new DuplicateResourceException("User", "username", request.username());
        }
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new DuplicateResourceException("User", "email", request.email());
        }

        Role role = roleRepository.findByName("EMPLOYEE")
                .or(() -> roleRepository.findByName("WAREHOUSE_MANAGER"))
                .or(() -> roleRepository.findAll().stream().findFirst())
                .orElseThrow(() -> new ResourceNotFoundException("Role", "default"));

        User user = User.builder()
                .username(request.username())
                .firstName(request.firstName())
                .lastName(request.lastName())
                .phoneNumber(request.phoneNumber() == null || request.phoneNumber().isBlank() ? "0000000000" : request.phoneNumber())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(role)
                .build();

        User saved = userRepository.save(user);
        auditLogService.log(saved, "REGISTER", "USER", saved.getId(), null);
        return new AuthResponse(jwtService.generateToken(saved), userMapper.toResponse(saved));
    }

    public UserResponse getMe(Authentication authentication) {
        return userMapper.toResponse(getCurrentUser(authentication));
    }

    public User getCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new InvalidOperationException("Authentication is required");
        }
        return userRepository.findWithRoleByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User", authentication.getName()));
    }

    private boolean passwordMatches(String rawPassword, User user) {
        String stored = user.getPasswordHash();
        if (stored != null && stored.startsWith("$2") && passwordEncoder.matches(rawPassword, stored)) {
            return true;
        }
        if (stored != null && stored.equals(rawPassword)) {
            user.setPasswordHash(passwordEncoder.encode(rawPassword));
            userRepository.save(user);
            return true;
        }
        return false;
    }
}
