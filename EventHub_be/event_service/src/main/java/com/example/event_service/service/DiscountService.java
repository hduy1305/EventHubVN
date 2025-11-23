package com.example.event_service.service;

import com.example.event_service.model.Discount;
import com.example.event_service.repository.DiscountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DiscountService {
    private final DiscountRepository discountRepository;

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
}

