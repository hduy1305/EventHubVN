-- Add showtime_id column to order_items table
-- This enables ticket purchases to be mapped to specific showtimes

USE ticket_store_db;

-- Add showtime_id column to order_items
ALTER TABLE order_items ADD COLUMN showtime_id BIGINT NULL;

-- Add index for better query performance
CREATE INDEX idx_order_items_showtime_id ON order_items(showtime_id);

-- Verify the table structure
DESCRIBE order_items;