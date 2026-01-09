-- SQL Script to create default showtimes for legacy events without showtimes
-- and populate showtime_code for their tickets

-- Step 1: Create default showtime for events that don't have any
INSERT INTO event_showtimes (code, start_time, end_time, event_id)
SELECT 
  'DEFAULT' as code,
  e.start_time,
  e.end_time,
  e.id as event_id
FROM events e
WHERE NOT EXISTS (
  SELECT 1 FROM event_showtimes es WHERE es.event_id = e.id
)
AND e.id IN (
  SELECT DISTINCT event_id FROM tickets WHERE showtime_code IS NULL
);

-- Step 2: Create allocations for all ticket types to the default showtime
INSERT INTO showtime_ticket_allocations (showtime_id, ticket_type_id, quantity)
SELECT 
  es.id as showtime_id,
  tt.id as ticket_type_id,
  COALESCE(tt.quota, 1000) as quantity
FROM ticket_types tt
INNER JOIN event_showtimes es ON tt.event_id = es.event_id
WHERE es.code = 'DEFAULT'
  AND NOT EXISTS (
    SELECT 1 FROM showtime_ticket_allocations sta 
    WHERE sta.showtime_id = es.id AND sta.ticket_type_id = tt.id
  );

-- Step 3: Update showtime_code for tickets that still don't have it
UPDATE tickets t
INNER JOIN showtime_ticket_allocations sta ON t.ticket_type_id = sta.ticket_type_id
INNER JOIN event_showtimes es ON sta.showtime_id = es.id
SET t.showtime_code = es.code
WHERE t.showtime_code IS NULL
  AND t.ticket_type_id IS NOT NULL;

-- Verification: Check results
SELECT 
  'After migration - Tickets missing showtime_code' as status,
  COUNT(*) as count
FROM tickets
WHERE showtime_code IS NULL
UNION ALL
SELECT 
  'After migration - Total tickets' as status,
  COUNT(*) as count
FROM tickets
UNION ALL
SELECT 
  'Events with DEFAULT showtime' as status,
  COUNT(*) as count
FROM event_showtimes
WHERE code = 'DEFAULT';

-- Show sample of fixed tickets
SELECT 
  t.id,
  t.ticket_code,
  t.event_id,
  t.ticket_type_id,
  t.showtime_code,
  tt.name as ticket_type_name
FROM tickets t
LEFT JOIN ticket_types tt ON t.ticket_type_id = tt.id
WHERE t.id IN (1,2,3,4,5,6);
