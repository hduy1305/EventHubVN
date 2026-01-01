package com.example.order_service.service;

import com.example.order_service.dto.*;
import com.example.order_service.feign_client.AuthServiceClient;
import com.example.order_service.feign_client.EventServiceClient;
import com.example.order_service.feign_client.PaymentServiceClient;
import com.example.order_service.model.*;
import com.example.order_service.repository.OrderItemRepository;
import com.example.order_service.repository.OrderRepository;
import com.example.order_service.repository.PaymentInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentInfoRepository paymentInfoRepository;
    private final ReservationService reservationService;
    private final EventServiceClient eventServiceClient;
    private final PaymentServiceClient paymentServiceClient;
    private final KafkaProducerService kafkaProducerService;
    private final AuthServiceClient authServiceClient;

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        // 1. Validate and process reservations
        List<Reservation> reservations = new ArrayList<>();
        if (request.getReservationIds() != null && !request.getReservationIds().isEmpty()) {
            for (Long resId : request.getReservationIds()) {
                Reservation reservation = reservationService.getReservationById(resId)
                        .orElseThrow(() -> new RuntimeException("Reservation not found: " + resId));
                if (reservation.getStatus() != Reservation.ReservationStatus.PENDING || reservation.getExpireAt().isBefore(LocalDateTime.now())) {
                    throw new RuntimeException("Reservation " + resId + " is not valid for order (expired or not pending).");
                }
                reservations.add(reservation);
            }
        } else if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Order must contain either reservations or direct order items.");
        }

        // 2. Calculate total amount and prepare order items
        BigDecimal totalAmount = BigDecimal.ZERO;
        Map<Long, OrderItem> orderItemMap = new HashMap<>(); // Map to group items by ticketType

                    // Process reservations first
                for (Reservation res : reservations) {
                    // Confirm the reservation
                    reservationService.confirmReservation(res.getId());
        
                    // Create or update OrderItem for this ticketType
                    OrderItem orderItem = orderItemMap.computeIfAbsent(res.getTicketTypeId(), k ->
                            OrderItem.builder()
                                    .ticketTypeId(res.getTicketTypeId())
                                    .price(BigDecimal.ZERO) // Price will be updated later
                                    .quantity(0)
                                    .build()
                    );
                    orderItem.setQuantity(orderItem.getQuantity() + 1);
        
                    // Assuming price comes from the reservation or an external service
                    // For now, let's assume a placeholder price per ticket type
                    // In a real scenario, you'd fetch the actual TicketType price from event_service
                    BigDecimal ticketPrice = BigDecimal.valueOf(100.00); // Placeholder
                    orderItem.setPrice(ticketPrice); // Set price for the order item
                    totalAmount = totalAmount.add(ticketPrice);
                }
        
                // Handle direct order items if no reservations were used (e.g., general admission)
                if (request.getReservationIds() == null || request.getReservationIds().isEmpty()) {
                    for (OrderRequest.OrderItemRequest itemRequest : request.getItems()) {
                        OrderItem orderItem = orderItemMap.computeIfAbsent(itemRequest.getTicketTypeId(), k ->
                                OrderItem.builder()
                                        .ticketTypeId(itemRequest.getTicketTypeId())
                                        .price(BigDecimal.valueOf(itemRequest.getPrice()))
                                        .quantity(0)
                                        .build()
                        );
                        orderItem.setQuantity(orderItem.getQuantity() + itemRequest.getQuantity());
                        totalAmount = totalAmount.add(BigDecimal.valueOf(itemRequest.getPrice()).multiply(BigDecimal.valueOf(itemRequest.getQuantity())));
                    }
                }

        // 3. Apply discount
        DiscountDto appliedDiscount = null;
        if (request.getDiscountCode() != null && !request.getDiscountCode().isEmpty()) {
            DiscountDto discount = eventServiceClient.validateDiscountCode(request.getEventId(), request.getDiscountCode())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid or expired discount code."));

            // Validate discount conditions
            if (discount.getValidFrom() != null && discount.getValidFrom().isAfter(LocalDateTime.now())) {
                throw new IllegalArgumentException("Discount code is not yet active.");
            }
            if (discount.getValidTo() != null && discount.getValidTo().isBefore(LocalDateTime.now())) {
                throw new IllegalArgumentException("Discount code has expired.");
            }
            if (discount.getUsageLimit() != null && discount.getUsedCount() != null && discount.getUsedCount() >= discount.getUsageLimit()) {
                throw new IllegalArgumentException("Discount code usage limit reached.");
            }
            if (discount.getMinimumOrderAmount() != null && totalAmount.compareTo(discount.getMinimumOrderAmount()) < 0) {
                throw new IllegalArgumentException("Minimum order amount for this discount not met.");
            }

            // Apply discount
            if (discount.getDiscountPercent() != null) {
                totalAmount = totalAmount.multiply(BigDecimal.valueOf(100 - discount.getDiscountPercent()).divide(BigDecimal.valueOf(100), BigDecimal.ROUND_HALF_UP));
            } else if (discount.getDiscountAmount() != null) {
                totalAmount = totalAmount.subtract(discount.getDiscountAmount());
                if (totalAmount.compareTo(BigDecimal.ZERO) < 0) {
                    totalAmount = BigDecimal.ZERO;
                }
            }
            appliedDiscount = discount;
        }

        // 4. Create the Order
        Order order = Order.builder()
                .userId(request.getUserId())
                .eventId(request.getEventId())
                .totalAmount(totalAmount)
                .currency(request.getCurrency() != null ? request.getCurrency() : "USD")
                .discountCode(request.getDiscountCode())
                .paymentMethod(request.getPaymentMethod())
                .status(Order.OrderStatus.PENDING) // Explicitly set initial status
                .build();
        
        Order savedOrder = orderRepository.save(order);
        // Ensure status is not null on the returned object before proceeding
        // In case @PrePersist is not always effective or there's a detached entity issue
        if (savedOrder.getStatus() == null) {
            savedOrder.setStatus(Order.OrderStatus.PENDING);
        }
        order = savedOrder; // Use the saved instance for further operations

        // 5. Link OrderItems to Order and save
        List<OrderItem> orderItems = new ArrayList<>(orderItemMap.values());
        for (OrderItem item : orderItems) {
            item.setOrder(order);
        }
        orderItemRepository.saveAll(orderItems);

        // 6. Link Tickets to their respective OrderItems and save
        order.setItems(orderItems); // Ensure order has items before saving tickets

        // 6b. Decrement ticket quotas immediately for purchased ticket types
        for (OrderItem item : orderItems) {
            if (item.getTicketTypeId() != null && item.getQuantity() > 0) {
                try {
                    eventServiceClient.decrementTicketQuota(item.getTicketTypeId(), item.getQuantity());
                } catch (Exception e) {
                    throw new RuntimeException("Failed to decrement ticket quota for ticket type " + item.getTicketTypeId() + ": " + e.getMessage(), e);
                }
            }
        }

        // 7. Create PaymentInfo
        PaymentInfo paymentInfo = PaymentInfo.builder()
                .order(order)
                .method(request.getPaymentMethod())
                .amount(totalAmount)
                .status(PaymentInfo.PaymentStatus.PENDING)
                .build();
        paymentInfoRepository.save(paymentInfo);

        order.setItems(orderItems);
        order.setPaymentInfo(paymentInfo);

        // Increment discount usage count if a discount was applied
        if (appliedDiscount != null) {
            eventServiceClient.incrementDiscountUsedCount(appliedDiscount.getId());
        }

        return OrderResponse.fromEntity(order);
    }

    public List<OrderResponse> getOrdersByUser(UUID userId) {
        List<OrderResponse> orderResponses = orderRepository.findByUserId(userId).stream()
                .map(OrderResponse::fromEntity)
                .collect(Collectors.toList());
        log.info(orderResponses.toString());
        return orderResponses;
    }

    public List<OrderResponse> getOrdersForEvent(Long eventId, Order.OrderStatus status) {
        List<Order> orders;
        if (status != null) {
            orders = orderRepository.findByEventIdAndStatus(eventId, status);
        } else {
            orders = orderRepository.findByEventId(eventId);
        }
        return orders.stream()
                .map(OrderResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public OrderResponse getOrder(Long id) {
        return orderRepository.findById(id)
                .map(OrderResponse::fromEntity)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    // New method to get the Order entity directly for security checks
    public Order getOrderEntity(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, Order.OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(newStatus);
        return orderRepository.save(order);
    }

    // This method now acts as a callback from the payment service
    @Transactional
    public PaymentInfo updatePaymentInfoStatus(Long orderId, String transactionId, PaymentInfo.PaymentStatus paymentStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        PaymentInfo paymentInfo = order.getPaymentInfo();
        if (paymentInfo == null) {
            throw new RuntimeException("Payment information not found for order: " + orderId);
        }

        paymentInfo.setTransactionId(transactionId);
        paymentInfo.setStatus(paymentStatus);
        paymentInfo.setPaidAt(LocalDateTime.now());
        paymentInfoRepository.save(paymentInfo);

        if (paymentStatus == PaymentInfo.PaymentStatus.SUCCESS) {
            order.setStatus(Order.OrderStatus.PAID);
            
            try {
                String userEmail = authServiceClient.getUserEmailById(order.getUserId());
                OrderPaidEvent event = OrderPaidEvent.builder()
                        .orderId(order.getId())
                        .userId(order.getUserId().toString())
                        .userEmail(userEmail)
                        .totalAmount(order.getTotalAmount().toString())
                        .currency(order.getCurrency())
                        .build();
                kafkaProducerService.sendOrderPaidEvent(event);
            } catch (Exception e) {
                log.error("Failed to send order paid event or fetch user email for order: " + orderId, e);
                // We do not rethrow here to ensure the order status update is committed
            }
        } else if (paymentStatus == PaymentInfo.PaymentStatus.FAILED) {
            order.setStatus(Order.OrderStatus.CANCELLED); // Or a specific FAILED status
            orderRepository.save(order);
            // Optionally, release reservations here if payment failed
        }
        return paymentInfo;
    }

    @Transactional
    public PaymentTransactionDto initiatePayment(Long orderId, String paymentMethod) {
        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

            if (order.getStatus() != Order.OrderStatus.PENDING) {
                throw new RuntimeException("Payment can only be initiated for PENDING orders.");
            }

            PaymentRequestDto paymentRequest = PaymentRequestDto.builder()
                    .orderId(order.getId())
                    .amount(order.getTotalAmount())
                    .currency(order.getCurrency())
                    .paymentMethod(paymentMethod)
                    .build();

            // Call payment service to process the payment
            PaymentTransactionDto paymentTransaction = paymentServiceClient.processPayment(paymentRequest);

            // Update local PaymentInfo based on the payment service response
            PaymentInfo paymentInfo = order.getPaymentInfo();
            if (paymentInfo == null) {
                // This should ideally not happen if createOrder always creates PaymentInfo
                paymentInfo = PaymentInfo.builder()
                        .order(order)
                        .method(paymentMethod)
                        .amount(order.getTotalAmount())
                        .build();
            }
            paymentInfo.setTransactionId(paymentTransaction.getTransactionId());
            PaymentInfo.PaymentStatus newStatus = PaymentInfo.PaymentStatus.PENDING;
            if (paymentTransaction.getStatus() != null) {
                try {
                    newStatus = PaymentInfo.PaymentStatus.valueOf(paymentTransaction.getStatus());
                } catch (IllegalArgumentException ignored) {
                }
            }
            paymentInfo.setStatus(newStatus); // Convert String to Enum
            paymentInfo.setPaidAt(paymentTransaction.getCreatedAt()); // Assuming createdAt is when payment was processed
            paymentInfoRepository.save(paymentInfo);

            // Update order status based on payment transaction status
            if (paymentTransaction.getStatus().equals(PaymentInfo.PaymentStatus.SUCCESS.name())) {
                order.setStatus(Order.OrderStatus.PAID);

                try {
                    String userEmail = authServiceClient.getUserEmailById(order.getUserId());
                    OrderPaidEvent event = OrderPaidEvent.builder()
                            .orderId(order.getId())
                            .userId(order.getUserId().toString())
                            .userEmail(userEmail)
                            .totalAmount(order.getTotalAmount().toString())
                            .currency(order.getCurrency())
                            .build();
                    kafkaProducerService.sendOrderPaidEvent(event);
                } catch (Exception e) {
                    log.error("Failed to send order paid event or fetch user email for order: " + orderId, e);
                    // We do not rethrow here to ensure the order status update is committed
                }
            } else if (paymentTransaction.getStatus().equals(PaymentInfo.PaymentStatus.FAILED.name())) {
                order.setStatus(Order.OrderStatus.CANCELLED); // Or a specific FAILED status
            }
            orderRepository.save(order);

            return paymentTransaction;
        } catch (Exception e){
            log.error("Error", e);
            throw new RuntimeException();
        }
    }


    @Transactional
    public void cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() == Order.OrderStatus.CANCELLED || order.getStatus() == Order.OrderStatus.REFUNDED) {
            throw new RuntimeException("Order is already cancelled or refunded.");
        }

        // Check Event Policy
        com.example.order_service.dto.EventDto event = eventServiceClient.getEventById(order.getEventId());

        // 1. Check if refund is enabled
        if (Boolean.FALSE.equals(event.getRefundEnabled())) {
            throw new RuntimeException("Refunds are not enabled for this event.");
        }

        // 2. Check deadline
        if (event.getStartTime() != null && event.getRefundDeadlineHours() != null) {
            LocalDateTime deadline = event.getStartTime().minusHours(event.getRefundDeadlineHours());
            if (LocalDateTime.now().isAfter(deadline)) {
                throw new RuntimeException("Refund deadline has passed. Deadline was: " + deadline);
            }
        }

        // 3. Process Refund if Paid
        if (order.getStatus() == Order.OrderStatus.PAID) {
            BigDecimal refundAmount = order.getTotalAmount();

            // Apply fee
            if (event.getRefundFeePercent() != null && event.getRefundFeePercent() > 0) {
                BigDecimal fee = refundAmount.multiply(BigDecimal.valueOf(event.getRefundFeePercent()).divide(BigDecimal.valueOf(100), BigDecimal.ROUND_HALF_UP));
                refundAmount = refundAmount.subtract(fee);
            }

            if (refundAmount.compareTo(BigDecimal.ZERO) > 0 && order.getPaymentInfo() != null && order.getPaymentInfo().getTransactionId() != null) {
                com.example.order_service.dto.RefundRequestDto refundReq = com.example.order_service.dto.RefundRequestDto.builder()
                        .transactionId(order.getPaymentInfo().getTransactionId())
                        .amount(refundAmount)
                        .reason("User requested cancellation")
                        .build();
                paymentServiceClient.processRefund(refundReq);
            }
            order.setStatus(Order.OrderStatus.REFUNDED);
        } else {
            order.setStatus(Order.OrderStatus.CANCELLED);
        }

        orderRepository.save(order);

        // TODO: Publish 'order.cancelled' event to Kafka
    }

    @Transactional
    public void resendTicketsForOrder(Long orderId, String recipientEmail) {
        // This functionality is now handled by the notification_service.
        // This method could publish a 'resend.tickets' event to Kafka.
    }


    // Removed getTicketsForUser, updateTicketStatus, and transferTicket as they are now in TicketService
}
