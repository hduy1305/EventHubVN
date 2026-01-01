package com.example.order_service.service;

import com.example.order_service.dto.OrderPaidEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class KafkaProducerService {

    private static final String ORDER_PAID_TOPIC = "order.paid";
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendOrderPaidEvent(OrderPaidEvent event) {
        kafkaTemplate.send(ORDER_PAID_TOPIC, event);
    }
}
