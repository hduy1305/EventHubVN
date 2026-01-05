package com.example.event_service.service;

import com.example.event_service.dto.EventTransferPolicyDto;
import com.example.event_service.dto.EventWizardRequest;
import com.example.event_service.dto.ReservationDto;
import com.example.event_service.dto.TicketConfigSyncRequest;
import com.example.event_service.feign_client.OrderServiceClient;
import com.example.event_service.feign_client.TicketServiceClient;
import com.example.event_service.model.Discount;
import com.example.event_service.model.Event;
import com.example.event_service.model.EventInvoiceInfo;
import com.example.event_service.model.EventOrganizerInfo;
import com.example.event_service.model.EventPayoutInfo;
import com.example.event_service.model.EventShowtime;
import com.example.event_service.model.Seat;
import com.example.event_service.model.ShowtimeTicketAllocation;
import com.example.event_service.model.TicketType;
import com.example.event_service.model.TicketZone;
import com.example.event_service.model.Venue;
import com.example.event_service.repository.DiscountRepository;
import com.example.event_service.repository.EventRepository;
import com.example.event_service.repository.SeatRepository;
import com.example.event_service.repository.TicketTypeRepository;
import com.example.event_service.specification.EventSpecification;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {
    private static final Logger log = LoggerFactory.getLogger(EventService.class); // Logger instance

    private final EventRepository eventRepository;
    private final TicketTypeRepository ticketTypeRepository;
    private final DiscountRepository discountRepository;
    private final SeatRepository seatRepository;
    private final OrderServiceClient orderServiceClient; // Inject Feign Client
    private final TicketServiceClient ticketServiceClient;

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public List<Event> getEventsByStatus(Event.Status status) {
        return eventRepository.findByStatus(status);
    }

    public List<Event> getEventsByOrganizerAndStatus(String organizerId, Event.Status status) {
        try {
            java.util.UUID orgUuid = organizerId == null ? null : java.util.UUID.fromString(organizerId);
            return eventRepository.findByOrganizerIdAndStatus(orgUuid, status);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid organizerId format", e);
        }
    }

    public List<Event> getEventsByOrganizer(String organizerId) {
        try {
            java.util.UUID orgUuid = organizerId == null ? null : java.util.UUID.fromString(organizerId);
            return eventRepository.findByOrganizerId(orgUuid);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid organizerId format", e);
        }
    }

    public Event getById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
    }

    public Event createEvent(Event event) {
        // Ensure default values are set if not provided
        if (event.getAllowTicketTransfer() == null) event.setAllowTicketTransfer(false);
        if (event.getAllowAttendeeNameChange() == null) event.setAllowAttendeeNameChange(false);
        return eventRepository.save(event);
    }

    @Transactional
    public Event updateEvent(Long id, Event updated) {
        Event existing = getById(id);
        log.debug("Updating event ID {}. Existing: {}", id, existing);
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setCategory(updated.getCategory());
        existing.setVenue(updated.getVenue()); // Assuming venue is handled as an entity or ID
        existing.setStartTime(updated.getStartTime());
        existing.setEndTime(updated.getEndTime());
        existing.setCoverImage(updated.getCoverImage());
        // Status update is handled via specific workflows (submit/approve/cancel)
        existing.setAllowTicketTransfer(updated.getAllowTicketTransfer()); // Update new field
        existing.setAllowAttendeeNameChange(updated.getAllowAttendeeNameChange()); // Update new field
        existing.setRefundEnabled(updated.getRefundEnabled());
        existing.setRefundDeadlineHours(updated.getRefundDeadlineHours());
        existing.setRefundFeePercent(updated.getRefundFeePercent());
        Event savedEvent = eventRepository.save(existing);
        log.debug("Event ID {} updated to: {}", id, savedEvent);
        return savedEvent;
    }

    @Transactional
    public Event cancelEvent(Long id) {
        Event event = getById(id);
        event.setStatus(Event.Status.CANCELLED);
        return eventRepository.save(event);
    }

    @Transactional
    public Event submitForApproval(Long id) {
        Event event = getById(id);
        if (event.getStatus() != Event.Status.DRAFT) {
            throw new RuntimeException("Only DRAFT events can be submitted for approval.");
        }
        event.setStatus(Event.Status.PENDING_APPROVAL);
        return eventRepository.save(event);
    }

    @Transactional
    public Event saveWizardDraft(EventWizardRequest request) {
        return saveWizard(request, false);
    }

    @Transactional
    public Event submitWizard(EventWizardRequest request) {
        Event event = saveWizard(request, true);
        syncTicketConfig(request, event);
        return event;
    }

    @Transactional
    public Event approveEvent(Long id) {
        Event event = getById(id);
        if (event.getStatus() != Event.Status.PENDING_APPROVAL) {
            throw new RuntimeException("Only PENDING_APPROVAL events can be approved.");
        }
        event.setStatus(Event.Status.PUBLISHED);
        return eventRepository.save(event);
    }
    
    @Transactional
    public Event updateStatus(Long id, Event.Status status) {
        Event event = getById(id);
        event.setStatus(status);
        return eventRepository.save(event);
    }

    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }

    public boolean customUrlExists(String customUrl, Long excludeEventId) {
        if (customUrl == null || customUrl.isBlank()) {
            return false;
        }
        Optional<Event> existing = eventRepository.findByCustomUrl(customUrl);
        return existing.isPresent() && (excludeEventId == null || !existing.get().getId().equals(excludeEventId));
    }

    // Methods for TicketType management
    public TicketType addTicketTypeToEvent(Long eventId, TicketType ticketType) {
        Event event = getById(eventId);
        ticketType.setEvent(event);
        return ticketTypeRepository.save(ticketType);
    }

    public List<TicketType> getTicketTypesForEvent(Long eventId) {
        return ticketTypeRepository.findByEventId(eventId);
    }

    public TicketType getTicketTypeById(Long id) {
        return ticketTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket type not found"));
    }

    private Event saveWizard(EventWizardRequest request, boolean submit) {
        if (request == null) {
            throw new RuntimeException("Request payload is required.");
        }
        if (customUrlExists(getCustomUrl(request), request.getEventId())) {
            throw new RuntimeException("Custom URL already exists.");
        }
        if (submit) {
            validateWizardRequest(request);
        }

        Event event = request.getEventId() != null ? getById(request.getEventId()) : new Event();
        if (request.getOrganizerId() != null) {
            event.setOrganizerId(UUID.fromString(request.getOrganizerId()));
        }
        event.setEventCode(resolveEventCode(event.getEventCode(), request.getEventCode()));
        event.setName(request.getName());
        event.setCategory(request.getCategory());
        event.setDescription(request.getDescription());
        event.setLogoUrl(request.getLogoUrl());
        event.setBannerUrl(request.getBannerUrl());
        event.setCustomUrl(getCustomUrl(request));
        event.setPrivacy(getPrivacy(request));

        if (request.getCategory() != null && request.getCategory().equalsIgnoreCase("Online")) {
            event.setVenue(null);
        } else {
            event.setVenue(mapVenue(event.getVenue(), request.getVenue()));
        }

        mapOrganizerInfo(event, request.getOrganizer());
        mapPayoutInfo(event, request.getPayout());
        mapInvoiceInfo(event, request.getInvoice());

        List<EventShowtime> showtimes = mapShowtimes(event, request.getShowtimes());
        List<TicketType> ticketTypes = mapTicketTypes(event, request.getTicketTypes());
        mapTicketZones(event, request.getTicketDetails(), ticketTypes);
        mapAllocations(showtimes, request.getAllocations(), ticketTypes);
        calculateQuotasFromAllocations(ticketTypes, showtimes);

        event.setShowtimes(showtimes);
        event.setTicketTypes(ticketTypes);

        applyEventTimesFromShowtimes(event, showtimes);
        event.setStatus(submit ? Event.Status.PENDING_APPROVAL : Event.Status.DRAFT);
        return eventRepository.save(event);
    }

    private String resolveEventCode(String existing, String requested) {
        if (requested != null && !requested.isBlank()) {
            return requested;
        }
        if (existing != null && !existing.isBlank()) {
            return existing;
        }
        return "EVT-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
    }

    private String getCustomUrl(EventWizardRequest request) {
        Event.Privacy privacy = getPrivacy(request);
        
        // customUrl is only required for PRIVATE events
        if (privacy == Event.Privacy.PUBLIC) {
            return null;
        }
        
        if (request.getSettings() == null) {
            return null;
        }
        
        String customUrl = request.getSettings().getCustomUrl();
        
        // Return null if customUrl is empty or whitespace for PRIVATE events
        return (customUrl != null && !customUrl.trim().isEmpty()) ? customUrl : null;
    }

    private Event.Privacy getPrivacy(EventWizardRequest request) {
        if (request.getSettings() == null || request.getSettings().getPrivacy() == null) {
            return Event.Privacy.PUBLIC;
        }
        return request.getSettings().getPrivacy();
    }

    private Venue mapVenue(Venue existing, EventWizardRequest.Venue request) {
        if (request == null) {
            return null;
        }
        Venue venue = existing != null ? existing : new Venue();
        venue.setName(request.getName());
        venue.setProvince(request.getProvince());
        venue.setDistrict(request.getDistrict());
        venue.setWard(request.getWard());
        venue.setStreetAddress(request.getStreetAddress());
        venue.setCity(request.getProvince());
        venue.setAddress(String.join(", ",
                safe(request.getStreetAddress()),
                safe(request.getWard()),
                safe(request.getDistrict()),
                safe(request.getProvince())).trim());
        return venue;
    }

    private void mapOrganizerInfo(Event event, EventWizardRequest.Organizer organizer) {
        if (organizer == null) {
            event.setOrganizerInfo(null);
            return;
        }
        EventOrganizerInfo info = event.getOrganizerInfo() != null ? event.getOrganizerInfo() : new EventOrganizerInfo();
        info.setOrganizerCode(organizer.getOrganizerCode());
        info.setOrganizerName(organizer.getOrganizerName());
        info.setLogoUrl(organizer.getLogoUrl());
        info.setDescription(organizer.getDescription());
        info.setTermsAgreed(organizer.getTermsAgreed());
        info.setAccountStatus(organizer.getAccountStatus());
        info.setEvent(event);
        event.setOrganizerInfo(info);
    }

    private void mapPayoutInfo(Event event, EventWizardRequest.Payout payout) {
        if (payout == null) {
            event.setPayoutInfo(null);
            return;
        }
        EventPayoutInfo info = event.getPayoutInfo() != null ? event.getPayoutInfo() : new EventPayoutInfo();
        info.setAccountHolderName(payout.getAccountHolderName());
        info.setBankNumber(payout.getBankNumber());
        info.setBankName(payout.getBankName());
        info.setEvent(event);
        event.setPayoutInfo(info);
    }

    private void mapInvoiceInfo(Event event, EventWizardRequest.Invoice invoice) {
        if (invoice == null) {
            event.setInvoiceInfo(null);
            return;
        }
        EventInvoiceInfo info = event.getInvoiceInfo() != null ? event.getInvoiceInfo() : new EventInvoiceInfo();
        info.setEnabled(invoice.getEnabled());
        info.setCompanyName(invoice.getCompanyName());
        info.setTaxCode(invoice.getTaxCode());
        info.setAddress(invoice.getAddress());
        info.setEvent(event);
        event.setInvoiceInfo(info);
    }

    private List<EventShowtime> mapShowtimes(Event event, List<EventWizardRequest.Showtime> request) {
        List<EventShowtime> showtimes = new ArrayList<>();
        if (request == null) {
            return showtimes;
        }
        for (EventWizardRequest.Showtime showtimeRequest : request) {
            EventShowtime showtime = EventShowtime.builder()
                    .code(showtimeRequest.getCode())
                    .startTime(showtimeRequest.getStartTime())
                    .endTime(showtimeRequest.getEndTime())
                    .event(event)
                    .build();
            showtimes.add(showtime);
        }
        return showtimes;
    }

    private List<TicketType> mapTicketTypes(Event event, List<EventWizardRequest.TicketType> request) {
        List<TicketType> ticketTypes = new ArrayList<>();
        if (request == null) {
            return ticketTypes;
        }
        for (EventWizardRequest.TicketType ticketTypeRequest : request) {
            TicketType type = TicketType.builder()
                    .code(ticketTypeRequest.getCode())
                    .name(ticketTypeRequest.getName())
                    .price(ticketTypeRequest.getPrice())
                    .quota(ticketTypeRequest.getMaxQuantity())
                    .purchaseLimit(ticketTypeRequest.getPurchaseLimit())
                    .startSale(ticketTypeRequest.getSaleStart())
                    .endSale(ticketTypeRequest.getSaleEnd())
                    .description(ticketTypeRequest.getDescription())
                    .event(event)
                    .build();
            ticketTypes.add(type);
        }
        return ticketTypes;
    }

    private void mapTicketZones(Event event, List<EventWizardRequest.TicketDetail> request, List<TicketType> ticketTypes) {
        event.getTicketZones().clear();
        if (request == null) {
            return;
        }
        Map<String, TicketType> ticketTypeMap = new HashMap<>();
        for (TicketType ticketType : ticketTypes) {
            if (ticketType.getCode() != null) {
                ticketTypeMap.put(ticketType.getCode(), ticketType);
            }
        }
        List<TicketZone> zones = new ArrayList<>();
        for (EventWizardRequest.TicketDetail detail : request) {
            TicketZone zone = TicketZone.builder()
                    .code(detail.getCode())
                    .name(detail.getZoneName())
                    .checkInTime(detail.getCheckInTime())
                    .event(event)
                    .ticketType(ticketTypeMap.get(detail.getTicketTypeCode()))
                    .build();
            zones.add(zone);
        }
        event.setTicketZones(zones);
    }

    private void mapAllocations(List<EventShowtime> showtimes, List<EventWizardRequest.Allocation> request, List<TicketType> ticketTypes) {
        if (showtimes == null) {
            return;
        }
        Map<String, EventShowtime> showtimeMap = new HashMap<>();
        for (EventShowtime showtime : showtimes) {
            if (showtime.getCode() != null) {
                showtimeMap.put(showtime.getCode(), showtime);
            }
        }
        Map<String, TicketType> ticketTypeMap = new HashMap<>();
        for (TicketType ticketType : ticketTypes) {
            if (ticketType.getCode() != null) {
                ticketTypeMap.put(ticketType.getCode(), ticketType);
            }
        }
        if (request == null) {
            return;
        }
        for (EventWizardRequest.Allocation allocationRequest : request) {
            EventShowtime showtime = showtimeMap.get(allocationRequest.getShowtimeCode());
            if (showtime == null) {
                continue;
            }
            ShowtimeTicketAllocation allocation = ShowtimeTicketAllocation.builder()
                    .showtime(showtime)
                    .ticketType(ticketTypeMap.get(allocationRequest.getTicketTypeCode()))
                    .quantity(allocationRequest.getQuantity())
                    .build();
            showtime.getAllocations().add(allocation);
        }
    }

    private void calculateQuotasFromAllocations(List<TicketType> ticketTypes, List<EventShowtime> showtimes) {
        if (ticketTypes == null || showtimes == null) {
            return;
        }
        Map<String, Integer> ticketTypeTotalQuota = new HashMap<>();
        
        // Calculate total allocation for each ticket type across all showtimes
        for (EventShowtime showtime : showtimes) {
            if (showtime.getAllocations() == null) {
                continue;
            }
            for (ShowtimeTicketAllocation allocation : showtime.getAllocations()) {
                if (allocation.getTicketType() != null && allocation.getTicketType().getCode() != null) {
                    String code = allocation.getTicketType().getCode();
                    Integer quantity = allocation.getQuantity() != null ? allocation.getQuantity() : 0;
                    ticketTypeTotalQuota.put(code, ticketTypeTotalQuota.getOrDefault(code, 0) + quantity);
                }
            }
        }
        
        // Set quota for each ticket type based on total allocation
        for (TicketType ticketType : ticketTypes) {
            if (ticketType.getCode() != null) {
                Integer totalQuota = ticketTypeTotalQuota.getOrDefault(ticketType.getCode(), 0);
                ticketType.setQuota(totalQuota);
            }
        }
    }

    private void applyEventTimesFromShowtimes(Event event, List<EventShowtime> showtimes) {
        if (showtimes == null || showtimes.isEmpty()) {
            return;
        }
        event.setStartTime(showtimes.stream()
                .map(EventShowtime::getStartTime)
                .filter(t -> t != null)
                .min(Comparator.naturalOrder())
                .orElse(event.getStartTime()));
        event.setEndTime(showtimes.stream()
                .map(EventShowtime::getEndTime)
                .filter(t -> t != null)
                .max(Comparator.naturalOrder())
                .orElse(event.getEndTime()));
    }

    private void validateWizardRequest(EventWizardRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new RuntimeException("Event name is required.");
        }
        if (request.getCategory() == null || request.getCategory().isBlank()) {
            throw new RuntimeException("Event category is required.");
        }
        if (request.getOrganizer() == null || request.getOrganizer().getTermsAgreed() == null || !request.getOrganizer().getTermsAgreed()) {
            throw new RuntimeException("Terms agreement is required.");
        }
        if (request.getShowtimes() == null || request.getShowtimes().isEmpty()) {
            throw new RuntimeException("At least one showtime is required.");
        }
        if (request.getTicketTypes() == null || request.getTicketTypes().isEmpty()) {
            throw new RuntimeException("At least one ticket type is required.");
        }
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private void syncTicketConfig(EventWizardRequest request, Event event) {
        if (request == null || event == null) {
            return;
        }
        try {
            TicketConfigSyncRequest syncRequest = new TicketConfigSyncRequest();
            syncRequest.setEventId(event.getId());
            syncRequest.setEventCode(event.getEventCode());
            syncRequest.setShowtimes(mapSyncShowtimes(request));
            syncRequest.setTicketTypes(mapSyncTicketTypes(request));
            syncRequest.setTicketDetails(mapSyncTicketDetails(request));
            syncRequest.setAllocations(mapSyncAllocations(request));
            ticketServiceClient.syncTicketConfig(syncRequest);
        } catch (Exception ex) {
            log.warn("Ticket config sync failed for event {}: {}", event.getId(), ex.getMessage());
        }
    }

    private List<TicketConfigSyncRequest.Showtime> mapSyncShowtimes(EventWizardRequest request) {
        if (request.getShowtimes() == null) {
            return List.of();
        }
        return request.getShowtimes().stream().map(showtime -> {
            TicketConfigSyncRequest.Showtime sync = new TicketConfigSyncRequest.Showtime();
            sync.setCode(showtime.getCode());
            sync.setStartTime(showtime.getStartTime());
            sync.setEndTime(showtime.getEndTime());
            return sync;
        }).toList();
    }

    private List<TicketConfigSyncRequest.TicketType> mapSyncTicketTypes(EventWizardRequest request) {
        if (request.getTicketTypes() == null) {
            return List.of();
        }
        return request.getTicketTypes().stream().map(type -> {
            TicketConfigSyncRequest.TicketType sync = new TicketConfigSyncRequest.TicketType();
            sync.setCode(type.getCode());
            sync.setName(type.getName());
            sync.setPrice(type.getPrice());
            sync.setMaxQuantity(type.getMaxQuantity());
            sync.setSaleStart(type.getSaleStart());
            sync.setSaleEnd(type.getSaleEnd());
            sync.setDescription(type.getDescription());
            return sync;
        }).toList();
    }

    private List<TicketConfigSyncRequest.TicketDetail> mapSyncTicketDetails(EventWizardRequest request) {
        if (request.getTicketDetails() == null) {
            return List.of();
        }
        return request.getTicketDetails().stream().map(detail -> {
            TicketConfigSyncRequest.TicketDetail sync = new TicketConfigSyncRequest.TicketDetail();
            sync.setCode(detail.getCode());
            sync.setZoneName(detail.getZoneName());
            sync.setTicketTypeCode(detail.getTicketTypeCode());
            sync.setCheckInTime(detail.getCheckInTime());
            return sync;
        }).toList();
    }

    private List<TicketConfigSyncRequest.Allocation> mapSyncAllocations(EventWizardRequest request) {
        if (request.getAllocations() == null) {
            return List.of();
        }
        return request.getAllocations().stream().map(allocation -> {
            TicketConfigSyncRequest.Allocation sync = new TicketConfigSyncRequest.Allocation();
            sync.setShowtimeCode(allocation.getShowtimeCode());
            sync.setTicketTypeCode(allocation.getTicketTypeCode());
            sync.setQuantity(allocation.getQuantity());
            return sync;
        }).toList();
    }

    @Transactional
    public TicketType decrementTicketQuota(Long ticketTypeId, Integer quantity) {
        if (quantity == null || quantity < 1) {
            throw new IllegalArgumentException("Quantity must be at least 1");
        }
        TicketType ticketType = ticketTypeRepository.findById(ticketTypeId)
                .orElseThrow(() -> new RuntimeException("Ticket type not found"));
        Integer quota = ticketType.getQuota();
        if (quota == null) {
            throw new RuntimeException("Ticket quota not configured for ticket type " + ticketTypeId);
        }
        if (quota < quantity) {
            throw new RuntimeException("Not enough tickets available for ticket type " + ticketTypeId);
        }
        ticketType.setQuota(quota - quantity);
        return ticketTypeRepository.save(ticketType);
    }

    public void deleteTicketType(Long ticketTypeId) {
        ticketTypeRepository.deleteById(ticketTypeId);
    }

    // Methods for Discount management
    public Discount addDiscountToEvent(Long eventId, Discount discount) {
        Event event = getById(eventId);
        discount.setEvent(event);
        return discountRepository.save(discount);
    }

    public List<Discount> getDiscountsForEvent(Long eventId) {
        return discountRepository.findByEventId(eventId);
    }

    public void deleteDiscount(Long discountId) {
        discountRepository.deleteById(discountId);
    }

    // New method to validate discount code for Feign client
    public Optional<Discount> validateDiscountCode(Long eventId, String code) {
        return discountRepository.findByEventIdAndCode(eventId, code);
    }

    @Transactional
    public void incrementDiscountUsedCount(Long discountId) {
        Discount discount = discountRepository.findById(discountId)
                .orElseThrow(() -> new RuntimeException("Discount not found with id: " + discountId));
        if (discount.getUsedCount() == null) {
            discount.setUsedCount(0);
        }
        discount.setUsedCount(discount.getUsedCount() + 1);
        discountRepository.save(discount);
    }

    // Methods for Seat management
    public List<Seat> addSeatsToEvent(Long eventId, List<Seat> seats) {
        Event event = getById(eventId);
        seats.forEach(seat -> seat.setEvent(event));
        return seatRepository.saveAll(seats);
    }

    // Modified getSeatsForEvent to include real-time availability from reservations
    public List<Seat> getSeatsForEvent(Long eventId) {
        List<Seat> seats = seatRepository.findByEventId(eventId);
        List<ReservationDto> activeReservations = orderServiceClient.getActiveReservationsForEvent(eventId);

        // Collect seatIds that are currently reserved
        Set<Long> reservedSeatIds = activeReservations.stream()
                .filter(r -> r.getSeatId() != null)
                .map(ReservationDto::getSeatId)
                .collect(Collectors.toSet());

        // Update the availability status of seats based on reservations
        return seats.stream().map(seat -> {
            // If a seat is explicitly locked by an organizer, it remains locked
            // Otherwise, check if it's reserved
            if (!seat.getLocked() && reservedSeatIds.contains(seat.getId())) {
                seat.setIsAvailable(false); // Mark as unavailable due to reservation
            }
            return seat;
        }).collect(Collectors.toList());
    }

    public void updateSeatAvailability(Long seatId, Boolean isAvailable) {
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new RuntimeException("Seat not found"));
        seat.setIsAvailable(isAvailable);
        seatRepository.save(seat);
    }

    public void updateSeatLockStatus(Long seatId, Boolean locked) {
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new RuntimeException("Seat not found"));
        seat.setLocked(locked);
        seatRepository.save(seat);
    }

    // New method to get event transfer policies
    public EventTransferPolicyDto getEventTransferPolicy(Long eventId) {
        Event event = getById(eventId);
        return EventTransferPolicyDto.builder()
                .allowTicketTransfer(event.getAllowTicketTransfer())
                .allowAttendeeNameChange(event.getAllowAttendeeNameChange())
                .build();
    }

    public Page<Event> searchEvents(String keyword, String category, LocalDateTime startTime, LocalDateTime endTime, BigDecimal minPrice, BigDecimal maxPrice, String location, Event.Status status, Pageable pageable) {
        Specification<Event> spec = EventSpecification.withFilters(keyword, category, startTime, endTime, minPrice, maxPrice, location, status);
        return eventRepository.findAll(spec, pageable);
    }
}
