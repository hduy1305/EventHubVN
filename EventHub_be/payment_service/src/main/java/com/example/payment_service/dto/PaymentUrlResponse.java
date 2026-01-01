package com.example.payment_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PaymentUrlResponse {
    private String paymentUrl;
    private String txnRef;
}
