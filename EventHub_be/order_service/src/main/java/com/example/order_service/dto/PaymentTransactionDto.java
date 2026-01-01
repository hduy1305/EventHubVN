package com.example.order_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentTransactionDto {
    private Long id;
    private Long orderId;
    private String paymentMethod;
    private String transactionId;
    private String paymentUrl;
    private BigDecimal amount;
    private String status; // PaymentTransaction.Status enum as String
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
