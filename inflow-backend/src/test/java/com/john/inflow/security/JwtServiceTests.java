package com.john.inflow.security;

import com.john.inflow.entity.Role;
import com.john.inflow.entity.User;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTests {
    @Test
    void generatedTokenContainsUsername() {
        JwtService jwtService = new JwtService("test-secret-32-bytes-or-more-AAAAAAAA!", 60);
        String token = jwtService.generateToken(user());
        assertThat(jwtService.extractUsername(token)).isEqualTo("admin");
    }

    @Test
    void generatedTokenIsValidForSameUser() {
        JwtService jwtService = new JwtService("test-secret-32-bytes-or-more-AAAAAAAA!", 60);
        User user = user();
        assertThat(jwtService.isValid(jwtService.generateToken(user), user)).isTrue();
    }

    @Test
    void blankSecretFailsFast() {
        JwtService jwtService = new JwtService("", 60);
        assertThatThrownBy(() -> jwtService.generateToken(user()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("INFLOW_JWT_SECRET");
    }

    @Test
    void shortSecretFailsFast() {
        JwtService jwtService = new JwtService("short!", 60);
        assertThatThrownBy(() -> jwtService.generateToken(user()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("32 bytes");
    }

    private User user() {
        return User.builder()
                .id(1)
                .username("admin")
                .email("admin@inflow.local")
                .phoneNumber("0000000000")
                .passwordHash("$2a$10$placeholder")
                .role(Role.builder().id(1).name("SYSTEM_ADMIN").build())
                .build();
    }
}
