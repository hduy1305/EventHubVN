package com.example.ticket_service.service;

import com.example.ticket_service.dto.TicketTransferCompletedEvent;
import com.example.ticket_service.dto.TicketTransferRequest;
import com.example.ticket_service.dto.TicketTransferRequestedEvent;
import com.example.ticket_service.dto.CheckInLogDto;
import com.example.ticket_service.dto.TicketInfoDto;
import com.example.ticket_service.dto.TicketResponse;
import com.example.ticket_service.feign_client.AuthServiceClient;
import com.example.ticket_service.feign_client.EventServiceClient;
import com.example.ticket_service.model.Ticket;
import com.example.ticket_service.model.CheckInLog;
import com.example.ticket_service.model.TicketStatus;
import com.example.ticket_service.model.TicketTransfer;
import com.example.ticket_service.repository.TicketRepository;
import com.example.ticket_service.repository.TicketTransferRepository;
import com.example.ticket_service.repository.CheckInLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketTransferRepository ticketTransferRepository;
    private final KafkaProducerService kafkaProducerService;
    private final AuthServiceClient authServiceClient;
    private final EventServiceClient eventServiceClient;
    private final CheckInLogRepository checkInLogRepository;

    public Ticket getTicketByCode(String ticketCode) {
        return ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new RuntimeException("Ticket not found with code: " + ticketCode));
    }

    public List<Ticket> getTicketsByUserId(String userId) {
        return ticketRepository.findByUserId(userId);
    }

    public List<Ticket> getTicketsByOrderId(Long orderId) {
        return ticketRepository.findByOrderId(orderId);
    }

    public List<Ticket> getTicketsByEventId(Long eventId) {
        return ticketRepository.findByEventId(eventId);
    }

    @Transactional
    public Ticket scanTicket(String ticketCode, String gate, String deviceId, String staffId) {
        Ticket ticket = getTicketByCode(ticketCode);

        List<Long> assignedEvents = authServiceClient.getAssignedEvents(staffId);
        // If assignments exist and the event isn't among them, block. If none are returned, fall back to allowing (e.g., organizer/admin).
        var eventDetails = eventServiceClient.getEventById(ticket.getEventId());
        if (assignedEvents != null && !assignedEvents.isEmpty() && !assignedEvents.contains(ticket.getEventId())) {
            throw new RuntimeException("You are not authorized to check in tickets for this event.");
        }
        if (assignedEvents == null || assignedEvents.isEmpty()) {
            String organizerId = eventDetails.getOrganizerId();
            if (organizerId == null || !organizerId.equalsIgnoreCase(staffId)) {
                throw new RuntimeException("You are not authorized to check in tickets for this event.");
            }
        }

        ZoneId zone = ZoneId.of("Asia/Ho_Chi_Minh");
        ZonedDateTime now = ZonedDateTime.now(zone);

        ZonedDateTime checkinStart = eventDetails.getStartTime().atZone(zone).minusMinutes(15);
        ZonedDateTime checkinEnd = eventDetails.getEndTime().atZone(zone);

        if (!"PUBLISHED".equalsIgnoreCase(eventDetails.getStatus())) {
            throw new RuntimeException("Event is not active for check-in.");
        }

        if (now.isBefore(checkinStart) || now.isAfter(checkinEnd)) {
            throw new RuntimeException("Ticket can only be scanned between " + checkinStart + " and " + checkinEnd);
        }

        if (ticket.getStatus() == TicketStatus.SCANNED) {
            throw new RuntimeException("Ticket " + ticketCode + " has already been scanned.");
        } else if (ticket.getStatus() == TicketStatus.ISSUED || ticket.getStatus() == TicketStatus.TRANSFERRED) {
            ticket.setStatus(TicketStatus.SCANNED);
            Ticket savedTicket = ticketRepository.save(ticket);

                // Create and save CheckInLog (minimal: only timestamp, ticket, event, user)
                CheckInLog checkInLog = CheckInLog.builder()
                    .ticket(savedTicket)
                    .eventId(savedTicket.getEventId())
                    .userId(savedTicket.getUserId())
                    .checkInTime(LocalDateTime.now())
                    .build();
                checkInLogRepository.save(checkInLog);

            return savedTicket;
        } else {
            throw new RuntimeException("Ticket " + ticketCode + " cannot be scanned. Current status: " + ticket.getStatus());
        }
    }

    @Transactional
    public TicketTransfer transferTicket(String ticketCode, TicketTransferRequest request) {
        Ticket ticket = getTicketByCode(ticketCode);

        // Validation
        if (!authServiceClient.userExists(request.getRecipientEmail())) {
            throw new RuntimeException("Recipient user does not exist.");
        }
        var eventDetails = eventServiceClient.getEventById(ticket.getEventId());
        if (!"PUBLISHED".equals(eventDetails.getStatus())) {
            throw new RuntimeException("Event is not active.");
        }

        if (ticket.getStatus() != TicketStatus.ISSUED) {
            throw new RuntimeException("Ticket is not in a transferable state.");
        }

        TicketTransfer transfer = TicketTransfer.builder()
                .ticket(ticket)
                .senderId(request.getSenderId())
                .recipientEmail(request.getRecipientEmail())
                .status(TicketTransfer.TransferStatus.PENDING)
                .build();
        ticketTransferRepository.save(transfer);

        TicketTransferRequestedEvent requestedEvent = TicketTransferRequestedEvent.builder()
                .ticketCode(ticketCode)
                .transferId(transfer.getId().toString())
                .senderEmail(ticket.getAttendeeEmail())
                .recipientEmail(request.getRecipientEmail())
                .build();
        kafkaProducerService.sendTicketTransferRequestedEvent(requestedEvent);

        return transfer;
    }

    @Transactional
    public void approveTransfer(UUID transferId) {
        TicketTransfer transfer = ticketTransferRepository.findById(transferId)
                .orElseThrow(() -> new RuntimeException("Transfer request not found."));

        if (transfer.getStatus() != TicketTransfer.TransferStatus.PENDING) {
            throw new RuntimeException("Transfer request is not pending.");
        }

        Ticket ticket = transfer.getTicket();

        ticket.setAttendeeEmail(transfer.getRecipientEmail());

        String newUserId = authServiceClient.getUserIdByEmail(transfer.getRecipientEmail());

        ticket.setUserId(newUserId);

        ticket.setStatus(TicketStatus.TRANSFERRED);

        ticketRepository.save(ticket);

        transfer.setStatus(TicketTransfer.TransferStatus.APPROVED);
        ticketTransferRepository.save(transfer);

        TicketTransferCompletedEvent completedEvent = TicketTransferCompletedEvent.builder()
                .ticketCode(ticket.getTicketCode())
                .senderEmail(ticket.getAttendeeEmail()) // This is now the new owner
                .recipientEmail(transfer.getRecipientEmail())
                .build();
        kafkaProducerService.sendTicketTransferCompletedEvent(completedEvent);
    }

    @Transactional
    public Ticket updateTicketStatus(String ticketCode, TicketStatus newStatus) {
        Ticket ticket = getTicketByCode(ticketCode);
        ticket.setStatus(newStatus);
        return ticketRepository.save(ticket);
    }

    public List<CheckInLogDto> getCheckInLogsForEvent(Long eventId) {
        return ticketRepository.findByEventId(eventId).stream()
                .filter(t -> t.getStatus() == TicketStatus.SCANNED)
                .map(CheckInLogDto::fromTicket)
                .toList();
    }

    public TicketResponse toResponse(Ticket ticket) {
        TicketResponse response = TicketResponse.fromEntity(ticket);
        try {
            var event = eventServiceClient.getEventById(ticket.getEventId());
            if (event != null) {
                response.setEventName(event.getName());
                response.setEventCategory(event.getCategory());
            }
        } catch (Exception e) {
            // Log error and continue with partial data
        }
        return response;
    }

    public Long countUserTicketsByType(String userId, Long ticketTypeId) {
        return ticketRepository.countByUserIdAndTicketTypeId(userId, ticketTypeId);
    }
}
