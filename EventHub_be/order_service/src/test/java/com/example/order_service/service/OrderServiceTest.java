package com.example.order_service.service;

import com.example.order_service.dto.EventDto;
import com.example.order_service.dto.RefundRequestDto;
import com.example.order_service.feign_client.EventServiceClient;
import com.example.order_service.feign_client.PaymentServiceClient;
import com.example.order_service.model.Order;
import com.example.order_service.model.PaymentInfo;
import com.example.order_service.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;
    
    @Mock
    private EventServiceClient eventServiceClient;

    @Mock
    private PaymentServiceClient paymentServiceClient;
    
    @InjectMocks
    private OrderService orderService;

    private Order order;
    private EventDto event;

    @BeforeEach
    void setUp() {
        order = Order.builder()
                .id(1L)
                .userId(UUID.fromString("123e4567-e89b-12d3-a456-426614174000"))
                .eventId(10L)
                .totalAmount(BigDecimal.valueOf(100))
                .status(Order.OrderStatus.PAID)
                .items(new ArrayList<>())
                .build();

        PaymentInfo paymentInfo = PaymentInfo.builder()
                .transactionId("TX123")
                .status(PaymentInfo.PaymentStatus.SUCCESS)
                .build();
        order.setPaymentInfo(paymentInfo);

        event = EventDto.builder()
                .id(10L)
                .refundEnabled(true)
                .refundDeadlineHours(24)
                .startTime(LocalDateTime.now().plusHours(48)) // Event is in 48 hours
                .refundFeePercent(0.0)
                .build();
    }

    @Test
    void cancelOrder_Success_RefundsPayment() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(eventServiceClient.getEventById(10L)).thenReturn(event);
        
        orderService.cancelOrder(1L);

        verify(paymentServiceClient, times(1)).processRefund(any(RefundRequestDto.class));
        assertEquals(Order.OrderStatus.REFUNDED, order.getStatus());
    }

    @Test
    void cancelOrder_Fail_RefundDisabled() {
        event.setRefundEnabled(false);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(eventServiceClient.getEventById(10L)).thenReturn(event);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> orderService.cancelOrder(1L));
        assertEquals("Refunds are not enabled for this event.", exception.getMessage());
        verify(paymentServiceClient, never()).processRefund(any());
    }

    @Test
    void cancelOrder_Fail_DeadlinePassed() {
        event.setStartTime(LocalDateTime.now().plusHours(12)); // Event in 12 hours (Deadline is 24h before)
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(eventServiceClient.getEventById(10L)).thenReturn(event);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> orderService.cancelOrder(1L));
        // Message check can be partial as the date string changes
        assert(exception.getMessage().contains("Refund deadline has passed"));
        verify(paymentServiceClient, never()).processRefund(any());
    }
}
