package com.example.event_service.controller;

import com.example.event_service.model.Discount;
import com.example.event_service.service.DiscountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/discounts")
@RequiredArgsConstructor
public class DiscountController {
    private final DiscountService discountService;

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<Discount>> getDiscountsByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(discountService.findByEvent(eventId));
    }

    @GetMapping("/event/{eventId}/code/{code}")
    public ResponseEntity<Discount> getDiscountByCode(
            @PathVariable Long eventId, @PathVariable String code) {
        return ResponseEntity.ok(discountService.getByEventAndCode(eventId, code));
    }

    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @PostMapping
    public ResponseEntity<Discount> create(@RequestBody Discount discount) {
        return ResponseEntity.ok(discountService.save(discount));
    }

    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @PostMapping("/generate/{eventId}")
    public ResponseEntity<Discount> generatePromotionCode(
            @PathVariable Long eventId,
            @RequestBody Map<String, Object> request) {
        Integer discountPercent = (Integer) request.get("discountPercent");
        Integer usageLimit = request.get("usageLimit") != null 
                ? ((Number) request.get("usageLimit")).intValue() : 100;
        Integer validityDays = request.get("validityDays") != null 
                ? ((Number) request.get("validityDays")).intValue() : 30;

        Discount discount = discountService.generatePromotionCode(eventId, discountPercent, usageLimit, validityDays);
        return ResponseEntity.ok(discount);
    }

    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        discountService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

