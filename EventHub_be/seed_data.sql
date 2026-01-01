-- Roles
INSERT IGNORE INTO ticket_store_db.roles (id, name, description) VALUES (1, 'ADMIN', 'Administrator role');
INSERT IGNORE INTO ticket_store_db.roles (id, name, description) VALUES (2, 'ORGANIZER', 'Event Organizer role');
INSERT IGNORE INTO ticket_store_db.roles (id, name, description) VALUES (3, 'USER', 'Regular User role');
INSERT IGNORE INTO ticket_store_db.roles (id, name, description) VALUES (4, 'STAFF', 'STAFF User role');

-- Permissions
INSERT IGNORE INTO ticket_store_db.permissions (id, name, description) VALUES (1, 'user:read', 'Read user information');
INSERT IGNORE INTO ticket_store_db.permissions (id, name, description) VALUES (2, 'user:write', 'Update user information');
INSERT IGNORE INTO ticket_store_db.permissions (id, name, description) VALUES (3, 'event:create', 'Create events');
INSERT IGNORE INTO ticket_store_db.permissions (id, name, description) VALUES (4, 'event:publish', 'Publish events');

-- Role Permissions
INSERT IGNORE INTO ticket_store_db.role_permissions (role_id, permission_id) VALUES (1, 1);
INSERT IGNORE INTO ticket_store_db.role_permissions (role_id, permission_id) VALUES (1, 2);
INSERT IGNORE INTO ticket_store_db.role_permissions (role_id, permission_id) VALUES (1, 3);
INSERT IGNORE INTO ticket_store_db.role_permissions (role_id, permission_id) VALUES (1, 4);
INSERT IGNORE INTO ticket_store_db.role_permissions (role_id, permission_id) VALUES (2, 1);
INSERT IGNORE INTO ticket_store_db.role_permissions (role_id, permission_id) VALUES (2, 3);
INSERT IGNORE INTO ticket_store_db.role_permissions (role_id, permission_id) VALUES (3, 1);

-- Users (UUIDs are simplified for readability in seed, usually generated)
-- Admin User (ID: 11111111111111111111111111111111)
INSERT IGNORE INTO ticket_store_db.users (id, email, full_name, password_hash, status, created_at, updated_at) 
VALUES (UNHEX('11111111111111111111111111111111'), 'admin@test.com', 'Admin User', '$2a$10$NotARealHashButGoodEnoughForSeed', 'ACTIVE', NOW(), NOW());

-- Organizer User (ID: 22222222222222222222222222222222)
INSERT IGNORE INTO ticket_store_db.users (id, email, full_name, password_hash, status, created_at, updated_at)
VALUES (UNHEX('22222222222222222222222222222222'), 'organizer@test.com', 'Organizer User', '$2a$10$NotARealHashButGoodEnoughForSeed', 'ACTIVE', NOW(), NOW());

-- Regular User (ID: 33333333333333333333333333333333)
INSERT IGNORE INTO ticket_store_db.users (id, email, full_name, password_hash, status, created_at, updated_at)
VALUES (UNHEX('33333333333333333333333333333333'), 'user@test.com', 'Regular User', '$2a$10$NotARealHashButGoodEnoughForSeed', 'ACTIVE', NOW(), NOW());

-- Organizations
INSERT IGNORE INTO ticket_store_db.organizations (id, name, description, owner_user_id, status, created_at, updated_at)
VALUES (UNHEX('AAAAAAAAAAAAAAAABBBBBBBBBBBBBBBB'), 'Awesome Events Co.', 'Best events in town', UNHEX('22222222222222222222222222222222'), 'ACTIVE', NOW(), NOW());

-- User Organization Roles
INSERT IGNORE INTO ticket_store_db.user_organization_roles (organization_id, user_id, role_id)
VALUES (UNHEX('AAAAAAAAAAAAAAAABBBBBBBBBBBBBBBB'), UNHEX('22222222222222222222222222222222'), 2);

-- Venues
INSERT IGNORE INTO ticket_store_db.venues (id, name, address, city, capacity)
VALUES (1, 'Grand Concert Hall', '123 Music Ave', 'Hanoi', 5000);

INSERT IGNORE INTO ticket_store_db.venues (id, name, address, city, capacity)
VALUES (2, 'Tech Convention Center', '456 Innovation Blvd', 'Ho Chi Minh City', 10000);

-- Events
-- Event 1: Published Concert
INSERT IGNORE INTO ticket_store_db.events (id, name, description, category, start_time, end_time, venue_id, organizer_id, status, created_at, updated_at, allow_ticket_transfer, refund_enabled)
VALUES (1, 'Summer Music Festival', 'The biggest music festival of the year', 'MUSIC', DATE_ADD(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 31 DAY), 1, UNHEX('AAAAAAAAAAAAAAAABBBBBBBBBBBBBBBB'), 'PUBLISHED', NOW(), NOW(), 1, 1);

-- Event 2: Draft Tech Talk
INSERT IGNORE INTO ticket_store_db.events (id, name, description, category, start_time, end_time, venue_id, organizer_id, status, created_at, updated_at, allow_ticket_transfer, refund_enabled)
VALUES (2, 'Future of AI', 'A deep dive into Artificial Intelligence', 'CONFERENCE', DATE_ADD(NOW(), INTERVAL 60 DAY), DATE_ADD(NOW(), INTERVAL 62 DAY), 2, UNHEX('AAAAAAAAAAAAAAAABBBBBBBBBBBBBBBB'), 'DRAFT', NOW(), NOW(), 0, 0);

-- Event 3: Pending Approval Concert
INSERT IGNORE INTO ticket_store_db.events (id, name, description, category, start_time, end_time, venue_id, organizer_id, status, created_at, updated_at, allow_ticket_transfer, refund_enabled)
VALUES (3, 'International Jazz Night', 'Evening of smooth jazz from global artists', 'MUSIC', DATE_ADD(NOW(), INTERVAL 45 DAY), DATE_ADD(NOW(), INTERVAL 45 DAY), 1, UNHEX('AAAAAAAAAAAAAAAABBBBBBBBBBBBBBBB'), 'PENDING_APPROVAL', NOW(), NOW(), 1, 1);

-- Event 4: Published Sports Event
INSERT IGNORE INTO ticket_store_db.events (id, name, description, category, start_time, end_time, venue_id, organizer_id, status, created_at, updated_at, allow_ticket_transfer, refund_enabled)
VALUES (4, 'City Marathon 2026', 'Run through the heart of the city', 'SPORTS', DATE_ADD(NOW(), INTERVAL 15 DAY), DATE_ADD(NOW(), INTERVAL 15 DAY), 2, UNHEX('AAAAAAAAAAAAAAAABBBBBBBBBBBBBBBB'), 'PUBLISHED', NOW(), NOW(), 0, 1);

-- Event 5: Cancelled Theater Show
INSERT IGNORE INTO ticket_store_db.events (id, name, description, category, start_time, end_time, venue_id, organizer_id, status, created_at, updated_at, allow_ticket_transfer, refund_enabled)
VALUES (5, 'Shakespeare in the Park', 'A modern take on Romeo and Juliet', 'THEATER', DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY), 1, UNHEX('AAAAAAAAAAAAAAAABBBBBBBBBBBBBBBB'), 'CANCELLED', NOW(), NOW(), 1, 0);

-- Ticket Types
-- For Event 1
INSERT IGNORE INTO ticket_store_db.ticket_types (id, event_id, name, price, quota, purchase_limit, start_sale, end_sale)
VALUES (1, 1, 'VIP Pass', 150.00, 100, 2, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY));

INSERT IGNORE INTO ticket_store_db.ticket_types (id, event_id, name, price, quota, purchase_limit, start_sale, end_sale)
VALUES (2, 1, 'General Admission', 50.00, 4000, 4, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY));

-- For Event 2
INSERT IGNORE INTO ticket_store_db.ticket_types (id, event_id, name, price, quota, purchase_limit, start_sale, end_sale)
VALUES (3, 2, 'Early Bird', 200.00, 500, 1, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY));

-- For Event 3
INSERT IGNORE INTO ticket_store_db.ticket_types (id, event_id, name, price, quota, purchase_limit, start_sale, end_sale)
VALUES (4, 3, 'Standard Entry', 75.00, 300, 2, DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 44 DAY));

-- For Event 4
INSERT IGNORE INTO ticket_store_db.ticket_types (id, event_id, name, price, quota, purchase_limit, start_sale, end_sale)
VALUES (5, 4, 'Runner Registration', 40.00, 2000, 1, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_ADD(NOW(), INTERVAL 14 DAY));

-- For Event 5
INSERT IGNORE INTO ticket_store_db.ticket_types (id, event_id, name, price, quota, purchase_limit, start_sale, end_sale)
VALUES (6, 5, 'Stage Side', 120.00, 50, 2, DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_ADD(NOW(), INTERVAL 4 DAY));

-- Seats (Sample for VIP)
INSERT IGNORE INTO ticket_store_db.seats (id, event_id, ticket_type_id, section, row_label, seat_number, is_available, locked)
VALUES (1, 1, 1, 'A', '1', '1', 1, 0);
INSERT IGNORE INTO ticket_store_db.seats (id, event_id, ticket_type_id, section, row_label, seat_number, is_available, locked)
VALUES (2, 1, 1, 'A', '1', '2', 1, 0);
INSERT IGNORE INTO ticket_store_db.seats (id, event_id, ticket_type_id, section, row_label, seat_number, is_available, locked)
VALUES (3, 1, 1, 'A', '1', '3', 0, 0); -- Sold

-- Discounts
INSERT IGNORE INTO ticket_store_db.discounts (id, event_id, code, discount_percent, valid_from, valid_to, usage_limit, used_count)
VALUES (1, 1, 'SUMMER10', 10, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 1000, 0);

-- Orders
-- Order 1: User buys 1 VIP ticket
INSERT IGNORE INTO ticket_store_db.orders (id, user_id, event_id, total_amount, status, created_at, updated_at)
VALUES (1, UNHEX('33333333333333333333333333333333'), 1, 150.00, 'PAID', NOW(), NOW());

-- Order Items
INSERT IGNORE INTO ticket_store_db.order_items (id, order_id, ticket_type_id, price)
VALUES (1, 1, 1, 150.00);

-- Tickets
-- Ticket for the order item above
INSERT IGNORE INTO ticket_store_db.tickets (id, event_id, order_id, user_id, seat_id, status, ticket_code, attendee_name, attendee_email, created_at, updated_at)
VALUES (1, 1, 1, '33333333-3333-3333-3333-333333333333', 3, 'ISSUED', 'TICKET-ABC-123', 'Regular User', 'user@test.com', NOW(), NOW());
