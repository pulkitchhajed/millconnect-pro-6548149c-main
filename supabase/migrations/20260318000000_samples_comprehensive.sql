-- Comprehensive migration for Sample Requests and Sample Packs
-- This collates the creation of both tables into a single script.

-- 1. Create Sample Packs table
CREATE TABLE IF NOT EXISTS public.sample_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  pack_type TEXT NOT NULL, -- 'category' or 'custom'
  category TEXT,           -- nullable, if pack_type is 'category'
  max_items INTEGER,       -- nullable, if pack_type is 'custom'
  price NUMERIC NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create Sample Requests table
CREATE TABLE IF NOT EXISTS public.sample_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fabric_id UUID REFERENCES public.fabrics(id) ON DELETE CASCADE, -- Nullable if it's a category/pack request
  fabric_name TEXT,
  fabric_image TEXT,
  delivery_address TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  admin_notes TEXT,
  sample_pack_id UUID REFERENCES public.sample_packs(id),
  price NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sample_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sample_requests ENABLE ROW LEVEL SECURITY;

-- Sample Packs Policies
CREATE POLICY "Public can view active sample_packs" 
  ON public.sample_packs FOR SELECT 
  USING (active = true OR public.is_admin(auth.uid()));

CREATE POLICY "Admins manage sample_packs" 
  ON public.sample_packs FOR ALL 
  USING (public.is_admin(auth.uid()));

-- Sample Requests Policies
CREATE POLICY "Buyers can view own sample_requests"
  ON public.sample_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Buyers can insert sample_requests"
  ON public.sample_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage sample_requests"
  ON public.sample_requests FOR ALL
  USING (public.is_admin(auth.uid()));

-- Trigger for updated_at on sample_packs (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_sample_packs') THEN
        CREATE TRIGGER set_updated_at_sample_packs
        BEFORE UPDATE ON public.sample_packs
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- Trigger for updated_at on sample_requests (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_sample_requests') THEN
        CREATE TRIGGER set_updated_at_sample_requests
        BEFORE UPDATE ON public.sample_requests
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;
