package com.example.ticket_service.service;

import com.example.ticket_service.dto.TicketConfigSyncRequest;
import com.example.ticket_service.model.TicketConfigSnapshot;
import com.example.ticket_service.repository.TicketConfigSnapshotRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TicketConfigService {
    private final TicketConfigSnapshotRepository ticketConfigSnapshotRepository;
    private final ObjectMapper objectMapper;

    public TicketConfigSnapshot saveSnapshot(TicketConfigSyncRequest request) {
        String payload = serialize(request);
        TicketConfigSnapshot snapshot = TicketConfigSnapshot.builder()
                .eventId(request.getEventId())
                .eventCode(request.getEventCode())
                .payload(payload)
                .build();
        return ticketConfigSnapshotRepository.save(snapshot);
    }

    private String serialize(TicketConfigSyncRequest request) {
        try {
            return objectMapper.writeValueAsString(request);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize ticket config payload.", e);
        }
    }
}
