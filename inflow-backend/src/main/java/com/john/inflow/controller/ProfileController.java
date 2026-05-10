package com.john.inflow.controller;

import com.john.inflow.dto.request.ChangePasswordRequest;
import com.john.inflow.dto.request.ProfileUpdateRequest;
import com.john.inflow.dto.response.UserResponse;
import com.john.inflow.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/profile", "/users/me"})
public class ProfileController {
    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ResponseEntity<UserResponse> get(Authentication authentication) {
        return ResponseEntity.ok(profileService.get(authentication));
    }

    @PutMapping
    public ResponseEntity<UserResponse> update(
            Authentication authentication,
            @Valid @RequestBody ProfileUpdateRequest request
    ) {
        return ResponseEntity.ok(profileService.update(authentication, request));
    }

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        profileService.changePassword(authentication, request);
        return ResponseEntity.noContent().build();
    }
}
