-- Add billing_name and gst_name columns to profiles and orders tables
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS billing_name TEXT NOT NULL DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gst_legal_name TEXT NOT NULL DEFAULT '';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS billing_name TEXT NOT NULL DEFAULT '';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS gst_legal_name TEXT NOT NULL DEFAULT '';
