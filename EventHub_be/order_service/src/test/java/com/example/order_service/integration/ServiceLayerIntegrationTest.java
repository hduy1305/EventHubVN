package com.example.order_service.integration;

import com.example.order_service.dto.*;
import com.example.order_service.feign_client.EventServiceClient;
import com.example.order_service.feign_client.PaymentServiceClient;
import com.example.order_service.model.Order;
import com.example.order_service.repository.OrderRepository;
import com.example.order_service.service.OrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class ServiceLayerIntegrationTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderRepository orderRepository;

    @MockBean
    private EventServiceClient eventServiceClient;

    @MockBean
    private PaymentServiceClient paymentServiceClient;

    private final UUID USER_ID = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
    private final Long EVENT_ID = 1L;
    private final Long TICKET_TYPE_ID = 10L;

    @BeforeEach
    void setUp() {
        // Mock Event Service responses
        TicketTypeDto ticketType = TicketTypeDto.builder()
                .id(TICKET_TYPE_ID)
                .name("VIP")
                .price(BigDecimal.valueOf(100))
                .purchaseLimit(5)
                .build();
        
        // Ensure getTicketTypeById is called if validation logic uses it
        // (Though createOrder mainly relies on validated Discount, logic might vary)
        
        // Mock Payment Service response
        PaymentTransactionDto paymentTx = PaymentTransactionDto.builder()
                .transactionId("TX_INTEGRATION_123")
                .status("SUCCESS")
                .createdAt(LocalDateTime.now())
                .build();
                
        when(paymentServiceClient.processPayment(any(PaymentRequestDto.class))).thenReturn(paymentTx);
    }

//    @Test
//    void testCreateOrderAndInitiatePayment() {
//        // 1. Create Order
//        OrderRequest.OrderItemRequest itemReq = new OrderRequest.OrderItemRequest();
//        itemReq.setTicketTypeId(TICKET_TYPE_ID);
//        itemReq.setQuantity(2);
//        itemReq.setPrice(100.0);
//
//        OrderRequest orderReq = OrderRequest.builder()
//                .userId(USER_ID)
//                .eventId(EVENT_ID)
//                .items(Collections.singletonList(itemReq))
//                .paymentMethod("Credit Card")
//                .build();
//
//        OrderResponse createdOrder = orderService.createOrder(orderReq);
//
//        assertNotNull(createdOrder.getId());
//        assertEquals(Order.OrderStatus.PENDING, Order.OrderStatus.valueOf(createdOrder.getStatus()));
//        assertEquals(0, BigDecimal.valueOf(200.0).compareTo(createdOrder.getTotalAmount()));
//
//        // 2. Initiate Payment (Simulating user clicking "Pay")
//        PaymentTransactionDto paymentResult = orderService.initiatePayment(createdOrder.getId(), "Credit Card");
//
//        assertEquals("SUCCESS", paymentResult.getStatus());
//
//        // 3. Verify DB State
//        Order dbOrder = orderRepository.findById(createdOrder.getId()).orElseThrow();
//        assertEquals(Order.OrderStatus.PAID, dbOrder.getStatus());
//        assertEquals("TX_INTEGRATION_123", dbOrder.getPaymentInfo().getTransactionId());
//    }
}
