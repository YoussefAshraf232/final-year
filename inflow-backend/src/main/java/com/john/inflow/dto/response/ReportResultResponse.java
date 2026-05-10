package com.john.inflow.dto.response;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

public record ReportResultResponse<T>(
        List<T> rows,
        Map<String, Object> totals,
        OffsetDateTime generatedAt
) {}
