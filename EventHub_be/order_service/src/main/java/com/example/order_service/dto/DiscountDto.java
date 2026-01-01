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
public class DiscountDto {
    private Long id;
    private String code;
    private Integer discountPercent;
    private BigDecimal discountAmount; // New field for fixed amount discount
    private BigDecimal minimumOrderAmount; // New field for minimum order amount to apply discount
    private Integer usageLimit;
    private Integer usedCount;
    private LocalDateTime validFrom;
    private LocalDateTime validTo;
    private Long eventId;
}
