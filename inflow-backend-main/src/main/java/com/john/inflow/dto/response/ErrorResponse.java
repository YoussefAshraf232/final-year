package com.john.inflow.dto.response;

import java.time.OffsetDateTime;
import java.util.Map;

public record ErrorResponse(
        int status,
        String error,
        String message,
        OffsetDateTime timestamp,
        String path,
        Map<String, String> fieldErrors
) {}
