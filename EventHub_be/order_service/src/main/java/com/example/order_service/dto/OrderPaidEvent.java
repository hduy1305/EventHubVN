package com.example.order_service.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderPaidEvent {
    private Long orderId;
    private String userId;
    private String userEmail;
    private String totalAmount;
    private String currency;
}
