package com.john.inflow.service.impl;

import com.john.inflow.dto.request.CreateUserRequest;
import com.john.inflow.dto.request.UpdateUserRequest;
import com.john.inflow.dto.response.UserResponse;
import com.john.inflow.entity.Role;
import com.john.inflow.entity.User;
import com.john.inflow.exception.DuplicateResourceException;
import com.john.inflow.exception.ResourceNotFoundException;
import com.john.inflow.mapper.UserMapper;
import com.john.inflow.repository.RoleRepository;
import com.john.inflow.repository.UserRepository;
import com.john.inflow.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, UserMapper userMapper, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public UserResponse create(CreateUserRequest request) {
        if (userRepository.findByUsername(request.username()).isPresent()) {
            throw new DuplicateResourceException("User", "username", request.username());
        }
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new DuplicateResourceException("User", "email", request.email());
        }
        Role role = roleRepository.findById(request.roleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role", request.roleId()));

        String passwordHash = passwordEncoder.encode(request.password());
        User user = userMapper.toEntity(request, passwordHash, role);
        User saved = userRepository.save(user);
        return userMapper.toResponse(saved);
    }

    @Override
    public UserResponse getById(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        return userMapper.toResponse(user);
    }

    @Override
    public List<UserResponse> getAll() {
        return userRepository.findAll().stream()
                .map(userMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public UserResponse update(Integer id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));

        if (request.email() != null) {
            userRepository.findByEmail(request.email()).ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new DuplicateResourceException("User", "email", request.email());
                }
            });
        }

        userMapper.updateEntity(request, user);

        if (request.roleId() != null) {
            Role role = roleRepository.findById(request.roleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Role", request.roleId()));
            user.setRole(role);
        }

        User saved = userRepository.save(user);
        return userMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void delete(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        userRepository.delete(user);
    }
}
