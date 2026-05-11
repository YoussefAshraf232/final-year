package com.john.inflow.service;

import com.john.inflow.dto.request.CreateStockEditRequest;
import com.john.inflow.dto.request.ReviewStockEditRequest;
import com.john.inflow.dto.response.PageResponse;
import com.john.inflow.dto.response.StockEditRequestResponse;
import com.john.inflow.dto.response.StockEditRequestSummaryResponse;

import java.time.OffsetDateTime;

public interface StockEditRequestService {
    StockEditRequestResponse create(CreateStockEditRequest request, Integer userId);
    StockEditRequestResponse getById(Integer id);
    PageResponse<StockEditRequestResponse> search(
            String search,
            String status,
            Integer productId,
            Integer warehouseId,
            OffsetDateTime dateFrom,
            OffsetDateTime dateTo,
            int page,
            int size
    );
    StockEditRequestResponse approve(Integer id, ReviewStockEditRequest request, Integer userId);
    StockEditRequestResponse reject(Integer id, ReviewStockEditRequest request, Integer userId);
    StockEditRequestResponse cancel(Integer id, Integer userId);
    StockEditRequestResponse addComment(Integer id, ReviewStockEditRequest request, Integer userId);
    StockEditRequestSummaryResponse getSummary();
}
