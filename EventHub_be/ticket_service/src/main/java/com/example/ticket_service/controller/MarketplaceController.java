package com.example.ticket_service.controller;

import com.example.ticket_service.dto.PaymentResponse;
import com.example.ticket_service.dto.PostTicketRequest;
import com.example.ticket_service.model.MarketplaceListing;
import com.example.ticket_service.service.MarketplaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/marketplace")
@RequiredArgsConstructor
public class MarketplaceController {

    private final MarketplaceService marketplaceService;

    @GetMapping
    public ResponseEntity<List<MarketplaceListing>> getActiveListings() {
        return ResponseEntity.ok(marketplaceService.getActiveListings());
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<MarketplaceListing>> getSellerListings(@PathVariable String sellerId) {
        return ResponseEntity.ok(marketplaceService.getListingsForSeller(sellerId));
    }

    @GetMapping("/seller")
    public ResponseEntity<List<MarketplaceListing>> getSellerListingsQuery(@RequestParam String sellerId) {
        return ResponseEntity.ok(marketplaceService.getListingsForSeller(sellerId));
    }

    @PostMapping
    public ResponseEntity<MarketplaceListing> postTicket(@RequestBody PostTicketRequest request) {
        return ResponseEntity.ok(marketplaceService.postTicket(request));
    }

    @PostMapping("/{listingId}/buy")
    public ResponseEntity<PaymentResponse> buyTicket(@PathVariable UUID listingId, @RequestBody String buyerId) {
        return ResponseEntity.ok(marketplaceService.buyTicket(listingId, buyerId));
    }
}
