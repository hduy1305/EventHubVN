package com.example.ticket_service.service;


import com.example.ticket_service.dto.PaymentRequest;
import com.example.ticket_service.dto.PaymentResponse;
import com.example.ticket_service.dto.PostTicketRequest;
import com.example.ticket_service.dto.TicketSoldEvent;
import com.example.ticket_service.feign_client.PaymentServiceClient;
import com.example.ticket_service.model.MarketplaceListing;
import com.example.ticket_service.model.Ticket;
import com.example.ticket_service.model.TicketStatus;
import com.example.ticket_service.repository.MarketplaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MarketplaceService {

    private final MarketplaceRepository marketplaceRepository;
    private final TicketService ticketService;
    private final PaymentServiceClient paymentServiceClient;
    private final KafkaProducerService kafkaProducerService;

    public List<MarketplaceListing> getActiveListings() {
        return marketplaceRepository.findByStatus(MarketplaceListing.ListingStatus.ACTIVE);
    }

    public List<MarketplaceListing> getListingsForSeller(String sellerId) {
        return marketplaceRepository.findBySellerId(sellerId);
    }

    @Transactional
    public MarketplaceListing postTicket(PostTicketRequest request) {
        Ticket ticket = ticketService.getTicketByCode(request.getTicketCode());

        if (ticket.getStatus() != TicketStatus.ISSUED) {
            throw new RuntimeException("Only issued tickets can be sold.");
        }

        MarketplaceListing listing = MarketplaceListing.builder()
                .ticket(ticket)
                .sellerId(request.getSellerId())
                .price(request.getPrice())
                .status(MarketplaceListing.ListingStatus.ACTIVE)
                .build();

        return marketplaceRepository.save(listing);
    }

    @Transactional
    public PaymentResponse buyTicket(UUID listingId, String buyerId) {
        MarketplaceListing listing = marketplaceRepository.findById(listingId)
                .orElseThrow(() -> new RuntimeException("Listing not found."));

        if (listing.getStatus() != MarketplaceListing.ListingStatus.ACTIVE) {
            throw new RuntimeException("This ticket is no longer available.");
        }

        PaymentRequest paymentRequest = PaymentRequest.builder()
                .amount(listing.getPrice())
                .currency("USD")
                .paymentMethod("VNPAY")
                .build();

        PaymentResponse paymentResponse = paymentServiceClient.processPayment(paymentRequest);

        if (paymentResponse.getPaymentUrl() != null) {
            listing.setStatus(MarketplaceListing.ListingStatus.SOLD);
            marketplaceRepository.save(listing);

            // This is not entirely correct, as the payment is not yet confirmed.
            // In a real application, we would wait for the payment confirmation.
            ticketService.updateTicketStatus(listing.getTicket().getTicketCode(), TicketStatus.TRANSFERRED);

            TicketSoldEvent event = TicketSoldEvent.builder()
                    .ticketCode(listing.getTicket().getTicketCode())
                    .sellerId(listing.getSellerId())
                    .sellerEmail(listing.getTicket().getAttendeeEmail())
                    .buyerId(buyerId)
                    .price(listing.getPrice().toString())
                    .build();
            kafkaProducerService.sendTicketSoldEvent(event);
        }

        return paymentResponse;
    }
}
