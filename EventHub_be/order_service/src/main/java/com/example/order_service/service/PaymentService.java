package com.example.order_service.service;

import com.example.order_service.model.Order;
import com.example.order_service.model.PaymentInfo;
import com.example.order_service.repository.OrderRepository;
import com.example.order_service.repository.PaymentInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentInfoRepository paymentRepo;
    private final OrderRepository orderRepo;

    public PaymentInfo recordPayment(Long orderId, String method, String txId, BigDecimal amount, boolean success) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        PaymentInfo payment = PaymentInfo.builder()
                .order(order)
                .method(method)
                .transactionId(txId)
                .amount(amount)
                .status(success ? PaymentInfo.PaymentStatus.SUCCESS : PaymentInfo.PaymentStatus.FAILED)
                .paidAt(LocalDateTime.now())
                .build();

        if (success) {
            order.setStatus(Order.OrderStatus.PAID);
            orderRepo.save(order);
        }

        return paymentRepo.save(payment);
    }
}
