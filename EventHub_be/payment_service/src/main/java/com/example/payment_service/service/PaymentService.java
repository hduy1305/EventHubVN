package com.example.payment_service.service;

import com.example.payment_service.dto.PaymentRequest;
import com.example.payment_service.dto.RefundRequest;
import com.example.payment_service.feign_client.OrderClient;
import com.example.payment_service.feign_client.PaymentInfoStatus;
import com.example.payment_service.model.PaymentTransaction;
import com.example.payment_service.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentTransactionRepository repo;
    private final OrderClient orderClient;
    private final VnpayService vnpayService;

    @Transactional
    public PaymentTransaction processPayment(PaymentRequest req) {
        String method = req.getPaymentMethod() != null ? req.getPaymentMethod().toUpperCase() : "VNPAY";

        if ("PAYPAL".equals(method) || "CREDIT CARD".equals(method)) {
            PaymentTransaction tx = PaymentTransaction.builder()
                    .orderId(req.getOrderId())
                    .amount(req.getAmount())
                    .paymentMethod(req.getPaymentMethod())
                    .transactionId("TX-" + method + "-" + System.currentTimeMillis())
                    .status(PaymentTransaction.Status.SUCCESS)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            PaymentTransaction savedTx = repo.save(tx);
            
            try {
                orderClient.processPayment(tx.getOrderId(), tx.getTransactionId(), PaymentInfoStatus.SUCCESS);
            } catch (Exception e) {
                System.err.println("Failed to update order service for " + method + ": " + e.getMessage());
                // In a real scenario, we might want to rollback or queue a retry. 
                // For this prototype/mock, logging is sufficient.
            }
            
            return savedTx;
        }

        // Default to VNPAY or existing logic
        var paymentInfo = vnpayService.createPaymentUrl(req.getOrderId(), req.getAmount().longValue());

        PaymentTransaction tx = PaymentTransaction.builder()
                .orderId(req.getOrderId())
                .amount(req.getAmount())
                .paymentMethod(req.getPaymentMethod()) // Or "VNPAY" if null? existing code used req.getPaymentMethod()
                .transactionId("TX" + System.currentTimeMillis())
                .vnpayTxnRef(paymentInfo.getTxnRef())
                .status(PaymentTransaction.Status.PENDING)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        PaymentTransaction savedTx = repo.save(tx);
        savedTx.setPaymentUrl(paymentInfo.getPaymentUrl());

        return savedTx;
    }

    @Transactional
    public void handleVnpayReturn(Map<String, String> params) {
        String vnp_TxnRef = params.get("vnp_TxnRef");
        String vnp_ResponseCode = params.get("vnp_ResponseCode");

        PaymentTransaction tx = repo.findByVnpayTxnRef(vnp_TxnRef)
                .orElseThrow(() -> new RuntimeException("Transaction not found with ref: " + vnp_TxnRef));

        if ("00".equals(vnp_ResponseCode)) {
            tx.setStatus(PaymentTransaction.Status.SUCCESS);
            repo.save(tx);
            try {
                orderClient.processPayment(tx.getOrderId(), tx.getTransactionId(), PaymentInfoStatus.SUCCESS);
            } catch (Exception e) {
                System.err.println("Failed to update order service: " + e.getMessage());
            }
        } else {
            tx.setStatus(PaymentTransaction.Status.FAILED);
            repo.save(tx);
            try {
                orderClient.processPayment(tx.getOrderId(), tx.getTransactionId(), PaymentInfoStatus.FAILED);
            } catch (Exception e) {
                System.err.println("Failed to update order service: " + e.getMessage());
            }
        }
    }

    @Transactional
    public PaymentTransaction processRefund(RefundRequest req) {
        // Find original transaction if possible, but for now just create a new refund transaction
        PaymentTransaction refundTx = PaymentTransaction.builder()
                .transactionId("REF-" + req.getTransactionId())
                .amount(req.getAmount().negate()) // Negative amount for refund
                .paymentMethod("REFUND")
                .status(PaymentTransaction.Status.REFUNDED)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        return repo.save(refundTx);
    }
}
