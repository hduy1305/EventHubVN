-- ============================================================
-- Order Service Data
-- ============================================================

-- 1. Orders
-- Order 1: Alice buys 2 General Admission tickets for Rock Fest
INSERT IGNORE INTO orders (id, user_id, event_id, total_amount, currency, payment_method, status, created_at, updated_at) VALUES
(1, UNHEX(REPLACE('00000000-0000-0000-0000-000000000005', '-', '')), 1, 100.00, 'USD', 'Credit Card', 'PAID', NOW(), NOW());

-- Order 2: Bob buys 1 Standard Pass for Tech Summit
INSERT IGNORE INTO orders (id, user_id, event_id, total_amount, currency, payment_method, status, created_at, updated_at) VALUES
(2, UNHEX(REPLACE('00000000-0000-0000-0000-000000000006', '-', '')), 2, 299.00, 'USD', 'PayPal', 'PAID', NOW(), NOW());

-- 2. Order Items
-- For Order 1
INSERT IGNORE INTO order_items (id, order_id, ticket_type_id, price) VALUES
(1, 1, 1, 50.00), -- Ticket 1
(2, 1, 1, 50.00); -- Ticket 2

-- For Order 2
INSERT IGNORE INTO order_items (id, order_id, ticket_type_id, price) VALUES
(3, 2, 3, 299.00); -- Ticket 1

-- 3. Tickets
-- For Order 1 (Rock Fest - Unseated)
INSERT IGNORE INTO tickets (id, order_item_id, ticket_code, attendee_name, attendee_email, status, created_at, updated_at) VALUES
(1, 1, 'ROCK-ALICE-001', 'Alice Wonderland', 'alice@test.com', 'ISSUED', NOW(), NOW()),
(2, 2, 'ROCK-ALICE-002', 'Alice Friend', 'alice@test.com', 'ISSUED', NOW(), NOW());

-- For Order 2 (Tech Summit - Seated)
INSERT IGNORE INTO tickets (id, order_item_id, ticket_code, attendee_name, attendee_email, status, seat_id, created_at, updated_at) VALUES
(3, 3, 'TECH-BOB-001', 'Bob Builder', 'bob@test.com', 'ISSUED', 1, NOW(), NOW());

-- 4. Payment Info (Mock data for completed payments)
INSERT IGNORE INTO payment_info (order_id, amount, method, status, transaction_id, paid_at) VALUES
(1, 100.00, 'Credit Card', 'SUCCESS', 'tx_1234567890', NOW()),
(2, 299.00, 'PayPal', 'SUCCESS', 'tx_0987654321', NOW());

INSERT IGNORE INTO payment_transactions (order_id, amount, payment_method, status, transaction_id, created_at, updated_at) VALUES
(1, 100.00, 'Credit Card', 'SUCCESS', 'tx_1234567890', NOW(), NOW()),
(2, 299.00, 'PayPal', 'SUCCESS', 'tx_0987654321', NOW(), NOW());
