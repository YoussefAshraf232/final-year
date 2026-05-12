package com.john.inflow.service;

import com.john.inflow.dto.request.CreateWarehouseStockRequest;
import com.john.inflow.dto.request.ReviewWarehouseStockRequest;
import com.john.inflow.dto.response.PageResponse;
import com.john.inflow.dto.response.WarehouseStockRequestResponse;
import com.john.inflow.dto.response.WarehouseStockRequestSummaryResponse;
import com.john.inflow.entity.User;

public interface WarehouseStockRequestService {
    WarehouseStockRequestResponse create(CreateWarehouseStockRequest request, User actor);
    PageResponse<WarehouseStockRequestResponse> outgoing(User actor, String status, int page, int size);
    PageResponse<WarehouseStockRequestResponse> incoming(User actor, String status, int page, int size);
    WarehouseStockRequestResponse getById(Integer id, User actor);
    WarehouseStockRequestResponse accept(Integer id, ReviewWarehouseStockRequest request, User actor);
    WarehouseStockRequestResponse reject(Integer id, ReviewWarehouseStockRequest request, User actor);
    WarehouseStockRequestResponse cancel(Integer id, User actor);
    WarehouseStockRequestSummaryResponse summary(User actor);
}
