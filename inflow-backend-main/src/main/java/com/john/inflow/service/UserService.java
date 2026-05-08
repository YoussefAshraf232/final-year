package com.john.inflow.service;

import com.john.inflow.dto.request.CreateUserRequest;
import com.john.inflow.dto.request.UpdateUserRequest;
import com.john.inflow.dto.response.UserResponse;

import java.util.List;

public interface UserService {
    UserResponse create(CreateUserRequest request);
    UserResponse getById(Integer id);
    List<UserResponse> getAll();
    UserResponse update(Integer id, UpdateUserRequest request);
    void delete(Integer id);
}
