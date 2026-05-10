package com.john.inflow.controller;

import com.john.inflow.exception.InvalidOperationException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/payments")
public class PaymentController {
    @GetMapping
    public void getAll() {
        throw new InvalidOperationException("Payments are not enabled in this build");
    }

    @PostMapping
    public void create() {
        throw new InvalidOperationException("Payments are not enabled in this build");
    }
}
