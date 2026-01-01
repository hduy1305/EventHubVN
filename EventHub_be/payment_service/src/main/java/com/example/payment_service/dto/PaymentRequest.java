package com.example.payment_service.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRequest {
    private Long orderId;
    private BigDecimal amount;
    private String currency; // New field for currency
    private String paymentMethod; // New field for payment method (e.g., "Credit Card", "PayPal")
}
