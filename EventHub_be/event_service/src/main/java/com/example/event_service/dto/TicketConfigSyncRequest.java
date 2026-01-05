package com.example.event_service.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TicketConfigSyncRequest {
    private Long eventId;
    private String eventCode;
    private List<Showtime> showtimes;
    private List<TicketType> ticketTypes;
    private List<TicketDetail> ticketDetails;
    private List<Allocation> allocations;

    @Data
    public static class Showtime {
        private String code;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
    }

    @Data
    public static class TicketType {
        private String code;
        private String name;
        private BigDecimal price;
        private Integer maxQuantity;
        private LocalDateTime saleStart;
        private LocalDateTime saleEnd;
        private String description;
    }

    @Data
    public static class TicketDetail {
        private String code;
        private String zoneName;
        private String ticketTypeCode;
        private LocalDateTime checkInTime;
    }

    @Data
    public static class Allocation {
        private String showtimeCode;
        private String ticketTypeCode;
        private Integer quantity;
    }
}
