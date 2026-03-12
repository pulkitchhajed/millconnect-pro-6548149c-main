-- Add gst_number column to profiles and orders tables
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gst_number TEXT NOT NULL DEFAULT '';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS gst_number TEXT NOT NULL DEFAULT '';
