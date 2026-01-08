package com.example.event_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketTypeWithShowtimesDto {
    private Long id;
    private String code;
    private String name;
    private BigDecimal price;
    private Integer quota; // Total quota from ticket_type table
    private Integer purchaseLimit;
    private LocalDateTime saleStart;
    private LocalDateTime saleEnd;
    private String description;
    private List<ShowtimeAvailabilityDto> showtimes;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShowtimeAvailabilityDto {
        private Long showtimeId;
        private String showtimeCode;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private Integer allocatedQuantity;
        private Integer soldQuantity;
        private Integer reservedQuantity;
        
        public Integer getAvailableQuantity() {
            return allocatedQuantity - (soldQuantity + reservedQuantity);
        }
        
        public boolean isSoldOut() {
            return getAvailableQuantity() <= 0;
        }
    }
}
