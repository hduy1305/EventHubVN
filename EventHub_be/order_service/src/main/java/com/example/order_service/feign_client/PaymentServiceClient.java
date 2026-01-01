package com.example.order_service.feign_client;

import com.example.order_service.dto.PaymentRequestDto;
import com.example.order_service.dto.PaymentTransactionDto;
import com.example.order_service.dto.RefundRequestDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "payment-service", url = "${payment.service-url}")
public interface PaymentServiceClient {

    @PostMapping("/api/payments")
    PaymentTransactionDto processPayment(@RequestBody PaymentRequestDto request);

    @PostMapping("/api/payments/refund")
    PaymentTransactionDto processRefund(@RequestBody RefundRequestDto request);
}
