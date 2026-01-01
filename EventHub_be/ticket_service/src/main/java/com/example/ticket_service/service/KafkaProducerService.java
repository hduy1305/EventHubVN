package com.example.ticket_service.service;

import com.example.ticket_service.dto.TicketSoldEvent;
import com.example.ticket_service.dto.TicketTransferCompletedEvent;
import com.example.ticket_service.dto.TicketTransferRequestedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class KafkaProducerService {

    private static final String TICKET_TRANSFER_REQUESTED_TOPIC = "ticket.transfer.requested";
    private static final String TICKET_TRANSFER_COMPLETED_TOPIC = "ticket.transfer.completed";
    private static final String TICKET_SOLD_TOPIC = "ticket.sold";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendTicketTransferRequestedEvent(TicketTransferRequestedEvent event) {
        kafkaTemplate.send(TICKET_TRANSFER_REQUESTED_TOPIC, event);
    }

    public void sendTicketTransferCompletedEvent(TicketTransferCompletedEvent event) {
        kafkaTemplate.send(TICKET_TRANSFER_COMPLETED_TOPIC, event);
    }

    public void sendTicketSoldEvent(TicketSoldEvent event) {
        kafkaTemplate.send(TICKET_SOLD_TOPIC, event);
    }
}
