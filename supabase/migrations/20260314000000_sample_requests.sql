-- Create sample_requests table
CREATE TABLE IF NOT EXISTS public.sample_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fabric_id UUID NOT NULL REFERENCES public.fabrics(id) ON DELETE CASCADE,
  fabric_name TEXT NOT NULL,
  fabric_image TEXT,
  delivery_address TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sample_requests ENABLE ROW LEVEL SECURITY;

-- Buyers can view their own requests
CREATE POLICY "Buyers can view own sample_requests"
  ON public.sample_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Buyers can create sample requests
CREATE POLICY "Buyers can insert sample_requests"
  ON public.sample_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can do everything
CREATE POLICY "Admins manage sample_requests"
  ON public.sample_requests FOR ALL
  USING (public.is_admin(auth.uid()));

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_sample_requests_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

CREATE TRIGGER sample_requests_updated_at
  BEFORE UPDATE ON public.sample_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_sample_requests_updated_at();
