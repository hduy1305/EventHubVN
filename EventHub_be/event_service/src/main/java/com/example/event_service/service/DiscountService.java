package com.example.event_service.service;

import com.example.event_service.model.Discount;
import com.example.event_service.model.Event;
import com.example.event_service.repository.DiscountRepository;
import com.example.event_service.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DiscountService {
    private final DiscountRepository discountRepository;
    private final EventRepository eventRepository;

    public List<Discount> findByEvent(Long eventId) {
        return discountRepository.findByEventId(eventId);
    }

    public Discount save(Discount discount) {
        return discountRepository.save(discount);
    }

    public Discount getByEventAndCode(Long eventId, String code) {
        return discountRepository.findByEventIdAndCode(eventId, code)
                .orElseThrow(() -> new RuntimeException("Discount not found"));
    }

    public void delete(Long id) {
        discountRepository.deleteById(id);
    }

    /**
     * Auto-generate a promotion discount code for an approved event
     * @param eventId Event ID
     * @param discountPercent Percentage discount (e.g., 10 for 10%)
     * @param usageLimit Max usage count
     * @param validityDays Days valid from now
     * @return Generated Discount
     */
    public Discount generatePromotionCode(
            Long eventId,
            Integer discountPercent,
            Integer usageLimit,
            Integer validityDays) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (event.getStatus() != Event.Status.PUBLISHED) {
            throw new IllegalStateException("Can only generate promotion codes for PUBLISHED events");
        }

        // Generate unique code: EVENT_<eventId>_<random>
        String code = "PROMO_" + eventId + "_" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        Discount discount = Discount.builder()
                .code(code)
                .discountPercent(discountPercent)
                .discountAmount(null)
                .minimumOrderAmount(BigDecimal.ZERO)
                .usageLimit(usageLimit)
                .usedCount(0)
                .validFrom(LocalDateTime.now())
                .validTo(LocalDateTime.now().plusDays(validityDays != null ? validityDays : 30))
                .event(event)
                .build();

        return discountRepository.save(discount);
    }
}

