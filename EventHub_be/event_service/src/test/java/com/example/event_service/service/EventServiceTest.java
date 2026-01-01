// package com.example.event_service.service;

// import com.example.event_service.model.Event;
// import com.example.event_service.model.TicketType;
// import com.example.event_service.model.Venue;
// import com.example.event_service.repository.EventRepository;
// import com.example.event_service.repository.TicketTypeRepository;
// import org.junit.jupiter.api.BeforeEach;
// import org.junit.jupiter.api.Test;
// import org.junit.jupiter.api.extension.ExtendWith;
// import org.mockito.InjectMocks;
// import org.mockito.Mock;
// import org.mockito.junit.jupiter.MockitoExtension;
// import org.springframework.data.domain.Page;
// import org.springframework.data.domain.PageImpl;
// import org.springframework.data.domain.Pageable;
// import org.springframework.data.jpa.domain.Specification;

// import java.math.BigDecimal;
// import java.time.LocalDateTime;
// import java.util.Arrays;
// import java.util.Collections;
// import java.util.List;

// import static org.junit.jupiter.api.Assertions.assertEquals;
// import static org.mockito.ArgumentMatchers.any;
// import static org.mockito.Mockito.when;

// @ExtendWith(MockitoExtension.class)
// public class EventServiceTest {

//     @Mock
//     private EventRepository eventRepository;

//     @Mock
//     private TicketTypeRepository ticketTypeRepository;

//     @InjectMocks
//     private EventService eventService;

//     private Event event1;
//     private Event event2;

//     @BeforeEach
//     void setUp() {
//         Venue venue1 = new Venue();
//         venue1.setCity("New York");

//         event1 = Event.builder()
//                 .id(1L)
//                 .name("Rock Concert")
//                 .description("Loud music")
//                 .category("Music")
//                 .startTime(LocalDateTime.now().plusDays(10))
//                 .venue(venue1)
//                 .build();

//         event2 = Event.builder()
//                 .id(2L)
//                 .name("Tech Conference")
//                 .description("Coding stuff")
//                 .category("Tech")
//                 .startTime(LocalDateTime.now().plusDays(20))
//                 .build();
//     }

//     @Test
//     void searchEvents_FilterByName() {
//         when(eventRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(new PageImpl<>(Collections.singletonList(event1)));
        
//         Page<Event> results = eventService.searchEvents("Rock", null, null, null, null, null, null, Pageable.unpaged());
        
//         assertEquals(1, results.getContent().size());
//         assertEquals("Rock Concert", results.getContent().get(0).getName());
//     }

//     @Test
//     void searchEvents_FilterByCategory() {
//         when(eventRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(new PageImpl<>(Collections.singletonList(event2)));

//         Page<Event> results = eventService.searchEvents(null, "Tech", null, null, null, null, null, Pageable.unpaged());

//         assertEquals(1, results.getContent().size());
//         assertEquals("Tech Conference", results.getContent().get(0).getName());
//     }

//     @Test
//     void searchEvents_FilterByPrice() {
//         when(eventRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(new PageImpl<>(Collections.singletonList(event1)));
        
//         Page<Event> results = eventService.searchEvents(null, null, null, null, null, BigDecimal.valueOf(100), null, Pageable.unpaged());

//         assertEquals(1, results.getContent().size());
//         assertEquals("Rock Concert", results.getContent().get(0).getName());
//     }
// }
