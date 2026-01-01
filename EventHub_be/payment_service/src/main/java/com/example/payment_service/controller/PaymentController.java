package com.example.payment_service.controller;

import com.example.payment_service.dto.PaymentRequest;
import com.example.payment_service.dto.RefundRequest;
import com.example.payment_service.model.PaymentTransaction;
import com.example.payment_service.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService service;

    @PostMapping
    public ResponseEntity<PaymentTransaction> processPayment(@RequestBody PaymentRequest req) {
        PaymentTransaction tx = service.processPayment(req);
        return ResponseEntity.ok(tx);
    }

    @GetMapping("/vnpay_return")
    public ResponseEntity<String> handleVnpayReturn(@RequestParam Map<String, String> params) {
        service.handleVnpayReturn(params);
        return ResponseEntity.ok("Payment status updated.");
    }

    @PostMapping("/refund")
    public ResponseEntity<PaymentTransaction> processRefund(@RequestBody RefundRequest req) {
        return ResponseEntity.ok(service.processRefund(req));
    }
}
