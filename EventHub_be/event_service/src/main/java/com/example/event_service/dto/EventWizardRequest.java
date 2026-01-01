package com.example.event_service.dto;

import com.example.event_service.model.Event;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class EventWizardRequest {
    private Long eventId;
    private String organizerId;
    private String eventCode;
    private String name;
    private String category;
    private String description;
    private String logoUrl;
    private String bannerUrl;
    private Settings settings;
    private Venue venue;
    private Organizer organizer;
    private List<Showtime> showtimes;
    private List<TicketType> ticketTypes;
    private List<TicketDetail> ticketDetails;
    private List<Allocation> allocations;
    private Payout payout;
    private Invoice invoice;

    @Data
    public static class Settings {
        private String customUrl;
        private Event.Privacy privacy;
    }

    @Data
    public static class Venue {
        private String name;
        private String province;
        private String district;
        private String ward;
        private String streetAddress;
    }

    @Data
    public static class Organizer {
        private String organizerCode;
        private String organizerName;
        private String logoUrl;
        private String description;
        private Boolean termsAgreed;
        private String accountStatus;
    }

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
        private Integer purchaseLimit;
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

    @Data
    public static class Payout {
        private String accountHolderName;
        private String bankNumber;
        private String bankName;
    }

    @Data
    public static class Invoice {
        private Boolean enabled;
        private String companyName;
        private String taxCode;
        private String address;
    }
}
