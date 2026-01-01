package com.example.payment_service.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefundRequest {
    private String transactionId;
    private BigDecimal amount;
    private String reason;
}
