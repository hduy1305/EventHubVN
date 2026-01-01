package com.example.notification_service.dto;

import lombok.Data;

@Data
public class OrderPaidEvent {
    private Long orderId;
    private String userId;
    private String userEmail;
    private String totalAmount;
    private String currency;
}
