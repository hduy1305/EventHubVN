-- SQL Script to populate ticket_type_id and showtime_code for legacy tickets
-- This script assumes:
-- 1. Each order has order_items that link to ticket_types
-- 2. Each ticket_type may be allocated to one or more showtimes
-- 3. We'll use the first allocated showtime if multiple exist

-- Step 1: Update ticket_type_id from order_items
-- Match tickets to order_items based on order_id and event_id
UPDATE tickets t
INNER JOIN orders o ON t.order_id = o.id
INNER JOIN order_items oi ON o.id = oi.order_id
SET t.ticket_type_id = oi.ticket_type_id
WHERE t.ticket_type_id IS NULL
  AND t.event_id = o.event_id;

-- Step 2: Update showtime_code based on ticket_type_id allocation
-- For each ticket, find the showtime allocated to its ticket_type
UPDATE tickets t
INNER JOIN showtime_ticket_allocations sta ON t.ticket_type_id = sta.ticket_type_id
INNER JOIN event_showtimes es ON sta.showtime_id = es.id
SET t.showtime_code = es.code
WHERE t.showtime_code IS NULL
  AND t.ticket_type_id IS NOT NULL;

-- Verification queries:
-- Check how many tickets still need updates
SELECT 
  'Tickets missing ticket_type_id' as status,
  COUNT(*) as count
FROM tickets
WHERE ticket_type_id IS NULL
UNION ALL
SELECT 
  'Tickets missing showtime_code' as status,
  COUNT(*) as count
FROM tickets
WHERE showtime_code IS NULL
UNION ALL
SELECT 
  'Total tickets' as status,
  COUNT(*) as count
FROM tickets;

-- Show sample of updated tickets
SELECT 
  t.id,
  t.ticket_code,
  t.ticket_type_id,
  t.showtime_code,
  tt.name as ticket_type_name,
  t.event_id
FROM tickets t
LEFT JOIN ticket_types tt ON t.ticket_type_id = tt.id
ORDER BY t.id DESC
LIMIT 10;
