package com.example.ticket_service.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentResponse {
    private String transactionId;
    private String status;
    private String paymentUrl;
}
