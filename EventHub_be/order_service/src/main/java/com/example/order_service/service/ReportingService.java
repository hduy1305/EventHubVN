package com.example.order_service.service;

import com.example.order_service.dto.DailySalesDto;
import com.example.order_service.model.Order;
import com.example.order_service.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportingService {
    private final OrderRepository orderRepository;

    public BigDecimal getRevenueByEvent(Long eventId) {
        List<Order> orders = orderRepository.findByEventIdAndStatus(eventId, Order.OrderStatus.PAID);
        return orders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public long getTicketsSoldByEvent(Long eventId) {
        // This logic needs to be re-implemented.
        // It should probably fetch this information from the ticket_service.
        return 0;
    }

    public BigDecimal calculateTotalRevenue() {
        List<Order> orders = orderRepository.findByStatus(Order.OrderStatus.PAID);
        return orders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public long getTotalTicketsSold() {
        // This logic needs to be re-implemented.
        // It should probably fetch this information from the ticket_service.
        return 0;
    }

    @Transactional(readOnly = true)
    public List<DailySalesDto> getDailySales(Long eventId, LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new RuntimeException("Start and end dates are required.");
        }
        if (endDate.isBefore(startDate)) {
            throw new RuntimeException("End date must be on or after start date.");
        }

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);
        List<Order> orders = orderRepository.findByEventIdAndStatusAndCreatedAtBetween(
                eventId, Order.OrderStatus.PAID, startDateTime, endDateTime);

        Map<LocalDate, Long> totals = new HashMap<>();
        for (Order order : orders) {
            LocalDate orderDate = order.getCreatedAt().toLocalDate();
            long quantity = order.getItems() == null ? 0 : order.getItems().stream()
                    .mapToLong(item -> item.getQuantity())
                    .sum();
            totals.put(orderDate, totals.getOrDefault(orderDate, 0L) + quantity);
        }

        List<DailySalesDto> response = new ArrayList<>();
        LocalDate cursor = startDate;
        while (!cursor.isAfter(endDate)) {
            response.add(new DailySalesDto(cursor.toString(), totals.getOrDefault(cursor, 0L)));
            cursor = cursor.plusDays(1);
        }
        return response;
    }
}
