package com.example.event_service.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
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
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
        private LocalDateTime startTime;
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
        private LocalDateTime endTime;
    }

    @Data
    public static class TicketType {
        private String code;
        private String name;
        private BigDecimal price;
        private Integer maxQuantity;
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
        private LocalDateTime saleStart;
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
        private LocalDateTime saleEnd;
        private String description;
    }

    @Data
    public static class TicketDetail {
        private String code;
        private String zoneName;
        private String ticketTypeCode;
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
        private LocalDateTime checkInTime;
    }

    @Data
    public static class Allocation {
        private String showtimeCode;
        private String ticketTypeCode;
        private Integer quantity;
    }
}
