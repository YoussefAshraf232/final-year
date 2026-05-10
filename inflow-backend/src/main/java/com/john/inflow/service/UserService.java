package com.john.inflow.service;

import com.john.inflow.dto.request.CreateUserRequest;
import com.john.inflow.dto.request.UpdateUserRequest;
import com.john.inflow.dto.response.PageResponse;
import com.john.inflow.dto.response.UserResponse;

public interface UserService {
    UserResponse create(CreateUserRequest request);
    UserResponse getById(Integer id);
    PageResponse<UserResponse> getAll(int page, int size);
    UserResponse update(Integer id, UpdateUserRequest request);
    void delete(Integer id);
}
