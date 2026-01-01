package com.example.ticket_service.repository;

import com.example.ticket_service.model.MarketplaceListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MarketplaceRepository extends JpaRepository<MarketplaceListing, UUID> {
    List<MarketplaceListing> findByStatus(MarketplaceListing.ListingStatus status);
    List<MarketplaceListing> findBySellerId(String sellerId);
}
