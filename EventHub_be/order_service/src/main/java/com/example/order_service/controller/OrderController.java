package com.example.order_service.controller;

import com.example.order_service.dto.OrderRequest;
import com.example.order_service.dto.OrderResponse;
import com.example.order_service.dto.PaymentTransactionDto;
import com.example.order_service.model.Order;
import com.example.order_service.model.PaymentInfo;
import com.example.order_service.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("isAuthenticated() and authentication.principal.id == #req.userId")
    public ResponseEntity<OrderResponse> create(@RequestBody OrderRequest req) {
        return ResponseEntity.ok(orderService.createOrder(req));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("isAuthenticated() and authentication.principal.id == #userId")
    public ResponseEntity<List<OrderResponse>> getByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(orderService.getOrdersByUser(userId));
    }

    @GetMapping("/event/{eventId}")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<List<OrderResponse>> getByEvent(
            @PathVariable Long eventId,
            @RequestParam(required = false) Order.OrderStatus status) {
        return ResponseEntity.ok(orderService.getOrdersForEvent(eventId, status));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (isAuthenticated() and authentication.principal.id == @orderSecurity.getOrder(#id).userId) or (isAuthenticated() and @orderSecurity.isOrganizerOfOrder(authentication.principal.id, #id))")
    public ResponseEntity<OrderResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrder(id));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN') or (isAuthenticated() and authentication.principal.id == @orderSecurity.getOrder(#id).userId) or (isAuthenticated() and @orderSecurity.isOrganizerOfOrder(authentication.principal.id, #id))")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        orderService.cancelOrder(id);
        return ResponseEntity.noContent().build();
    }

    // New endpoints for order management

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')") // Only organizer/admin can change order status
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, @RequestParam Order.OrderStatus status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }

    // This endpoint is now for internal callback from payment service, or can be removed if payment service directly updates order status
    @PostMapping("/{id}/payment-callback") // Renamed for clarity as it's a callback
    public ResponseEntity<PaymentInfo> processPaymentCallback(
            @PathVariable Long id,
            @RequestParam String transactionId,
            @RequestParam PaymentInfo.PaymentStatus paymentStatus) {
        return ResponseEntity.ok(orderService.updatePaymentInfoStatus(id, transactionId, paymentStatus));
    }

    // New endpoint to initiate payment
    @PostMapping("/{orderId}/initiate-payment")
    @PreAuthorize("isAuthenticated() and authentication.principal.id == @orderSecurity.getOrder(#orderId).userId")
    public ResponseEntity<PaymentTransactionDto> initiatePayment(
            @PathVariable Long orderId,
            @RequestParam String paymentMethod) {
        PaymentTransactionDto dto = orderService.initiatePayment(orderId, paymentMethod);
        log.info(dto.toString());
        return ResponseEntity.ok(dto);
    }

    // New endpoint to resend tickets
    @PostMapping("/{orderId}/resend-tickets")
    @PreAuthorize("isAuthenticated() and authentication.principal.id == @orderSecurity.getOrder(#orderId).userId")
    public ResponseEntity<Void> resendTickets(
            @PathVariable Long orderId,
            @RequestParam String recipientEmail) {
        orderService.resendTicketsForOrder(orderId, recipientEmail);
        return ResponseEntity.noContent().build();
    }

    // Endpoint for event service to check sold count (no auth required - internal call)
    @GetMapping("/event/{eventId}/ticket-type/{ticketTypeId}/sold-count")
    public ResponseEntity<Integer> getSoldCountForTicketType(
            @PathVariable Long eventId,
            @PathVariable Long ticketTypeId) {
        Integer soldCount = orderService.getSoldCountForTicketType(eventId, ticketTypeId);
        return ResponseEntity.ok(soldCount);
    }
}
