package com.example.payment_service.feign_client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "order-service", url = "${order.service-url}")
public interface OrderClient {

    @PostMapping("/api/orders/{id}/payment-callback") // Corrected path
    void processPayment(@PathVariable("id") Long orderId,
                        @RequestParam("transactionId") String transactionId,
                        @RequestParam("paymentStatus") PaymentInfoStatus paymentStatus); // Use the new enum
}
