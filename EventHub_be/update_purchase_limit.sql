-- Update purchase_limit for existing ticket_types
-- Set purchase_limit = quota for all tickets where purchase_limit is NULL

UPDATE ticket_types 
SET purchase_limit = quota 
WHERE purchase_limit IS NULL;

-- Verify the update
SELECT id, code, name, quota, purchase_limit 
FROM ticket_types;
