-- ============================================================
-- Event Service Data
-- ============================================================

-- 1. Venues
INSERT IGNORE INTO venues (id, name, address, city, capacity, map_image) VALUES
(1, 'Grand Stadium', '1 Stadium Dr', 'Metropolis', 50000, 'https://placehold.co/600x400?text=Stadium+Map'),
(2, 'Community Theater', '42 Arts Way', 'Smalltown', 500, 'https://placehold.co/600x400?text=Theater+Map'),
(3, 'The Underground Club', '99 Basement St', 'Nightcity', 200, NULL);

-- 2. Events
-- Event 1: Rock Concert (Stadium, Unseated)
INSERT IGNORE INTO events (id, organizer_id, name, description, category, start_time, end_time, venue_id, cover_image, status, allow_ticket_transfer, allow_attendee_name_change, refund_enabled, refund_deadline_hours, refund_fee_percent, created_at, updated_at)
VALUES (1, UNHEX(REPLACE('00000000-0000-0000-0000-000000000002', '-', '')), 'Summer Rock Fest 2025', 'The biggest rock festival of the summer featuring top bands.', 'Music', '2025-07-15 18:00:00', '2025-07-15 23:00:00', 1, 'https://placehold.co/800x400?text=Rock+Fest', 'PUBLISHED', 1, 1, 1, 48, 0.10, NOW(), NOW());

-- Event 2: Tech Conference (Theater, Seated)
INSERT IGNORE INTO events (id, organizer_id, name, description, category, start_time, end_time, venue_id, cover_image, status, allow_ticket_transfer, allow_attendee_name_change, refund_enabled, refund_deadline_hours, refund_fee_percent, created_at, updated_at)
VALUES (2, UNHEX(REPLACE('00000000-0000-0000-0000-000000000002', '-', '')), 'Future Tech Summit', 'A deep dive into AI, Quantum Computing, and Web3.', 'Conference', '2025-09-10 09:00:00', '2025-09-12 17:00:00', 2, 'https://placehold.co/800x400?text=Tech+Summit', 'PUBLISHED', 0, 1, 1, 72, 0.05, NOW(), NOW());

-- Event 3: Jazz Night (Club, Unseated)
INSERT IGNORE INTO events (id, organizer_id, name, description, category, start_time, end_time, venue_id, cover_image, status, allow_ticket_transfer, allow_attendee_name_change, refund_enabled, refund_deadline_hours, refund_fee_percent, created_at, updated_at)
VALUES (3, UNHEX(REPLACE('00000000-0000-0000-0000-000000000002', '-', '')), 'Smooth Jazz Night', 'Relaxing jazz tunes all night long.', 'Music', '2025-08-05 20:00:00', '2025-08-05 23:59:00', 3, 'https://placehold.co/800x400?text=Jazz+Night', 'DRAFT', 1, 1, 0, 0, 0, NOW(), NOW());

-- Event 4: Classical Night (Theater, Seated)
INSERT IGNORE INTO events (id, organizer_id, name, description, category, start_time, end_time, venue_id, cover_image, status, allow_ticket_transfer, allow_attendee_name_change, refund_enabled, refund_deadline_hours, refund_fee_percent, created_at, updated_at)
VALUES (4, UNHEX(REPLACE('00000000-0000-0000-0000-000000000002', '-', '')), 'Classical Night', 'Mozart, Beethoven, and more.', 'Arts', '2025-10-20 19:00:00', '2025-10-20 22:00:00', 2, 'https://placehold.co/800x400?text=Classical', 'PUBLISHED', 1, 0, 1, 24, 0.00, NOW(), NOW());

-- Event 5: Python Workshop (Club, Unseated)
INSERT IGNORE INTO events (id, organizer_id, name, description, category, start_time, end_time, venue_id, cover_image, status, allow_ticket_transfer, allow_attendee_name_change, refund_enabled, refund_deadline_hours, refund_fee_percent, created_at, updated_at)
VALUES (5, UNHEX(REPLACE('00000000-0000-0000-0000-000000000002', '-', '')), 'Python Masterclass', 'Learn Python from experts.', 'Workshop', '2025-11-15 10:00:00', '2025-11-15 16:00:00', 3, 'https://placehold.co/800x400?text=Python', 'PUBLISHED', 1, 1, 1, 48, 0.20, NOW(), NOW());

-- 3. Ticket Types
-- For Event 1 (Rock Fest)
INSERT IGNORE INTO ticket_types (id, name, event_id, price, quota, purchase_limit, start_sale, end_sale) VALUES
(1, 'General Admission', 1, 50.00, 10000, 6, '2025-01-01 00:00:00', '2025-07-15 17:00:00'),
(2, 'VIP Pit', 1, 150.00, 500, 4, '2025-01-01 00:00:00', '2025-07-15 17:00:00');

-- For Event 2 (Tech Summit)
INSERT IGNORE INTO ticket_types (id, name, event_id, price, quota, purchase_limit, start_sale, end_sale) VALUES
(3, 'Standard Pass', 2, 299.00, 400, 2, '2025-03-01 00:00:00', '2025-09-09 23:59:00'),
(4, 'Student Pass', 2, 99.00, 50, 1, '2025-03-01 00:00:00', '2025-09-09 23:59:00');

-- For Event 4 (Classical)
INSERT IGNORE INTO ticket_types (id, name, event_id, price, quota, purchase_limit, start_sale, end_sale) VALUES
(5, 'Orchestra', 4, 80.00, 200, 4, '2025-01-01 00:00:00', '2025-10-20 18:00:00'),
(6, 'Balcony', 4, 40.00, 300, 4, '2025-01-01 00:00:00', '2025-10-20 18:00:00');

-- For Event 5 (Python)
INSERT IGNORE INTO ticket_types (id, name, event_id, price, quota, purchase_limit, start_sale, end_sale) VALUES
(7, 'Entry', 5, 20.00, 50, 1, '2025-01-01 00:00:00', '2025-11-15 09:00:00');

-- 4. Seats (For Event 2 - Tech Summit)
-- Generating a few rows of seats
INSERT IGNORE INTO seats (event_id, ticket_type_id, section, row_label, seat_number, seat_category, is_available, locked) VALUES
(2, 3, 'Orchestra', 'A', '1', 'Standard', 1, 0),
(2, 3, 'Orchestra', 'A', '2', 'Standard', 1, 0),
(2, 3, 'Orchestra', 'A', '3', 'Standard', 1, 0),
(2, 3, 'Orchestra', 'A', '4', 'Standard', 1, 0),
(2, 3, 'Orchestra', 'B', '1', 'Standard', 1, 0),
(2, 3, 'Orchestra', 'B', '2', 'Standard', 1, 0),
(2, 4, 'Balcony', 'AA', '1', 'Student', 1, 0),
(2, 4, 'Balcony', 'AA', '2', 'Student', 1, 0);

-- 5. Discounts
INSERT IGNORE INTO discounts (code, discount_percent, discount_amount, minimum_order_amount, usage_limit, used_count, valid_from, valid_to, event_id) VALUES
('EARLYBIRD25', 10, NULL, 0, 100, 0, '2025-01-01 00:00:00', '2025-03-01 00:00:00', 1),
('STUDENT10', NULL, 10.00, 50.00, 500, 0, '2025-01-01 00:00:00', '2025-12-31 23:59:00', 1);