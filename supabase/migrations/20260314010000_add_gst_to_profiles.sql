-- Add gst_number and billing_name columns to profiles if they don't exist
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS gst_number TEXT,
  ADD COLUMN IF NOT EXISTS billing_name TEXT;
