package com.john.inflow.controller;

import com.john.inflow.exception.InvalidOperationException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class OrderController {
    @GetMapping({"/purchase-orders", "/sales-orders"})
    public void getAll() {
        throw new InvalidOperationException("Order workflows are not enabled in this build");
    }

    @PostMapping({
            "/purchase-orders",
            "/sales-orders",
            "/purchase-orders/{id}/receive",
            "/purchase-orders/{id}/convert-to-invoice",
            "/sales-orders/{id}/pack",
            "/sales-orders/{id}/ship",
            "/sales-orders/{id}/convert-to-invoice"
    })
    public void unsupported() {
        throw new InvalidOperationException("Order workflows are not enabled in this build");
    }
}
