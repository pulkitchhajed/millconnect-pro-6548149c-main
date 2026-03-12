
-- Fix: Change quantity columns from INTEGER to NUMERIC to support decimal quantities (e.g., 7.2m)
ALTER TABLE public.orders ALTER COLUMN quantity TYPE NUMERIC;
ALTER TABLE public.quote_requests ALTER COLUMN quantity TYPE NUMERIC;

-- Ensure total and price_per_meter are also numeric (they should be already, but being safe)
ALTER TABLE public.orders ALTER COLUMN total TYPE NUMERIC;
ALTER TABLE public.orders ALTER COLUMN price_per_meter TYPE NUMERIC;
ALTER TABLE public.quote_requests ALTER COLUMN quantity TYPE NUMERIC; -- Already did this
