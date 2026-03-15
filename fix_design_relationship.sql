-- FIX FOR RELATIONSHIP ERROR (PGRST200)
-- This script establishes the explicit foreign key between design_requests and profiles
-- enabling the join query: .select("*, profiles!inner(buyer_name, billing_name)")

-- 1. Ensure the user_id column exists (it should)
-- 2. Drop existing foreign key if it points to auth.users (which Postgrest sometimes struggles to join into public)
ALTER TABLE public.design_requests DROP CONSTRAINT IF EXISTS design_requests_user_id_fkey;

-- 3. Add explicit foreign key to public.profiles
-- This tells Supabase "Every design request belongs to a profile"
ALTER TABLE public.design_requests
ADD CONSTRAINT design_requests_user_id_profiles_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- 4. Add index for faster joins
CREATE INDEX IF NOT EXISTS idx_design_requests_user_id ON public.design_requests(user_id);

-- 5. Force schema reload for Postgrest
NOTIFY pgrst, 'reload schema';
