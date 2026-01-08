package com.example.ticket_service.controller;

import com.example.ticket_service.dto.TicketConfigSyncRequest;
import com.example.ticket_service.dto.TicketResponse;
import com.example.ticket_service.dto.TicketTransferRequest;
import com.example.ticket_service.dto.CheckInLogDto;
import com.example.ticket_service.model.Ticket;
import com.example.ticket_service.model.TicketConfigSnapshot;
import com.example.ticket_service.model.TicketTransfer;
import com.example.ticket_service.service.TicketConfigService;
import com.example.ticket_service.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {
    private final TicketService ticketService;
    private final TicketConfigService ticketConfigService;

    @GetMapping("/{ticketCode}")
    public ResponseEntity<TicketResponse> getTicketByCode(@PathVariable String ticketCode) {
        Ticket ticket = ticketService.getTicketByCode(ticketCode);
        return ResponseEntity.ok(ticketService.toResponse(ticket));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TicketResponse>> getTicketsByUserId(@PathVariable String userId) {
        List<Ticket> tickets = ticketService.getTicketsByUserId(userId);
        List<TicketResponse> response = tickets.stream().map(ticketService::toResponse).toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<TicketResponse>> getTicketsByEventId(@PathVariable Long eventId) {
        List<Ticket> tickets = ticketService.getTicketsByEventId(eventId);
        List<TicketResponse> response = tickets.stream().map(ticketService::toResponse).toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<TicketResponse>> getTicketsByOrderId(@PathVariable Long orderId) {
        List<Ticket> tickets = ticketService.getTicketsByOrderId(orderId);
        List<TicketResponse> response = tickets.stream().map(ticketService::toResponse).toList();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{ticketCode}/scan")
    public ResponseEntity<TicketResponse> scanTicket(
            @PathVariable String ticketCode,
            @RequestParam(required = false) String gate,
            @RequestParam(required = false) String deviceId,
            @RequestParam String staffId) {
        Ticket scannedTicket = ticketService.scanTicket(ticketCode, gate, deviceId, staffId);
        return ResponseEntity.ok(TicketResponse.fromEntity(scannedTicket));
    }

    @PostMapping("/{ticketCode}/transfer")
    public ResponseEntity<TicketTransfer> transferTicket(
            @PathVariable String ticketCode,
            @RequestBody TicketTransferRequest request) {
        TicketTransfer transfer = ticketService.transferTicket(ticketCode, request);
        return ResponseEntity.ok(transfer);
    }

    @PostMapping("/transfers/{transferId}/approve")
    public ResponseEntity<String> approveTransfer(@PathVariable UUID transferId) {
        ticketService.approveTransfer(transferId);
        return ResponseEntity.ok("Transfer approved successfully.");
    }

    @PostMapping("/config-sync")
    public ResponseEntity<TicketConfigSnapshot> syncTicketConfig(@RequestBody TicketConfigSyncRequest request) {
        return ResponseEntity.ok(ticketConfigService.saveSnapshot(request));
    }

    @GetMapping("/event/{eventId}/check-in-logs")
    public ResponseEntity<List<CheckInLogDto>> getCheckInLogs(@PathVariable Long eventId) {
        return ResponseEntity.ok(ticketService.getCheckInLogsForEvent(eventId));
    }

    @GetMapping("/user/{userId}/ticket-type/{ticketTypeId}/count")
    public ResponseEntity<Long> countUserTicketsByType(
            @PathVariable String userId,
            @PathVariable Long ticketTypeId) {
        Long count = ticketService.countUserTicketsByType(userId, ticketTypeId);
        return ResponseEntity.ok(count);
    }
}
