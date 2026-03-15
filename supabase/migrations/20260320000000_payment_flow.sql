-- Add payment flow columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS advance_payment_amount NUMERIC DEFAULT 5000,
ADD COLUMN IF NOT EXISTS payment_link TEXT,
ADD COLUMN IF NOT EXISTS payment_message TEXT;

-- Update status check constraint if necessary (Supabase doesn't always have check constraints on table level, but good to know)
-- Adding comment for reference
COMMENT ON COLUMN orders.status IS 'Status lifecycle: Pending, Confirmed, Advance Payment Received, Bill Amount Received, Staged, Shipped, Delivered, Cancelled';
