package com.example.ticket_service.service;

import com.example.ticket_service.dto.OrderDetailsDto;
import com.example.ticket_service.dto.OrderPaidEvent;
import com.example.ticket_service.dto.TicketConfigSyncRequest;
import com.example.ticket_service.dto.TicketTypeDetailsDto;
import com.example.ticket_service.feign_client.EventServiceClient;
import com.example.ticket_service.feign_client.OrderServiceClient;
import com.example.ticket_service.model.Ticket;
import com.example.ticket_service.model.TicketConfigSnapshot;
import com.example.ticket_service.repository.TicketConfigSnapshotRepository;
import com.example.ticket_service.repository.TicketRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class KafkaConsumerService {

    private static final String ORDER_PAID_TOPIC = "order.paid";

    private final TicketRepository ticketRepository;
    private final OrderServiceClient orderServiceClient;
    private final EventServiceClient eventServiceClient;
    private final TicketConfigSnapshotRepository ticketConfigSnapshotRepository;
    private final ObjectMapper objectMapper;
    private final Gson gson = new Gson();

    @KafkaListener(topics = ORDER_PAID_TOPIC, groupId = "ticket-group")
    public void listenOrderPaid(String message) {
        System.out.println("Received message from " + ORDER_PAID_TOPIC + ": " + message);
        OrderPaidEvent event = gson.fromJson(message, OrderPaidEvent.class);

        OrderDetailsDto orderDetails = orderServiceClient.getOrderById(event.getOrderId());
        System.out.println("Fetched order details: " + orderDetails);

        TicketConfigSyncRequest ticketConfig = loadLatestTicketConfig(orderDetails.getEventId());
        Map<String, List<String>> ticketTypeZones = buildTicketTypeZones(ticketConfig);
        Map<String, Integer> zoneIndexByType = new HashMap<>();
        
        // Build map of ticketTypeCode to showtimeCode from allocations
        Map<String, String> ticketTypeToShowtime = buildTicketTypeToShowtime(ticketConfig);

        Map<Long, String> ticketTypeIdToCode = new HashMap<>();
        if (orderDetails.getItems() != null) {
            for (OrderDetailsDto.OrderItemDto item : orderDetails.getItems()) {
                TicketTypeDetailsDto ticketType = eventServiceClient.getTicketTypeById(item.getTicketTypeId());
                if (ticketType != null) {
                    ticketTypeIdToCode.put(item.getTicketTypeId(), ticketType.getCode());
                }
            }
        }

        List<Ticket> ticketsToSave = new ArrayList<>();
        if (orderDetails.getItems() != null) {
            for (OrderDetailsDto.OrderItemDto item : orderDetails.getItems()) {
                System.out.println("Processing item: " + item);
                String ticketTypeCode = ticketTypeIdToCode.get(item.getTicketTypeId());
                
                // Get showtime code from the order item's showtimeId
                String showtimeCode = null;
                if (item.getShowtimeId() != null) {
                    try {
                        var showtime = eventServiceClient.getShowtimeByIdInternal(item.getShowtimeId());
                        if (showtime != null) {
                            showtimeCode = showtime.getCode();
                        }
                    } catch (Exception e) {
                        System.err.println("Failed to fetch showtime for ID: " + item.getShowtimeId() + ", error: " + e.getMessage());
                        // Fallback to allocation-based lookup
                        showtimeCode = ticketTypeToShowtime.get(ticketTypeCode);
                    }
                } else {
                    // Fallback for old orders without showtimeId
                    showtimeCode = ticketTypeToShowtime.get(ticketTypeCode);
                }
                
                for (int i = 0; i < item.getQuantity(); i++) {
                    String seatLabel = assignSeatLabel(ticketTypeCode, ticketTypeZones, zoneIndexByType);
                    Ticket ticket = Ticket.builder()
                            .orderId(orderDetails.getId())
                            .eventId(orderDetails.getEventId())
                            .ticketTypeId(item.getTicketTypeId())
                            .userId(orderDetails.getUserId() != null ? orderDetails.getUserId().toString() : null)
                            .seatLabel(seatLabel)
                            .ticketCode(UUID.randomUUID().toString())
                            .showtimeCode(showtimeCode)
                            .attendeeName(event.getUserEmail()) // Use user email as initial attendee name
                            .attendeeEmail(event.getUserEmail())
                            .build();
                    ticketsToSave.add(ticket);
                }
            }
        } else {
            System.out.println("No items found in order " + event.getOrderId());
        }
        ticketRepository.saveAll(ticketsToSave);
        System.out.println("Generated " + ticketsToSave.size() + " tickets for order " + event.getOrderId());
    }

    private TicketConfigSyncRequest loadLatestTicketConfig(Long eventId) {
        if (eventId == null) {
            return null;
        }
        return ticketConfigSnapshotRepository.findTopByEventIdOrderByCreatedAtDesc(eventId)
                .map(snapshot -> parseSnapshot(snapshot.getPayload()))
                .orElse(null);
    }

    private TicketConfigSyncRequest parseSnapshot(String payload) {
        if (payload == null || payload.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readValue(payload, TicketConfigSyncRequest.class);
        } catch (Exception ex) {
            return null;
        }
    }

    private Map<String, List<String>> buildTicketTypeZones(TicketConfigSyncRequest config) {
        Map<String, List<String>> zones = new HashMap<>();
        if (config == null || config.getTicketDetails() == null) {
            return zones;
        }
        for (TicketConfigSyncRequest.TicketDetail detail : config.getTicketDetails()) {
            String code = detail.getTicketTypeCode();
            if (code == null) {
                continue;
            }
            zones.computeIfAbsent(code, k -> new ArrayList<>());
            String label = detail.getZoneName();
            if (label == null || label.isBlank()) {
                label = detail.getCode();
            }
            zones.get(code).add(label);
        }
        return zones;
    }
    
    private Map<String, String> buildTicketTypeToShowtime(TicketConfigSyncRequest config) {
        Map<String, String> mapping = new HashMap<>();
        if (config == null || config.getAllocations() == null) {
            return mapping;
        }
        for (TicketConfigSyncRequest.Allocation allocation : config.getAllocations()) {
            if (allocation.getTicketTypeCode() != null && allocation.getShowtimeCode() != null) {
                // If a ticket type is allocated to multiple showtimes, this will use the last one
                // In practice, each ticket type should typically be allocated to one showtime
                mapping.put(allocation.getTicketTypeCode(), allocation.getShowtimeCode());
            }
        }
        return mapping;
    }

    private String assignSeatLabel(String ticketTypeCode, Map<String, List<String>> zones, Map<String, Integer> indices) {
        if (ticketTypeCode == null || zones == null) {
            return null;
        }
        List<String> labels = zones.get(ticketTypeCode);
        if (labels == null || labels.isEmpty()) {
            return null;
        }
        int index = indices.getOrDefault(ticketTypeCode, 0);
        String label = labels.get(index % labels.size());
        indices.put(ticketTypeCode, index + 1);
        return label;
    }
}
